import React, { useEffect } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient'
import Screen from '../components/Screen'
import { getLanguageBigName, getTranslated } from '../lang/helper'
import { addExternalAddress, addInternalAddress, setIsActive, WalletState } from '../store/WalletStateStore';
import { useDispatch, useSelector } from 'react-redux';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Overview from '../components/Overview'
import Receive from '../components/Receive'
import Settings from '../components/Settings/Settings'
import Header from '../components/Header'
import { wallet } from '../wallet/wallet';

import { AddressLookup } from '../wallet/walletTypes';
import Loader from '../components/Loader';
import { ScrollView } from 'react-native-gesture-handler';

type Props = StackScreenProps<RootNavigationParamList, 'Root'>;


const shell: React.FC = () => {
    return (null)
}

const RootView: React.FC<Props> = (props) => {

    const Tab = createBottomTabNavigator<WalletHomeNavigationParamList>();
    const getIsActive = (state: WalletState) => state.isActive
    const isActive = useSelector(getIsActive)

    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    const multiDeviceSelector = (state: WalletState) => state.multiDeviceSupport
    const multiDevice = useSelector(multiDeviceSelector)

    const isNewWalletSelector = (state: WalletState) => state.newlyCreated
    const isNewWallet = useSelector(isNewWalletSelector)

    const isWalletRestoringSelector = (state: WalletState) => state.isRestoring
    const isWalletRestoring = useSelector(isWalletRestoringSelector)

    const dispatch = useDispatch()

    const setUpWallet = async (isRestoringOldWallet: boolean) => {

        await wallet.setUpSeedAndRoot()

        let zeroOrMinusOne = isRestoringOldWallet ? -1 : 0

        // Populate first external address
        let firstExternal = await wallet.getExternalAddress(0)
        dispatch(addExternalAddress(new AddressLookup(0, firstExternal, zeroOrMinusOne, false)))

        // Now let's populate external address lookaheads
        for (var i = 0; i < 20; i++) {
            let external = await wallet.getExternalAddress(i + 1)
            dispatch(addExternalAddress(new AddressLookup(i + 1, external, zeroOrMinusOne, true)))
        }

        // Populate first internal address
        let firstInternal = await wallet.getInternalAddress(0)
        dispatch(addInternalAddress(new AddressLookup(0, firstInternal, zeroOrMinusOne, false)))

        // Now let's populate internal address lookaheads
        for (var i = 0; i < 20; i++) {
            let internal = await wallet.getInternalAddress(i + 1)
            dispatch(addInternalAddress(new AddressLookup(i + 1, internal, zeroOrMinusOne, true)))
        }

        dispatch(setIsActive(true))
    }

    const sync = async () => {
        try {
            await wallet.synchronize(!multiDevice)
            await wallet.fetchFeeRates()
        }
        catch (e) {
            console.log(e)
        }
    }

    const handleEffect = async () => {

        if (!isActive && isNewWallet) {
            setUpWallet(false)
        }

        if (!isActive && isWalletRestoring) {
            setUpWallet(true)
        }

        if (isActive) {
            await sync()
        }
    }

    useEffect(() => {

        handleEffect()

    }, [isActive, isWalletRestoring, isNewWallet])

    return (
        <View style={{ flex: 1 }}>
            { (isWalletRestoring || isNewWallet) &&
                <Loader title={isNewWallet ? 'Creating wallet' : getTranslated(language).restoring} subTitle="This might take a second" />
            }
            {
                isActive && !isWalletRestoring && !isNewWallet &&
                <Tab.Navigator tabBarOptions={{ labelStyle: { fontFamily: 'TitilliumWeb-Regular', fontWeight: '600', fontSize: 10, paddingBottom: Platform.OS == 'android' ? 5 : 0 }, inactiveBackgroundColor: '#090C14', activeTintColor: '#F7931A', activeBackgroundColor: '#090C14', style: { backgroundColor: '#090C14', borderTopColor: '#1F232E' } }}>
                    <Tab.Screen name="Overview" component={Overview} options={{ tabBarLabel: getTranslated(language).overview, tabBarIcon: (tabProps) => { return tabProps.focused ? <Image style={styles.tabIcon} source={require('../assets/images/collection-focus.png')} /> : <Image style={styles.tabIcon} source={require('../assets/images/collection.png')} />; } }} />
                    <Tab.Screen name="Send" component={shell} options={{ tabBarLabel: getTranslated(language).send, tabBarButton: (values) => (<TouchableOpacity  {...values} onPress={() => props.navigation.push('Send')} />), tabBarIcon: (tabProps) => { return tabProps.focused ? <Image style={styles.tabIcon} source={require('../assets/images/send-focus.png')} /> : <Image style={styles.tabIcon} source={require('../assets/images/send.png')} />; } }} />
                    <Tab.Screen name="Receive" component={Receive} options={{ tabBarLabel: getTranslated(language).receive, tabBarIcon: (tabProps) => { return tabProps.focused ? <Image style={styles.tabIcon} source={require('../assets/images/receive-focus.png')} /> : <Image style={styles.tabIcon} source={require('../assets/images/receive.png')} />; } }} />
                    <Tab.Screen name="Settings" component={Settings} options={{ tabBarLabel: getTranslated(language).settings, tabBarIcon: (tabProps) => { return tabProps.focused ? <Image style={styles.tabIcon} source={require('../assets/images/gear-focus.png')} /> : <Image style={styles.tabIcon} source={require('../assets/images/gear.png')} />; } }} />
                </Tab.Navigator>
            }
            {
                !isActive && !isNewWallet && !isWalletRestoring &&

                <View style={{ flex: 1 }}>
                    <Header screen={getTranslated(language).getting_started} currentLanguage={getLanguageBigName(language)} action={() => { props.navigation.navigate('PickerView', { type: "Choose Language" }) }} />
                    <Screen>
                        <ScrollView>
                            <View style={styles.container}>
                                <View style={styles.onboard}>
                                    <Text style={styles.headingText}>{getTranslated(language).getting_started}</Text>
                                    <View style={styles.buttonContainer}>
                                        <LinearGradient useAngle={true} angle={180} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#1f232e', '#13161f']}>
                                            <TouchableOpacity style={styles.onboardButton} onPress={() => props.navigation.navigate('CreateStepOne')}>
                                                <View style={styles.buttonContent}>
                                                    <Image style={styles.onboardIcon} source={require('../assets/images/create.png')} />
                                                    <View style={{ marginLeft: 20 }}>
                                                        <Text style={styles.onboardButtonText}>{getTranslated(language).create_new}</Text>
                                                        <   Text style={styles.onboardButtonSubText}>{getTranslated(language).create_subtext}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </View>
                                    <View style={styles.buttonContainer}>
                                        <LinearGradient useAngle={true} angle={180} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#1f232e', '#13161f']}>
                                            <TouchableOpacity style={styles.onboardButton} onPress={() => props.navigation.navigate('Restore')}>
                                                <View style={styles.buttonContent}>
                                                    <Image style={styles.onboardIcon} source={require('../assets/images/restore.png')} />
                                                    <View style={{ marginLeft: 20 }}>
                                                        <Text style={styles.onboardButtonText}>{getTranslated(language).restore_existing}</Text>
                                                        <Text style={styles.onboardButtonSubText}>{getTranslated(language).restore_subtext}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </Screen>
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        marginTop: 50
    },
    onboard: {
    },
    headingText: {
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 40,
        color: '#fff',
        textAlign: 'center'
    },
    buttonContainer: {
        borderColor: '#2B2F3A',
        borderRadius: 2,
        justifyContent: 'center',
        borderWidth: 1,
        margin: 10,
        marginBottom: 20,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
    },
    onboardButton: {
        borderRadius: 10,
        fontSize: 20,
        padding: 30,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    onboardIcon: {
        width: 64,
        height: 64,
    },
    onboardButtonText: {
        fontSize: 20,
        color: '#fff',
        fontFamily: 'TitilliumWeb-Bold',
        marginRight: 30
    },
    onboardButtonSubText: {
        fontSize: 15,
        color: '#fff',
        fontFamily: 'TitilliumWeb-Regular',
        marginRight: 50
    },
    tabIcon: {
        width: 24,
        height: 24
    }
});

export default RootView