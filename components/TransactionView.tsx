import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, Linking } from 'react-native'
import { Transaction } from './../wallet/walletTypes'
import moment from 'moment'
import 'moment/locale/ca'
import 'moment/locale/es'
import 'moment/locale/fr'
import 'moment/locale/it'
import 'moment/locale/ja'
import 'moment/locale/pt-br'
import { WalletState } from '../store/WalletStateStore'
import { useSelector } from 'react-redux'
import { getTranslated } from '../lang/helper'
import { TouchableOpacity } from 'react-native-gesture-handler'

interface Props {
    transaction: Transaction
}

const TransactionView: React.FC<Props> = (props) => {

    const currencySelector = (state: WalletState) => state.currency
    const currency = useSelector(currencySelector)

    const [day, setDay] = useState(moment(props.transaction.time).format('MMM. D, YYYY'))
    const [hour, setHour] = useState(moment(props.transaction.time).format('h:mm A'))

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

    const rate = useSelector(rateSelector)

    const langSelector = (state: WalletState) => state.language
    const language = useSelector(langSelector)

    const getStatusText = () => {
        if (props.transaction.confirmed) {
            return getTranslated(language).complete
        }
        else {
            if (props.transaction.height > 0) {
                return getTranslated(language).processing
            }
            else {
                return getTranslated(language).unconfirmed
            }
        }
    }

    const getCorrectStyle = () => {
        if (props.transaction.confirmed) {
            return styles.complete
        }
        else {
            if (props.transaction.height > 0) {
                return styles.pending
            }
            else {
                return styles.unconfirmed
            }
        }
    }

    const btcToFiat = () => {
        let fiat = (parseFloat(props.transaction.amount) * rate).toFixed(2);

        if (isNaN(parseFloat(fiat))) {
            fiat = "0";
        }

        if (!canGetRates) {
            return "N/A"
        }

        return new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(parseFloat(fiat)).replace(currency, '').trim();
    }

    useEffect(() => {
        setDay(moment(props.transaction.time).locale(language).format('MMM. D, YYYY'))
        setHour(moment(props.transaction.time).locale(language).format('h:mm A'))
    })

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                    <View style={getCorrectStyle()} />
                    <View style={{ alignSelf: 'center', width: 100 }}><Text style={styles.regularText}>{getStatusText()}</Text></View>
                </View>
                <View style={{}}>
                    <Text style={styles.regularText}>{day}</Text>
                    <Text style={styles.grayedText}>{hour}</Text>
                </View>
                <View style={{}}>
                    <View style={{ flexDirection: 'row' }}><Text style={[(props.transaction.amount.includes('-') ? styles.amountExpense : styles.amountIncome), { width: 90, textAlign: 'right', paddingRight: 5 }]}>{props.transaction.amount}</Text><Text style={styles.grayedText}>BTC</Text></View>
                    <View style={{ flexDirection: 'row' }}><Text style={[styles.amountCurrency, { width: 90, textAlign: 'right', paddingRight: 5 }]}>{btcToFiat()}</Text><Text style={styles.grayedText}>{currency}</Text></View>
                </View>
                <View>
                    <TouchableOpacity onPress={() => { Linking.openURL('https://blockchain.com/btc/tx/' + props.transaction.hash).catch(error => console.error("Something went wrong", error)) }}>
                        <Image style={styles.icon} source={require('../assets/images/link.png')} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#090C14',
        marginBottom: 2,
    },
    innerContainer: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    icon: {
        width: 16,
        height: 16,
    },
    complete: {
        width: 4,
        height: 4,
        borderRadius: 100 / 2,
        backgroundColor: '#32D74B',
        marginRight: 8,
    },
    pending: {
        width: 4,
        height: 4,
        borderRadius: 100 / 2,
        backgroundColor: '#FF9500',
        marginRight: 8,
    },
    unconfirmed: {
        width: 4,
        height: 4,
        borderRadius: 100 / 2,
        backgroundColor: '#FF453A',
        marginRight: 8,
    },
    regularText: {
        color: '#DCE0E7',
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    grayedText: {
        color: '#7E858F',
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 11,
        fontWeight: '400',
        lineHeight: 20,
    },
    amountIncome: {
        color: '#528C5B',
        fontWeight: 'bold',
        fontFamily: 'TitilliumWeb-Regular',
    },
    amountExpense: {
        color: '#B24444',
        fontWeight: 'bold',
        fontFamily: 'TitilliumWeb-Regular',
    },
    amountCurrency: {
        color: '#7E858F',
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 12,
    },
});

export default TransactionView