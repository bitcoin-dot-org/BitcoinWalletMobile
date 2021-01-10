import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import RNSecureKeyStore from "react-native-secure-key-store";
import { useSelector } from 'react-redux';
import { getTranslated } from '../../lang/helper';
import { WalletState } from '../../store/WalletStateStore';
import RecoveryWords from '../RecoveryWords';

interface Props {
    isVisible: boolean
    hideModal: () => void
}

const RecoveryWordsModal: React.FC<Props> = (props) => {

    const emptyWords: string[] = []
    const [words, setWords] = useState(emptyWords)

    useEffect(() => {
        getWords()
    }, [])


    const getWords = async () => {
        let seed = await RNSecureKeyStore.get('WALLET_SEED')
        setWords(seed.split(' '))
    }

    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    return (
        <View>
            <Modal style={{ marginHorizontal: 0, marginBottom: 0, justifyContent: 'flex-end' }} backdropTransitionOutTiming={0} isVisible={props.isVisible} onBackdropPress={props.hideModal}>
                <View style={{ borderColor: '#2b2f3a', borderTopWidth: 1 }}>
                    <LinearGradient useAngle={true} angle={180} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#13161F', '#090C14']}>
                        <View>
                            <Text style={styles.headingText}>{getTranslated(language).seed_phrase}</Text>
                            <Text style={styles.regularText}>{getTranslated(language).warning_text_2}</Text>
                            <RecoveryWords screen="RecoveryModal" words={words} />
                            <TouchableOpacity style={styles.button} onPress={props.hideModal}>
                                <Text style={styles.buttonText}>{getTranslated(language).back_button}</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    headingText: {
        marginTop: 20,
        fontSize: 30,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
    },
    regularText: {
        fontSize: 15,
        color: '#fff',
        fontFamily: 'TitilliumWeb-Regular',
        marginTop: 20,
        marginHorizontal: 20,
    },
    button: {
        borderColor: '#434854',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 40,
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 50
    },
    buttonText: {
        fontFamily: 'TitilliumWeb-SemiBold',
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'uppercase',
        color: '#ACB2BB',
        lineHeight: 24,
        textAlign: 'center'
    }
});

export default RecoveryWordsModal