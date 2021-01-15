import * as bitcoin from 'bitcoinjs-lib';
import React, { createRef, useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Platform } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import ButtonPrimary from '../buttons/ButtonPrimary';
import { WalletState, addTransaction } from '../store/WalletStateStore';
import Screen from './Screen';
import Modal from 'react-native-modal';
import BigNumber from 'bignumber.js';
import accumulative from 'coinselect/accumulative'
import split from 'coinselect/split'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { getTranslated } from '../lang/helper';
import ButtonPrimaryDisabled from '../buttons/ButtonPrimaryDisabled';
import ConfirmTransactionModal from './ConfirmTransactionModal';
import { wallet } from '../wallet/wallet';
import { Transaction } from '../wallet/walletTypes';

type Props = BottomTabScreenProps<WalletHomeNavigationParamList, 'Send'>;

const Send: React.FC<Props> = (props) => {

    const insets = useSafeAreaInsets()

    let btcTextRef = createRef<TextInput>()
    let fiatTextRef = createRef<TextInput>()
    const currencySelector = (state: WalletState) => state.currency
    const currency = useSelector(currencySelector)

    let canGetRates = true

    const rateSelector = (state: WalletState) => {
        if (state.fiatRates[currency] != undefined) {
            return state.fiatRates[currency].last
        }
        else {
            canGetRates = false
            return 0
        }
    }

    const dispatch = useDispatch()
    const rate = useSelector(rateSelector)
    const languageSelector = (state: WalletState) => state.language
    const multiDeviceSelector = (state: WalletState) => state.multiDeviceSupport
    const multiDevice = useSelector(multiDeviceSelector)
    const language = useSelector(languageSelector)
    const balanceSelector = (state: WalletState) => state.balance
    const balance = useSelector(balanceSelector)
    const utxosSelector = (state: WalletState) => state.utxos
    const utxos = useSelector(utxosSelector)
    const feeRatesSelector = (state: WalletState) => state.feeRates
    const feeRates = useSelector(feeRatesSelector)
    const [isSendingMax, setSendingMax] = useState(false)
    const [confirmModalShowing, setConfirmModalShowing] = useState(false)
    const [isSendingNotice, setisSendingNotice] = useState(false)
    const [sentTransactionModalShowing, setSentTransactionModalShowing] = useState(false)
    const [sendEnabled, setSendEnabled] = useState(false)
    const [feeAmount, setFeeAmount] = useState("0")
    const [feeAmountFiat, setFeeAmountFiat] = useState(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
    const [totalAmount, setTotalAmount] = useState("0")
    const [totalAmountFiat, setTotalAmountFiat] = useState(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
    const [feeLevel, setFeeLevel] = useState(1)
    const [address, setAddress] = useState("")
    const [btcAmount, setBtcAmount] = useState("")
    const [fiatAmount, setFiatAmount] = useState("")
    const [addressInvalid, setAddressInvalid] = useState(false)
    const [btcAmountInvalid, setBtcAmountInvalid] = useState(false)
    const [fiatAmountInvalid, setFiatAmountInvalid] = useState(false)
    const [dustError, setDustError] = useState(false)
    const [cantSendAmountWithFee, setCantSendAmountWithFee] = useState(false)
    const [notEnoughBalance, setNotEnoughBalance] = useState(false)
    const [realFee, setRealFee] = useState(0)
    const feeTitles = [getTranslated(language).low_priority, getTranslated(language).standard, getTranslated(language).important]
    const feeDescriptions = [getTranslated(language).low_priority_desc, getTranslated(language).standard_desc, getTranslated(language).important_desc]

    const btcToFiat = () => {
        let fiat = new BigNumber(balance).multipliedBy(rate).toFixed(2)

        if (isNaN(parseFloat(fiat))) {
            fiat = "0";
        }

        if (!canGetRates) {
            return "N/A"
        }

        return new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(parseFloat(fiat));
    }

    const checkAddress = (newAddress: string) => {

        setAddress(newAddress)

        if (newAddress == "") {
            setAddressInvalid(false)
            setSendEnabled(false)
            return;
        }

        try {
            bitcoin.address.toOutputScript(newAddress);
            setAddressInvalid(false)
            setAddress(newAddress)

            if (!btcAmountInvalid && !fiatAmountInvalid && btcAmount != '' && fiatAmount != '' && !notEnoughBalance && !dustError && new BigNumber(btcAmount).gt(0)) {
                setSendEnabled(true)
            }
        }

        catch {
            setAddressInvalid(true)
            setSendEnabled(false)
        }
    }

    const checkValidAndCalculateFiat = (newBtc: string) => {

        setBtcAmount(newBtc)

        if (newBtc == '') {
            setFiatAmount("")
            setNotEnoughBalance(false)
            setCantSendAmountWithFee(false)
            setBtcAmountInvalid(false)
            setFiatAmountInvalid(false)
            setFeeAmount('0')
            setFeeAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
            setTotalAmount("0")
            setTotalAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
            setSendEnabled(false)
            return
        }

        if (isNaN(parseFloat(newBtc))) {
            setBtcAmountInvalid(true)
            setFiatAmountInvalid(true)
            setSendEnabled(false)
            setNotEnoughBalance(false)
            setCantSendAmountWithFee(false)
            return
        }

        if (new BigNumber(newBtc).multipliedBy(100000000).toNumber() <= 800 && new BigNumber(newBtc).toNumber() > 0) {
            setDustError(true)
            setNotEnoughBalance(false)
            setCantSendAmountWithFee(false)
            setBtcAmountInvalid(true)
            setFiatAmountInvalid(true)
        }


        if (canGetRates) {

            let fiat = (parseFloat(newBtc) * rate).toFixed(2);

            if (isNaN(parseFloat(fiat))) {
                setFiatAmount("")
            }

            else {
                setFiatAmountInvalid(false)
                setBtcAmountInvalid(false)
                setFiatAmount(new Intl.NumberFormat().format(parseFloat(fiat)))
            }
        }

        if (new BigNumber(newBtc).gt(new BigNumber(balance))) {
            setNotEnoughBalance(true)
            setCantSendAmountWithFee(false)
            setDustError(false)
        }

        else {
            setNotEnoughBalance(false)
            setDustError(false)
            setCantSendAmountWithFee(false)
            setFeesAndTotalAmounts(newBtc, feeLevel)
        }

    }


    const qrCodeCallback = (scannedAddress: string, scannedAmount: string | null) => {
        setAddress(scannedAddress)
        setAddressInvalid(false)

        if (scannedAmount != null) {
            setBtcAmount(scannedAmount.toString())
            setSendEnabled(true)
            checkValidAndCalculateFiat(scannedAmount.toString())
        }
    }

    const checkValidAndCalculateBtc = (newFiat: string) => {

        setFiatAmount(newFiat)

        if (newFiat == '') {
            setBtcAmount('')
            setNotEnoughBalance(false)
            setFiatAmountInvalid(false)
            setBtcAmountInvalid(false)
            setFeeAmount('0')
            setFeeAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
            setTotalAmount("0")
            setTotalAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
            setSendEnabled(false)
            return
        }


        if (isNaN(parseFloat(newFiat))) {
            setBtcAmountInvalid(true)
            setFiatAmountInvalid(true)
            setFeeAmount('0')
            setDustError(false)
            setCantSendAmountWithFee(false)
            setFeeAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
            setTotalAmount("0")
            setTotalAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
            setSendEnabled(false)
            return
        }

        let fiat = newFiat

        // Determine the format
        let format = new Intl.NumberFormat(language).format(1.5);

        // Are we in commas as decimal land?
        let commasAsDecimal = format == "1,5";

        // Let's adjust our format

        if (commasAsDecimal) {
            fiat = fiat.replace(".", "");
            fiat = fiat.replace(",", ".");
        }

        if (canGetRates) {

            let fiatRate = parseFloat(fiat.replace(/,/g, ""))
            let newBtc = new BigNumber(fiatRate).dividedBy(rate).toFixed(8).toString()

            if (btcToFiat() == new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(parseFloat(newFiat))) {
                newBtc = balance
            }

            if (isNaN(parseFloat(newBtc))) {
                setFiatAmountInvalid(true)
                setBtcAmount("")
            }
            else {
                setBtcAmount(newBtc)
                if (new BigNumber(newBtc).multipliedBy(100000000).toNumber() <= 800 && new BigNumber(newBtc).gt(0)) {
                    setDustError(true)
                    setBtcAmountInvalid(true)
                    setFiatAmountInvalid(true)
                    return
                }
                setFiatAmountInvalid(false)
                setBtcAmountInvalid(false)
            }

            if (new BigNumber(newBtc).gt(new BigNumber(balance))) {
                setDustError(false)
                setNotEnoughBalance(true)
            }

            else {
                setNotEnoughBalance(false)
                setDustError(false)
                setFeesAndTotalAmounts(newBtc, feeLevel)
            }
        }
    }

    const setFeesAndTotalAmounts = (newAmount: string, feeRate: number) => {

        if (notEnoughBalance || dustError) {
            return
        }

        let isSendingMax = new BigNumber(newAmount).eq(new BigNumber(balance))
        let networkFee = '0'

        if (new BigNumber(newAmount).gt(0)) {

            let target = undefined
            let select = accumulative

            if (isSendingMax) {
                target = [{ address: "3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd" }]
                select = split
            }
            else {
                target = [{ address: "3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd", value: new BigNumber(newAmount).multipliedBy(100000000).toNumber() }]
            }

            let { inputs, outputs, fee } = select(utxos, target, feeRates[feeRate])
            let total = "0"

            if (!inputs || !outputs || fee == 0) {
                setCantSendAmountWithFee(true)
            }

            else {
                setCantSendAmountWithFee(false)
                networkFee = isSendingMax ? new BigNumber(fee).dividedBy(100000000).negated().toFixed(8) : new BigNumber(fee).dividedBy(100000000).toFixed(8)
            }

            total = new BigNumber(networkFee).plus(newAmount).toFixed(8)

            if (new BigNumber(newAmount).gt(new BigNumber(balance))) {
                return
            }

            else {
                setTotalAmount(total)
                setFeeAmount(networkFee)

                if (!addressInvalid && address != '') {
                    setSendEnabled(true)
                }

                if (canGetRates) {
                    setFeeAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(parseFloat(networkFee) * rate))
                    setTotalAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(parseFloat(total) * rate))
                }

                else {
                    setFeeAmountFiat("N/A")
                    setTotalAmountFiat("N/A")
                }
            }
        }

        else {
            setSendEnabled(false)
            setFeeAmount("0")
            setTotalAmount("0")

            setFeeAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
            setTotalAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
        }

    }

    const sendMax = () => {
        setBtcAmount(balance.toString())
        checkValidAndCalculateFiat((balance).toString())
    }

    const showQrCodeScanner = () => {
        // @ts-ignore
        props.navigation.navigate('ScanQRCode', { callBack: qrCodeCallback })
    }

    const sendTransaction = async () => {

        let fee = feeRates[feeLevel]
        let sendingMax = new BigNumber(btcAmount).eq(new BigNumber(balance))
        await wallet.createTransaction(new BigNumber(btcAmount).multipliedBy(100000000).toNumber(), address, fee, sendingMax)
        setRealFee(sendingMax ? 0 - wallet.lastTransaction.getFee() : wallet.lastTransaction.getFee())
        if (sendingMax) {
            setSendingMax(true)
        }
        else {
            setSendingMax(false)
        }
        setConfirmModalShowing(true)
    }

    const sendTransactionForReal = async () => {

        setConfirmModalShowing(false)
        setisSendingNotice(true)

        await wallet.broadcastLastTransaction()

        let transaction = new Transaction(wallet.lastTransaction.extractTransaction().getId(), isSendingMax ? new BigNumber(btcAmount).negated().toString() : new BigNumber(totalAmount).negated().toString(), 0, new Date(), false)
        dispatch(addTransaction(transaction))

        setTimeout(async () => {
            await wallet.synchronize(!multiDevice)
            setisSendingNotice(false)
            setBtcAmount('')
            setFiatAmount('')
            setSendEnabled(false)
            setFeeLevel(1)
            setAddress('')
            setFeeAmount('0')
            setFeeAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
            setTotalAmount("0")
            setTotalAmountFiat(new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(0))
            setSentTransactionModalShowing(true)
        }, 2000);
    }


    const changeFeeLevel = (feeLevel: number) => {
        setFeeLevel(feeLevel)
        setFeesAndTotalAmounts(btcAmount, feeLevel)
    }

    return (
        <View style={{ flex: 1 }}>
            { isSendingNotice &&
                <View style={{ position: 'absolute', backgroundColor: 'rgba(00, 00, 00, 0.7)', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: '25%' }}>
                        <Image style={styles.bar} source={require('../assets/images/loader.gif')} />
                        <Text style={styles.sendingText}>{getTranslated(language).sending}</Text>
                        <Text style={styles.sendingSubText}>This might take a second</Text>
                    </View>
                </View>
            }
            <View style={styles.headerContainer}>
                <View style={{ marginTop: insets.top, height: 56 }}>
                    <View style={styles.textContain}>
                        <TouchableOpacity disabled={Platform.OS == 'android'} onPress={() => { props.navigation.goBack() }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                {Platform.OS == 'ios' &&
                                    <Image style={styles.arrow} source={require('../assets/images/arrow.png')} />
                                }
                                <Text style={styles.headerText}>{getTranslated(language).send}</Text>
                            </View>
                        </TouchableOpacity>
                        <View>
                            <View style={styles.btcBalanceRow}>
                                <Text style={styles.totalBalance}>{getTranslated(language).total_balance}:</Text>
                                <Text style={styles.btcBalance}>{balance.toString()}</Text>
                                <Text style={styles.currencyText}>BTC</Text>
                            </View>
                            <View style={styles.fiatBalanceRow}>
                                <Text style={styles.fiatBalance}>{btcToFiat()}</Text>
                                <Text style={styles.currencyText}>{currency}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.innerContainer}>
                <View style={{ flex: 1 }}>
                    <Screen>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ marginHorizontal: 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                                <Text style={styles.addressText}>{getTranslated(language).send_to}</Text>
                                <TouchableOpacity onPress={showQrCodeScanner}>
                                    <Image source={require('../assets/images/qrCodeIcon.png')} style={styles.qrIcon} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.subHeading}>{getTranslated(language).bitcoin_address}</Text>
                            <View style={{ flex: 1 }}>
                                <TextInput value={address} onChangeText={checkAddress} keyboardType='ascii-capable' spellCheck={false} autoCorrect={false} autoCapitalize='none' style={[{ fontFamily: 'TitilliumWeb-Regular', fontSize: 14, lineHeight: 22, color: '#FFF' }, styles.textInput, { flex: 1 }, addressInvalid ? styles.textErrorBorder : styles.textNormalBorder]} />
                            </View>
                            <View style={styles.amounts}>
                                <View style={styles.amountContainer}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.subHeading}>{getTranslated(language).amount_to_send}</Text>
                                        <TouchableWithoutFeedback onPress={() => { btcTextRef.current?.focus() }}>
                                            <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }, styles.textInput, btcAmountInvalid ? styles.textErrorBorder : styles.textNormalBorder]}>
                                                <TextInput ref={btcTextRef} style={styles.textInputText} placeholderTextColor="#7E858F" keyboardType="numeric" value={btcAmount} onChangeText={checkValidAndCalculateFiat} placeholder="0" />
                                                <Text style={styles.currencyTextInput}>BTC</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                    <Image source={require('../assets/images/swap.png')} style={styles.swapIcon} />
                                    <View style={{ flex: 1 }}>
                                    <TouchableWithoutFeedback onPress={() => { fiatTextRef.current?.focus() }}>
                                        <View style={[{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, styles.textInput, fiatAmountInvalid ? styles.textErrorBorder : styles.textNormalBorder]}>
                                            <TextInput style={styles.textInputText} ref={fiatTextRef} placeholderTextColor="#7E858F" keyboardType="numeric" value={fiatAmount} onChangeText={checkValidAndCalculateBtc} placeholder="0" />
                                            <Text style={styles.currencyTextInput}>{currency}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.sendMaxContainer} onPress={sendMax}>
                                <Text style={styles.sendMaxText}>{getTranslated(language).send_max}</Text>
                            </TouchableOpacity>
                            <Text style={[styles.subHeading, { marginTop: 10 }]}>{getTranslated(language).bitcoin_network_fee}</Text>
                            <View style={styles.feeLevelsContainer}>
                                {[0, 1, 2].map((index) => {
                                    return (
                                        <View key={index} style={[styles.feeLevel, index == feeLevel ? styles.orangeBorder : styles.feeNormalBorder]}>
                                            <TouchableWithoutFeedback onPress={() => { changeFeeLevel(index) }}>
                                                <LinearGradient useAngle={true} angle={180} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#1f232e', '#13161f']}>
                                                    <View style={styles.feelabels}>
                                                        <Text style={styles.feeTitle}>{feeTitles[index]}</Text>
                                                    </View>
                                                    <Text style={styles.feeText}>{feeDescriptions[index]}</Text>
                                                </LinearGradient>
                                            </TouchableWithoutFeedback>
                                        </View>
                                    )
                                })
                                }
                            </View>
                        </ScrollView>
                    </Screen>
                </View>
            </View>
            <View style={styles.totalsContainer}>
                {notEnoughBalance &&
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={styles.errorLabel} >{getTranslated(language).not_enough_balance}</Text>
                    </View>
                }
                {dustError &&
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={styles.errorLabel} >{getTranslated(language).dust_error}</Text>
                    </View>
                }
                {cantSendAmountWithFee &&
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={styles.errorLabel} >{getTranslated(language).not_enough}</Text>
                    </View>
                }
                {!dustError && !cantSendAmountWithFee && !notEnoughBalance &&
                    <View>
                        <View style={styles.totalsItem}>
                            <Text style={styles.totalsLabel} >{getTranslated(language).bitcoin_network_fee}</Text>
                            <Text style={styles.btcText}>{feeAmount} BTC</Text>
                            <Text style={styles.totalsLabel} >{feeAmountFiat + '  ' + currency}</Text>
                        </View>
                        <View style={styles.totalsItem}>
                            <Text style={styles.totalsLabel} >{getTranslated(language).total}</Text>
                            <Text style={styles.btcText}>{totalAmount} BTC</Text>
                            <Text style={styles.totalsLabel} >{totalAmountFiat + '  ' + currency}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginLeft: 16, marginBottom: insets.bottom + 10 }}>
                            {sendEnabled &&
                                <ButtonPrimary text={getTranslated(language).send} action={sendTransaction} />
                            }
                            {!sendEnabled &&
                                <ButtonPrimaryDisabled text={getTranslated(language).send} action={() => { }} />
                            }
                        </View>
                    </View>
                }
            </View>
            <ConfirmTransactionModal sendingMax={isSendingMax} btcAmount={btcAmount} recipient={address} feeAmount={realFee.toString()} sendCallback={sendTransactionForReal} isVisible={confirmModalShowing} hideModal={() => { setConfirmModalShowing(false) }} />
            <Modal style={{ marginHorizontal: 0, justifyContent: 'flex-end', marginBottom: 0 }} isVisible={sentTransactionModalShowing} backdropTransitionOutTiming={0} >
                {sentTransactionModalShowing &&
                    <View style={{ borderColor: '#2b2f3a', borderTopWidth: 1 }}>
                        <LinearGradient useAngle={true} angle={180} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#13161F', '#090C14']}>
                            <View style={{ marginBottom: insets.bottom + 20, marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                                <Image style={styles.icon} source={require('../assets/images/sent.png')} />
                                <Text style={styles.headerText}>Transaction sent</Text>
                                <Text style={styles.subHeading}>Your transaction has been sent.</Text>
                                <TouchableOpacity style={styles.button} onPress={() => { setSentTransactionModalShowing(false) }}>
                                    <Text style={styles.buttonText}>{getTranslated(language).ok_button}</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                }
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sendingText: {
        color: '#F7931A',
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 22,
        lineHeight: 32,
        marginTop: 30
    },
    sendingSubText: {
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 22,
        color: '#ACB2BB',
        marginTop: 20
    },
    headerContainer: {
        backgroundColor: '#090C14',
        borderBottomColor: '#1F232E',
        borderBottomWidth: 1,
    },
    heading: {
        fontSize: 30,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
    },
    textContain: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    icon: {
        width: 24,
        height: 24
    },
    arrow: {
        width: 16,
        height: 16,
        marginRight: 5,
        marginLeft: 20,
        marginTop: 5,
    },
    bar: {
        width: 100,
        height: 4
    },
    totalBalance: {
        color: '#7E858F',
        fontFamily: 'TitilliumWeb-SemiBold',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 22,
        textTransform: 'uppercase',
        marginRight: 4
    },
    btcBalance: {
        fontFamily: 'TitilliumWeb-Regular',
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 20
    },
    headerText: {
        fontFamily: 'TitilliumWeb-Regular',
        color: '#FFF',
        fontWeight: '400',
        lineHeight: 38,
        fontSize: 26,
        marginTop: 5,
        marginLeft: Platform.OS == 'android' ? 20 : 0
    },
    btcBalanceRow: {
        flexDirection: 'row',
    },
    fiatBalanceRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    button: {
        borderColor: '#434854',
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginHorizontal: 20,
        marginVertical: 20,
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
    currencyText: {
        fontFamily: 'TitilliumWeb-Regular',
        color: '#555B65',
        fontWeight: '400',
        fontSize: 11,
        lineHeight: 18,
        marginLeft: 4,
        marginRight: 16
    },
    currencyTextInput: {
        fontFamily: 'TitilliumWeb-Regular',
        color: '#555B65',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 22,
    },
    fiatBalance: {
        color: '#7E858F',
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'space-between'
    },
    addressText: {
        color: '#ACB2BB',
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
        width: '80%',
        marginBottom: 5
    },
    orangeBorder: {
        borderColor: '#F7931A',
        borderWidth: 1
    },
    qrIcon: {
        width: 40,
        height: 40
    },
    subHeading: {
        fontWeight: '600',
        color: '#7E858F',
        fontSize: 12,
        lineHeight: 22,
        textTransform: 'uppercase',
        fontFamily: 'TitilliumWeb-SemiBold',
    },
    textNormalBorder: {
        borderColor: '#2f3442',
    },
    textErrorBorder: {
        borderColor: 'red',
    },
    textInput: {
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        backgroundColor: '#090C14',
        borderColor: '#2B2F3A',
        borderRadius: 2,
        padding: 16,
        height: 48,
        paddingVertical: 0
    },
    textInputText: {
        fontFamily: 'TitilliumWeb-SemiBold',
        fontSize: 14,
        color: "#fff",
        fontWeight: '600',
        lineHeight: 20,
        height: 40
    },
    amounts: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sendMaxText: {
        color: '#DCE0E7',
        fontFamily: 'TitilliumWeb-SemiBold',
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 22
    },
    sendMaxContainer: {
        backgroundColor: '#2B2F3A',
        alignSelf: 'center',
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 2,
    },
    amountContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    feeLevelsContainer: {
        marginTop: 5,
    },
    feelabels: {
        padding: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    feeLevel: {
        borderRadius: 2,
        marginBottom: 10,
    },
    feeNormalBorder: {
        borderColor: '#2B2F3A',
        borderWidth: 1,
    },
    feeTitle: {
        fontFamily: 'TitilliumWeb-SemiBold',
        color: '#fff',
        fontSize: 15,
        marginHorizontal: 8,
        marginTop: 5
    },
    feeText: {
        color: '#ACB2BB',
        fontFamily: 'TitilliumWeb-Regular',
        marginHorizontal: 16,
        fontSize: 14,
        marginBottom: 5,
        lineHeight: 18,
    },
    swapIcon: {
        width: 24,
        height: 24,
        marginHorizontal: 10,
        marginTop: 30,
    },
    totalsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#1F232E',
        backgroundColor: '#13161F',
        paddingTop: 20,
    },
    totalsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    totalsLabel: {
        fontSize: 12,
        fontFamily: 'TitilliumWeb-Regular',
        color: '#7E858F',
        paddingVertical: 10,
        width: '30%',
    },
    errorLabel: {
        fontSize: 12,
        fontFamily: 'TitilliumWeb-SemiBold',
        color: '#F85656',
        paddingVertical: 10,
        width: '70%',
        textAlign: 'center',
        marginBottom: 20
    },
    btcText: {
        fontFamily: 'TitilliumWeb-Bold',
        color: '#fff',
        width: '35%'
    },
    checkBox: {
        width: 16,
        height: 16,
        marginHorizontal: 20,
    },
});

export default Send