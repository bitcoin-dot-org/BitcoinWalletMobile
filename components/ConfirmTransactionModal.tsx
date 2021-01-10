import CheckBox from '@react-native-community/checkbox';
import React, { useState } from 'react'
import { View, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import { WalletState } from '../store/WalletStateStore';
import ButtonPrimary from '../buttons/ButtonPrimary';
import ButtonPrimaryDisabled from '../buttons/ButtonPrimaryDisabled';
import { getTranslated } from '../lang/helper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigNumber from 'bignumber.js';

interface Props {
    isVisible: boolean
    btcAmount: string
    feeAmount: string
    recipient: string
    sendingMax: boolean
    hideModal: () => void
    sendCallback: () => void
}

const ExitWalletModal: React.FC<Props> = (props) => {

    let canGetRates = true
    const [isSure, setisSure] = useState(false)
    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)
    const insets = useSafeAreaInsets()
    const currencySelector = (state: WalletState) => state.currency
    const currency = useSelector(currencySelector)

    const rateSelector = (state: WalletState) => {
        if (state.fiatRates[currency] != undefined) {
            return state.fiatRates[currency].last
        }
        else {
            canGetRates = false
            return 0
        }
    }

    const rate = useSelector(rateSelector)

    const btcToFiat = (amount: string): string => {

        if (!canGetRates) {
            return 'N/A'
        }

        let fiat = new BigNumber(amount).multipliedBy(rate).toFixed(2)

        if (isNaN(parseFloat(fiat))) {
            fiat = "0";
        }


        return new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(parseFloat(fiat)).replace(currency, '').trim();
    }

    return (
        <View>
            <Modal style={{ marginHorizontal: 0, marginBottom: 0, justifyContent: 'flex-end' }} isVisible={props.isVisible} backdropTransitionOutTiming={0} onBackdropPress={props.hideModal}>
                <View style={{}}>
                    <LinearGradient useAngle={true} angle={180} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#13161F', '#090C14']}>
                        <View style={{ padding: 20 }}>
                            <Text style={styles.headingText}>{getTranslated(language).confirmation}</Text>
                            <Text style={[styles.regularText, { marginBottom: 20 }]}>{getTranslated(language).are_you_sure}</Text>
                            <View style={styles.amountDetailsContainer}>
                                <Text style={styles.amountLabel}>{getTranslated(language).amount}:</Text>
                                <View style={styles.amountDetails}>
                                    <Text style={styles.amountText}>{props.btcAmount} BTC</Text>
                                    <Text style={styles.amountTextFiat}>{btcToFiat(props.btcAmount)}</Text>
                                </View>
                            </View>
                            <View style={styles.amountDetailsContainer}>
                                <Text style={styles.amountLabel}>{getTranslated(language).miner_fee}:</Text>
                                <View style={styles.amountDetails}>
                                    <Text style={styles.amountText}>{new BigNumber(props.feeAmount).dividedBy(100000000).toString()} BTC</Text>
                                    <Text style={styles.amountTextFiat}>{btcToFiat(new BigNumber(props.feeAmount).dividedBy(100000000).toString())}</Text>
                                </View>
                            </View>
                            <View style={styles.amountDetailsContainer}>
                                <Text style={styles.amountLabel}>{getTranslated(language).total}:</Text>
                                <View style={styles.amountDetails}>
                                    <Text style={styles.amountText}>{new BigNumber(props.feeAmount).dividedBy(100000000).plus(props.btcAmount).toString()} BTC</Text>
                                    <Text style={styles.amountTextFiat}>{btcToFiat(new BigNumber(props.feeAmount).dividedBy(100000000).plus(props.btcAmount).toString())}</Text>
                                </View>
                            </View>
                            <View style={styles.amountDetailsContainer}>
                                <Text style={styles.amountLabel}>{getTranslated(language).they_receive}:</Text>
                                <View style={styles.amountDetails}>
                                    <Text style={styles.amountText}>{props.sendingMax ? new BigNumber(props.btcAmount).plus(new BigNumber(props.feeAmount).dividedBy(100000000)).toString() : new BigNumber(props.btcAmount).toString()} BTC</Text>
                                    <Text style={styles.amountTextFiat}>{btcToFiat(props.sendingMax ? new BigNumber(props.btcAmount).plus(new BigNumber(props.feeAmount).dividedBy(100000000)).toString() : new BigNumber(props.btcAmount).toString())}</Text>
                                </View>
                            </View>
                            <View style={styles.amountDetailsContainer}>
                                <Text style={styles.amountLabel}>{getTranslated(language).recepient}:</Text>
                                <View style={styles.amountDetails}>
                                    <Text style={styles.amountText}>{props.recipient}</Text>
                                </View>
                            </View>
                            <View style={styles.deleteContainer}>
                                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => { setisSure(!isSure) }}>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <CheckBox tintColors={{ true: '#F7931A', false: '#F7931A' }} style={styles.checkBox} tintColor="#F7931A" animationDuration={0} onFillColor="#F7931A" onTintColor="#F7931A" onCheckColor="#fff" boxType="square" disabled={false} value={isSure} onValueChange={(newVal) => setisSure(newVal)} />
                                        <Text style={styles.regularText}>{getTranslated(language).im_sure}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                        <View style={{ marginBottom: insets.bottom + 30, marginLeft: 16, flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={styles.button} onPress={props.hideModal}>
                                <Text style={styles.buttonText}>{getTranslated(language).back_button}</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 2 }}>
                                {isSure &&
                                    <ButtonPrimary text={getTranslated(language).send} action={props.sendCallback} />
                                }
                                {!isSure &&
                                    <ButtonPrimaryDisabled text={getTranslated(language).send} action={props.sendCallback} />
                                }
                            </View>
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
    button: {
        flex: 0.5,
        borderColor: '#434854',
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginHorizontal: 20,
        alignSelf: 'center',
    },
    buttonText: {
        fontFamily: 'TitilliumWeb-SemiBold',
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'uppercase',
        color: '#ACB2BB',
        lineHeight: 24,
        textAlign: 'center'
    },
    deleteContainer: {
        flexDirection: 'row',
    },
    amountLabel: {
        fontSize: 15,
        color: '#F7931A',
        fontFamily: 'TitilliumWeb-Regular',
    },
    amountDetailsContainer: {
        marginTop: 0
    },
    amountTitle: {

    },
    amountText: {
        fontFamily: 'TitilliumWeb-SemiBold',
        fontSize: 14,
        color: "#fff",
        fontWeight: '600',
        lineHeight: 20,
        height: 40,
        marginRight: 10,
    },
    amountTextFiat: {
        fontSize: 12,
        fontFamily: 'TitilliumWeb-Regular',
        color: '#7E858F',
    },
    amountDetails: {
        flexDirection: 'row',
    },
    checkBox: {
        width: 16,
        height: 16,
        marginBottom: -16,
        marginRight: 20
    },
});

export default ExitWalletModal