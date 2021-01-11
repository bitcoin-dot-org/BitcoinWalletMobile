import React, { useEffect, useState } from 'react'
import { View, Text, Image } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters';
import { WalletState } from '../../store/WalletStateStore'
import Screen from '../../components/Screen'
import ButtonPrimary from '../../buttons/ButtonPrimary'
import Header from '../../components/Header'
import { StackScreenProps } from '@react-navigation/stack';
import * as bip39 from "bip39";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import Loader from '../../components/Loader';
import { getTranslated } from '../../lang/helper';
import { useSelector } from 'react-redux';

type Props = StackScreenProps<RootNavigationParamList, 'CreateStepOne'>;

const CreateStepOne: React.FC<Props> = (props) => {

    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    const insets = useSafeAreaInsets()

    const [isGenerating, setIsGenerating] = useState(false)

    async function generateSeed() {
        setIsGenerating(true)

        setTimeout(() => {
            let words = bip39.generateMnemonic().split(" ")
            setIsGenerating(false)
            props.navigation.navigate('CreateStepTwo', { words: words })
        }, 2000)
    }

    useEffect(() => {
        let listener = props.navigation.addListener('beforeRemove', (e) => {
            if (!isGenerating) {
                props.navigation.dispatch(e.data.action)
            }
            else {
                e.preventDefault()
            }
        })

        return listener

    }, [props.navigation, isGenerating])

    return (
        <View style={{ flex: 1 }}>
            { isGenerating &&
                <Loader title="Generating..." subTitle="This might take a second" />
            }
            { !isGenerating &&
                <View style={{ flex: 1 }}>
                    <Header screen={getTranslated(language).create_new} action={() => { props.navigation.goBack() }} />
                    <Screen>
                        <View style={styles.rootContainer}>
                            <View style={styles.viewContainer}>
                                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
                                    <View style={styles.warningContainer}>
                                        <View style={styles.iconWithText}>
                                            <Image style={styles.warningIcon} source={require('../../assets/images/warning.png')} />
                                            <Text style={styles.warningText} >{getTranslated(language).warning}!</Text>
                                        </View>
                                        <Text style={styles.warningTextInner}>{getTranslated(language).we_will_generate}</Text>
                                        <Text style={styles.warningTextInner} >{getTranslated(language).warning_text_1}</Text>
                                        <View style={styles.iconWithText}>
                                            <Image style={styles.icon} source={require('../../assets/images/write_it_down.png')} />
                                            <Text style={styles.innerText} >{getTranslated(language).write_it_down}</Text>
                                        </View>
                                        <View style={styles.iconWithText}>
                                            <Image style={styles.icon} source={require('../../assets/images/keep_it_safe.png')} />
                                            <Text style={styles.innerText} >{getTranslated(language).keep_it_safe}</Text>
                                        </View>
                                        <View style={styles.iconWithText}>
                                            <Image style={styles.icon} source={require('../../assets/images/do_not_loose_it.png')} />
                                            <Text style={styles.innerText} >{getTranslated(language).do_not_lose_it}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.buttonContainer, { marginBottom: insets.bottom + 30 }]}>
                                        {!isGenerating && <ButtonPrimary text={getTranslated(language).generate} action={() => generateSeed()} />}
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </Screen>
                </View>
            }
        </View>
    );
}

const styles = ScaledSheet.create({
    rootContainer: {
        flex: 1,
    },
    viewContainer: {
        flex: 1,
    },
    warningContainer: {
        marginTop: 20,
        marginHorizontal: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#8f3f07',
        borderRadius: 2,
        backgroundColor: 'rgba(212, 116, 18, 0.2)'
    },
    iconWithText: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    icon: {
        width: '48@vs',
        height: '48@vs'
    },
    warningIcon: {
        width: '24@vs',
        height: '24@vs'
    },
    innerText: {
        color: '#fff',
        fontFamily: 'TitilliumWeb-Bold',
        marginLeft: 20,
        fontSize: 20,
    },
    warningText: {
        fontSize: 20,
        fontFamily: 'TitilliumWeb-Regular',
        color: '#f7931a',
        padding: 10,
    },
    warningTextInner: {
        fontSize: 15,
        fontFamily: 'TitilliumWeb-Regular',
        color: '#fff',
        padding: 10,
    },
    buttonContainer: {
        marginLeft: 16
    }
})

export default CreateStepOne