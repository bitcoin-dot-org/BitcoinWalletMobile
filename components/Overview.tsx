import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, FlatList, ListRenderItem, Animated, ActivityIndicator } from 'react-native'
import Screen from './Screen';
import TransactionView from './TransactionView'
import { Transaction } from './../wallet/walletTypes'
import { WalletState, isRestoring, setNewlyCreated } from '../store/WalletStateStore';
import { wallet } from './../wallet/wallet'
import ButtonPrimary from '../buttons/ButtonPrimary';
import BalanceCard from './BalanceCard';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BigNumber from 'bignumber.js';
import { getTranslated } from '../lang/helper';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = BottomTabScreenProps<WalletHomeNavigationParamList, 'Overview'>;

const Overview: React.FC<Props> = (props) => {

    const dispatch = useDispatch()

    var opacityRef = useRef(new Animated.Value(0)).current

    const mounted = useRef(true)
    const opacity = opacityRef.interpolate({ inputRange: [80, 150], outputRange: [0, 1] })

    const [isRefreshing, setIsRefreshing] = useState(false)

    const isSyncingSelector = (state: WalletState) => state.isSyncing
    const isSyncing = useSelector(isSyncingSelector)

    const transactionsSelector = (state: WalletState) => state.transactions
    const transactions = useSelector(transactionsSelector)

    const multiDeviceSupportSelector = (state: WalletState) => state.multiDeviceSupport
    const multiDeviceSupport = useSelector(multiDeviceSupportSelector)

    const isRestoringSelector = (state: WalletState) => state.isRestoring
    const isWalletRestoring = useSelector(isRestoringSelector)

    const isNewWalletSelector = (state: WalletState) => state.newlyCreated
    const isNewWallet = useSelector(isNewWalletSelector)

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

    const pushSend = () => {
        props.navigation.dangerouslyGetParent()?.navigate('Send')
    }

    const pushReceive = () => {
        props.navigation.navigate('Receive')
    }

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


    const syncWallet = async (smallSync = true) => {
        await wallet.synchronize(smallSync)
    }

    useEffect(() => {

        // Refresh every 10 minutes with a mini-sync
        const interval = setInterval(() => {
            syncWallet(!multiDeviceSupport)
        }, 600000);

    }, [])

    const renderItem: ListRenderItem<Transaction> = ({ item }) => (
        <TransactionView transaction={item} />
    );

    const insets = useSafeAreaInsets()

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={{ marginTop: insets.top, height: 56 }}>
                    <View style={styles.textContain}>
                        <Text style={styles.headerText}>{getTranslated(language).overview}</Text>
                        <Animated.View style={{ opacity: opacity }}>
                            <View style={styles.btcBalanceRow}>
                                <Text style={styles.totalBalance}>{getTranslated(language).total_balance}:</Text>
                                <Text style={styles.btcBalance}>{balance.toString()}</Text>
                                <Text style={styles.currencyText}>BTC</Text>
                            </View>
                            <View style={styles.fiatBalanceRow}>
                                <Text style={styles.fiatBalance}>{btcToFiat()}</Text>
                                <Text style={styles.currencyText}>{currency}</Text>
                            </View>
                        </Animated.View>
                    </View>
                </View>
            </View>
            <Screen>
                <View style={styles.listContainer}>
                    <Animated.FlatList
                        data={transactions}
                        ListHeaderComponent={<BalanceCard numOfTransaction={transactions.length} isRefreshing={isSyncing} receiveAction={pushReceive} sendAction={pushSend} refreshAction={() => syncWallet(!multiDeviceSupport)} />}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={item => item.hash}
                        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: opacityRef } } }], { useNativeDriver: true })} />

                    {transactions.length == 0 &&
                        <View style={styles.noTransactions}>
                            <Text style={styles.noTransactionsText}>{getTranslated(language).no_transactions}</Text>
                        </View>
                    }
                </View>
            </Screen>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        backgroundColor: '#090C14',
        borderBottomColor: '#1F232E',
        borderBottomWidth: 1,
    },
    listContainer: {
        zIndex: 1,
        flex: 1
    },
    noTransactions: {
        flex: 2,
        alignItems: 'center'
    },
    noTransactionsText: {
        color: '#7E858F',
        fontSize: 17,
        fontFamily: 'TitilliumWeb-Regular',
    },
    headingText: {
        fontSize: 30,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
    },
    regularText: {
        fontSize: 15,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
        marginTop: 20,
        marginBottom: 20,
    },
    textContain: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerText: {
        fontFamily: 'TitilliumWeb-Regular',
        color: '#FFF',
        fontWeight: '400',
        lineHeight: 38,
        fontSize: 26,
        marginLeft: 20,
        marginTop: 5,
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
    btcBalanceRow: {
        flexDirection: 'row',
    },
    fiatBalanceRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
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
    fiatBalance: {
        color: '#7E858F',
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
    }
});

export default Overview