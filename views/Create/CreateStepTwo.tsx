import React, { useState } from 'react'
import { View, Text, Image } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux'
import { setNewlyCreated, WalletState } from '../../store/WalletStateStore'
import Screen from '../../components/Screen'
import ButtonPrimary from '../../buttons/ButtonPrimary'
import { StackScreenProps } from '@react-navigation/stack';
import CheckBox from '@react-native-community/checkbox';
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Header from '../../components/Header';
import ButtonPrimaryDisabled from '../../buttons/ButtonPrimaryDisabled';
import { getTranslated } from '../../lang/helper';
import RecoveryWords from '../../components/RecoveryWords';

type Props = StackScreenProps<RootNavigationParamList, 'CreateStepTwo'>;

const CreateStepTwo: React.FC<Props> = (props) => {

    const dispatch = useDispatch()
    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    const [didWriteDown, setDidWriteDown] = useState(false)

    const insets = useSafeAreaInsets()


    const setUpWallet = async () => {



        try {
            // Store the seed in the keychain
            await RNSecureKeyStore.set("WALLET_SEED", props.route.params.words.join(' '), { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })

            dispatch(setNewlyCreated(true))

            // Let's go back 
            props.navigation.popToTop()
        }

        catch (error) {
            console.log(error)
            // Shouldn't end up here..?
        }


    }


    return (
        <View style={styles.rootContainer}>
            <View style={{ flex: 1 }}>
                <Header screen={getTranslated(language).seed_phrase} action={() => { props.navigation.goBack() }} />
                <Screen>
                    <View style={styles.viewContainer}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }} style={{ height: '100%' }}>
                            <View style={{ flex: 1 }}>
                                <View style={styles.warningContainer}>
                                    <View style={styles.iconWithText}>
                                        <Image style={styles.icon} source={require('../../assets/images/warning.png')} />
                                        <Text style={styles.warningTextInner}><Text style={styles.warningText}>{getTranslated(language).warning}! </Text>{getTranslated(language).warning_text_2}</Text>
                                    </View>
                                </View>
                                <RecoveryWords screen="CreateStepTwo" words={props.route.params.words} />
                                <View style={{ marginBottom: insets.bottom + 30 }}>
                                    <View style={styles.hasSavedContainer}>
                                        <TouchableWithoutFeedback style={{ width: 32, height: 32 }} onPress={() => { setDidWriteDown(!didWriteDown) }}>
                                            <CheckBox tintColors={{ true: '#F7931A', false: '#F7931A' }} style={styles.checkBox} tintColor="#F7931A" animationDuration={0} onFillColor="#F7931A" onTintColor="#F7931A" onCheckColor="#fff" boxType="square" disabled={false} value={didWriteDown} onValueChange={(newVal) => setDidWriteDown(newVal)} />
                                        </TouchableWithoutFeedback>
                                        <Text style={styles.hasSavedText}>{getTranslated(language).have_saved}</Text>
                                    </View>
                                    <View style={styles.buttonContainer}>
                                        {didWriteDown &&
                                            <ButtonPrimary text={getTranslated(language).wrote_it_down} action={setUpWallet} />
                                        }
                                        {!didWriteDown &&
                                            <ButtonPrimaryDisabled text={getTranslated(language).wrote_it_down} action={() => { }} />
                                        }
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </Screen>
            </View>
        </View>
    );

}

const styles = ScaledSheet.create({
    rootContainer: {
        flex: 1
    },
    stepText: {
        color: '#fff',
        fontFamily: 'TitilliumWeb-Regular',
        textAlign: 'center'
    },
    stepHightlight: {
        color: 'orange'
    },
    viewContainer: {
        flex: 1
    },
    warningContainer: {
        marginTop: 20,
        marginHorizontal: 40,
        padding: 10,
        borderWidth: 1,
        borderColor: '#8f3f07',
        borderRadius: 2,
        backgroundColor: 'rgba(212, 116, 18, 0.2)'
    },
    iconWithText: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    icon: {
        width: '24@vs',
        height: '24@vs'
    },
    warningText: {
        fontSize: 14,
        fontFamily: 'TitilliumWeb-Regular',
        color: '#f7931a',
        fontWeight: '700',
    },
    warningTextInner: {
        fontSize: 14,
        fontFamily: 'TitilliumWeb-Regular',
        color: '#fff',
        padding: 10,
        marginRight: 20,
    },
    hasSavedContainer: {
        flex: 1,
        marginHorizontal: 40,
        marginTop: 20,
        flexDirection: 'row',
    },
    checkBox: {
        width: 16,
        height: 16,
        marginTop: 5,
    },
    hasSavedText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'TitilliumWeb-Regular',
        marginLeft: 10,
    },
    buttonContainer: {
        flex: 1,
        marginTop: 10,
        marginLeft: 16
    },
})

export default CreateStepTwo