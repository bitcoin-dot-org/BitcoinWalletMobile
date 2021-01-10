import CheckBox from '@react-native-community/checkbox';
import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import RNSecureKeyStore from "react-native-secure-key-store";
import { useSelector } from 'react-redux';
import ButtonPrimary from '../../buttons/ButtonPrimary';
import ButtonPrimaryDisabled from '../../buttons/ButtonPrimaryDisabled';
import { getTranslated } from '../../lang/helper';
import { WalletState } from '../../store/WalletStateStore';

interface Props {
    isVisible: boolean
    hideModal: () => void
    deleteCallback: () => void
}

const ExitWalletModal: React.FC<Props> = (props) => {


    const [isSure, setisSure] = useState(false)
    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    return (
        <View>
            <Modal isVisible={props.isVisible} backdropTransitionOutTiming={0} onBackdropPress={props.hideModal}>
                <View style={{ borderColor: '#2b2f3a', borderWidth: 1 }}>
                    <LinearGradient useAngle={true} angle={180} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#1f232e', '#13161f']}>
                        <View style={{ padding: 20, flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center' }}>
                            <Text style={styles.headingText}>{getTranslated(language).exit_wallet}</Text>
                            <Text style={styles.regularText}>{getTranslated(language).exit_text}</Text>
                            <View style={styles.deleteContainer}>
                                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => { setisSure(!isSure) }}>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <CheckBox tintColors={{ true: '#F7931A', false: '#F7931A' }} style={styles.checkBox} tintColor="#F7931A" animationDuration={0} onFillColor="#F7931A" onTintColor="#F7931A" onCheckColor="#fff" boxType="square" disabled={false} value={isSure} onValueChange={(newVal) => setisSure(newVal)} />
                                        <Text style={styles.regularText}>{getTranslated(language).exit_label_text}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                        <View style={{ marginBottom: 20, marginLeft: 16, flexDirection: 'row' }}>
                            {isSure &&
                                <ButtonPrimary text={getTranslated(language).exit_delete} action={props.deleteCallback} />
                            }
                            {!isSure &&
                                <ButtonPrimaryDisabled text={getTranslated(language).exit_delete} action={props.deleteCallback} />
                            }
                        </View>
                    </LinearGradient>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    headingText: {
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
    },
    deleteContainer: {
        flex: 1,
        marginHorizontal: 40,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkBox: {
        width: 16,
        height: 16,
        marginBottom: -16,
        marginRight: 20
    },
});

export default ExitWalletModal