import BigNumber from 'bignumber.js';
import moment from 'moment';
import React from 'react'
import { View, Text, StyleSheet, Image, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import ButtonPrimary from '../buttons/ButtonPrimary';
import { getTranslated } from '../lang/helper';
import { store, WalletState } from '../store/WalletStateStore';
import RefreshButton from './RefreshButton';

interface Props {
    isRefreshing: boolean
    refreshAction: () => void
    numOfTransaction: number
    receiveAction: () => void
    sendAction: () => void
}

const BalanceCard: React.FC<Props> = (props) => {

    const balanceSelector = (state: WalletState) => state.balance
    const balance = useSelector(balanceSelector)

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

    const rate = useSelector(rateSelector)

    const langSelector = (state: WalletState) => state.language
    const language = useSelector(langSelector)

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

    return (
        <Animated.View>
            <View style={styles.balanceCard}>
                <View style={styles.balanceInner}>
                    <View style={styles.balanceTextAndRefresh}>
                        <Text style={styles.balanceText}>{getTranslated(language).total_balance}</Text>
                        <RefreshButton refeshing={props.isRefreshing} pressed={props.refreshAction} />
                    </View>
                    <View style={styles.btcBalanceContainer}>
                        <Text style={styles.btcBalance}>{balance.toString()}</Text>
                        <Text style={styles.btcLabel}>BTC</Text>
                    </View>
                    <View style={styles.btcBalanceContainer}>
                        <Text style={styles.fiatBalance}>{btcToFiat()}</Text>
                        <Text style={styles.fiatLabel}>{currency}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <ButtonPrimary text={getTranslated(language).send} action={props.sendAction} />
                <ButtonPrimary text={getTranslated(language).receive} action={props.receiveAction} />
            </View>
            <View style={styles.transactionsContainer}>
                <Text style={styles.transactionsText}>{props.numOfTransaction} {getTranslated(language).transactions}</Text>
            </View>
            { props.numOfTransaction > 0 &&
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>{getTranslated(language).status}</Text>
                    <Text style={styles.headingText}>{getTranslated(language).date}</Text>
                    <Text style={styles.headingText}>{getTranslated(language).amount}</Text>
                    <Text></Text>
                </View>
            }
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    balanceCard: {
        backgroundColor: '#090C14',
        borderRadius: 2,
        marginHorizontal: 16,
        marginTop: 16
    },
    balanceInner: {
        padding: 16,
    },
    balanceTextAndRefresh: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    balanceText: {
        fontFamily: 'TitilliumWeb-SemiBold',
        color: '#7E858F',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 22,
        textTransform: 'uppercase'
    },
    btcBalanceContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    btcBalance: {
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 32,
        lineHeight: 40,
        color: '#FFF'
    },
    btcLabel: {
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 11,
        lineHeight: 18,
        color: '#555B65',
        marginLeft: 8
    },
    fiatBalance: {
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
        color: '#7E858F',
    },
    fiatLabel: {
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
        color: '#555B65',
        marginLeft: 4
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        marginLeft: 16
    },
    transactionsContainer: {
        marginTop: 32,
        borderBottomColor: '#1F232E',
        borderBottomWidth: 1,

    },
    transactionsText: {
        marginHorizontal: 16,
        marginBottom: 4,
        color: '#7E858F',
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
    },
    headingContainer: {
        backgroundColor: '#090C14',
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        justifyContent: 'space-between'
    },
    headingText: {
        fontFamily: 'TitilliumWeb-SemiBold',
        color: '#7E858F',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 22,
        textTransform: 'uppercase',
        marginHorizontal: 16,
    }
});


export default BalanceCard