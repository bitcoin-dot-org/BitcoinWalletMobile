import React, { createRef, useState } from 'react'
import { View, Text, TextInput, Keyboard } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import ButtonPrimary from '../../buttons/ButtonPrimary';
import Screen from '../../components/Screen';
import { useDispatch, useSelector } from 'react-redux'
import { isRestoring, WalletState } from '../../store/WalletStateStore'
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import { StackScreenProps } from '@react-navigation/stack';
import Header from '../../components/Header'
import { getTranslated } from '../../lang/helper';

type Props = StackScreenProps<RootNavigationParamList, 'Restore'>;

const Restore: React.FC<Props> = (props) => {

    const insets = useSafeAreaInsets()

    const [words, setWords] = useState(["", "", "", "", "", "", "", "", "", "", "", ""])

    const refs = [createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>(), createRef<TextInput>()]

    const updateWord = (word: string, index: number) => {
        let newWords = [...words]

        for (var i = 0; i < newWords.length; i++) {
            if (index == i) {
                newWords[i] = word
            }
        }
        setWords(newWords)
    }

    const nextTextInput = (index: number) => {
        refs[index].current?.focus()
    }

    const dispatch = useDispatch()
    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)


    const restoreWallet = async () => {

        Keyboard.dismiss()

        try {
            // Store the seed in the keychain
            await RNSecureKeyStore.set("WALLET_SEED", words.join(" ").toLowerCase(), { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })

            // State change to indicate we are restoring so the main wallet screen knows to do a full sync
            dispatch(isRestoring(true))

            // Let's go back 
            props.navigation.goBack()
        }

        catch {

        }

    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header screen={getTranslated(language).restore_existing} action={() => { props.navigation.goBack() }} />
                <Screen>
                    <View style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
                            <Text style={styles.subHeading}>{getTranslated(language).restore_notice}</Text>
                            <View style={{ flex: 1, marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 10, alignItems: 'flex-start' }}>
                                {words.map((word, index) => {
                                    return (
                                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', width: '50%', flexWrap: 'wrap', marginTop: 10, }}>
                                            <Text style={styles.numberedLabel}>{index + 1}.</Text>
                                            <TextInput
                                                style={styles.recoveryField}
                                                ref={refs[index]}
                                                returnKeyType="next"
                                                keyboardType="ascii-capable"
                                                autoCapitalize="characters"
                                                autoCorrect={false}
                                                value={word}
                                                onChangeText={(text) => updateWord(text, index)}
                                                onSubmitEditing={() => { index < 11 ? nextTextInput(index + 1) : restoreWallet() }}
                                                blurOnSubmit={false}
                                            />
                                        </View>
                                    )
                                })
                                }
                            </View>
                            <View style={{ marginBottom: insets.bottom + 30, marginLeft: 16 }}>
                                <ButtonPrimary text={getTranslated(language).restore_button} action={restoreWallet} />
                            </View>
                        </ScrollView>
                    </View>
                </Screen>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    subHeading: {
        marginTop: 20,
        fontSize: 16,
        color: '#ACB2BB',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
        width: '60%',
        alignSelf: 'center'

    },
    recoveryField: {
        width: 145,
        height: 40,
        backgroundColor: '#090C14',
        borderWidth: 1,
        borderColor: '#2B2F3A',
        color: '#FFF',
        fontFamily: 'TitilliumWeb-SemiBold',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    numberedLabel: {
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 11,
        lineHeight: 22,
        fontWeight: '400',
        color: '#ACB2BB',
        width: 20,
    },
})

export default Restore