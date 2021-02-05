import BigNumber from 'bignumber.js'
import { AddressLookup, Transaction } from '../wallet/walletTypes'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import AsyncStorage from '@react-native-community/async-storage'
import { persistReducer, persistStore } from 'redux-persist'

export interface WalletState {

    // Whether the user currently has a wallet or not
    isActive: boolean

    // Whether we are syncing
    isSyncing: boolean

    // Whether the user is restoring a wallet
    isRestoring: boolean

    // If the wallet just got created
    newlyCreated: boolean

    // A list of all the transactions we have
    transactions: Transaction[]

    // A list of internal change addresses
    internalAddresses: AddressLookup[]

    // A list of external addresses to receive BTC
    externalAddresses: AddressLookup[]

    // The index of the next free internal change address
    internalIndex: number

    // The index of the next free external address
    externalIndex: number

    // The unspent transaction outputs
    utxos: {}[]

    // The three different fee levels
    feeRates: number[]

    // Fiat rates
    fiatRates: { [key: string]: { [key: string]: number } }

    // User's confirmed balance minus any unconfirmed spends (in satoshis)
    balance: string

    // The user's language
    language: string

    // The user's currency
    currency: string

    // Whether the user wants the wallet to support multiple devices
    multiDeviceSupport: boolean
}

// Our constants
const CLEAR_WALLET = 'CLEAR_WALLET'
const IS_ACTIVE = 'IS_ACTIVE'

const IS_SYNCING = 'IS_SYNCING'
const DONE_SYNCING = 'DONE_SYNCING'
const IS_RESTORING = 'IS_RESTORING'
const NEWLY_CREATED = 'NEWLY_CREATED'

const SET_FEE_RATES = 'SET_FEE_RATES'
const SET_FIAT_RATES = 'SET_FIAT_RATES'

const INCREMENT_EXTERNAL_INDEX = 'INCREMENT_EXTERNAL_INDEX'
const INCREMENT_INTERNAL_INDEX = 'INCREMENT_INTERNAL_INDEX'

const ADD_TRANSACTION = 'ADD_TRANSACTION'
const UPDATE_TRANSACTION = 'UPDATE_TRANSACTION'

const ADD_EXTERNAL_ADDRESS = 'ADD_EXTERNAL_ADDRESS'
const ADD_INTERNAL_ADDRESS = 'ADD_INTERNAL_ADDRESS'

const UPDATE_EXTERNAL_ADDRESS_BALANCE = 'UPDATE_EXTERNAL_ADDRESS_BALANCE'
const UPDATE_INTERNAL_ADDRESS_BALANCE = 'UPDATE_INTERNAL_ADDRESS_BALANCE'

const INCREMENT_BALANCE = 'INCREMENT_BALANCE'
const DECREMENT_BALANCE = 'DECREMENT_BALANCE'

const SET_UTXOS = 'SET_UTXOS'

const SET_CURRENCY = "SET_CURRENCY"
const SET_LANGUAGE = "SET_LANGUAGE"
const SET_MULTI_DEVICE_SUPPORT = "SET_MULTI_DEVICE_SUPPORT"

// Action defintions

interface ClearWalletAction {
    type: typeof CLEAR_WALLET
}

interface IsActiveAction {
    type: typeof IS_ACTIVE
    active: boolean
}

interface IsSyncingAction {
    type: typeof IS_SYNCING
}

interface IsDoneSyncingAction {
    type: typeof DONE_SYNCING
}

interface IsRestoringAction {
    type: typeof IS_RESTORING,
    restoring: boolean
}
interface NewlyCreatedAction {
    type: typeof NEWLY_CREATED
    new: boolean
}

interface SetFeeRatesAction {
    type: typeof SET_FEE_RATES
    rates: number[]
}

interface SetFiatRatesAction {
    type: typeof SET_FIAT_RATES
    rates: {}
}

interface IncrementExternalIndexAction {
    type: typeof INCREMENT_EXTERNAL_INDEX
}

interface IncrementInternalIndexAction {
    type: typeof INCREMENT_INTERNAL_INDEX
}

interface AddTransactionAction {
    type: typeof ADD_TRANSACTION,
    transaction: Transaction
}

interface UpdateTransactionAction {
    type: typeof UPDATE_TRANSACTION,
    hash: string
    height: number
    confirmed: boolean
    amount: string
}

interface AddExternalAddressAction {
    type: typeof ADD_EXTERNAL_ADDRESS,
    address: AddressLookup
}

interface AddInternalAddressAction {
    type: typeof ADD_INTERNAL_ADDRESS,
    address: AddressLookup
}

interface UpdateExternalAddressBalanceAction {
    type: typeof UPDATE_EXTERNAL_ADDRESS_BALANCE,
    address: string
    balance: number
}

interface UpdateInternalAddressBalanceAction {
    type: typeof UPDATE_INTERNAL_ADDRESS_BALANCE,
    address: string
    balance: number
}

interface IncrementBalanceAction {
    type: typeof INCREMENT_BALANCE,
    amount: number
}

interface DecrementBalanceAction {
    type: typeof DECREMENT_BALANCE,
    amount: number
}

interface SetUtxosAction {
    type: typeof SET_UTXOS,
    utxos: {}[]
}

interface SetCurrencyAction {
    type: typeof SET_CURRENCY
    currency: string
}

interface SetLanguageAction {
    type: typeof SET_LANGUAGE
    language: string
}

interface SetMultiDeviceSupportAction {
    type: typeof SET_MULTI_DEVICE_SUPPORT
    enabled: boolean
}

// Action creators
export function clearWallet(): ClearWalletAction {
    return {
        type: CLEAR_WALLET
    }
}

export function setIsActive(active: boolean): IsActiveAction {
    return {
        type: IS_ACTIVE,
        active: active
    }
}

export function isSyncing(): IsSyncingAction {
    return {
        type: IS_SYNCING
    }
}

export function isDoneSyncing(): IsDoneSyncingAction {
    return {
        type: DONE_SYNCING
    }
}

export function isRestoring(restoring: boolean): IsRestoringAction {
    return {
        type: IS_RESTORING,
        restoring: restoring
    }
}

export function setNewlyCreated(created: boolean): NewlyCreatedAction {
    return {
        type: NEWLY_CREATED,
        new: created
    }
}

export function setFeeRates(rates: number[]): SetFeeRatesAction {
    return {
        type: SET_FEE_RATES,
        rates: rates
    }
}

export function setFiatRates(rates: {}): SetFiatRatesAction {
    return {
        type: SET_FIAT_RATES,
        rates: rates
    }
}

export function incrementExternalIndex(): IncrementExternalIndexAction {
    return {
        type: INCREMENT_EXTERNAL_INDEX
    }
}

export function incrementInternalIndex(): IncrementInternalIndexAction {
    return {
        type: INCREMENT_INTERNAL_INDEX
    }
}

export function addTransaction(tx: Transaction): AddTransactionAction {
    return {
        type: ADD_TRANSACTION,
        transaction: tx
    }
}

export function updateTransaction(hash: string, height: number, amount: string, confirmed: boolean): UpdateTransactionAction {
    return {
        type: UPDATE_TRANSACTION,
        hash: hash,
        height: height,
        confirmed: confirmed,
        amount: amount
    }
}

export function addExternalAddress(address: AddressLookup): AddExternalAddressAction {
    return {
        type: ADD_EXTERNAL_ADDRESS,
        address: address
    }
}

export function addInternalAddress(address: AddressLookup): AddInternalAddressAction {
    return {
        type: ADD_INTERNAL_ADDRESS,
        address: address
    }
}


export function updateExternalAddress(balance: number, address: string): UpdateExternalAddressBalanceAction {
    return {
        type: UPDATE_EXTERNAL_ADDRESS_BALANCE,
        balance: balance,
        address: address
    }
}

export function updateInternalAddress(balance: number, address: string): UpdateInternalAddressBalanceAction {
    return {
        type: UPDATE_INTERNAL_ADDRESS_BALANCE,
        balance: balance,
        address: address
    }
}

export function setUtxos(utxos: {}[]): SetUtxosAction {
    return {
        type: SET_UTXOS,
        utxos: utxos
    }
}

export function setCurrency(currency: string): SetCurrencyAction {
    return {
        type: SET_CURRENCY,
        currency: currency
    }
}

export function setLanguage(language: string): SetLanguageAction {
    return {
        type: SET_LANGUAGE,
        language: language
    }
}

export function setMultiDeviceSupport(enabled: boolean): SetMultiDeviceSupportAction {
    return {
        type: SET_MULTI_DEVICE_SUPPORT,
        enabled: enabled
    }
}

// Define different types of actions

type WalletStateActionTypes = ClearWalletAction | IsActiveAction | IsSyncingAction | IsDoneSyncingAction | IsRestoringAction | NewlyCreatedAction | SetFeeRatesAction | SetFiatRatesAction | IncrementExternalIndexAction | IncrementInternalIndexAction | AddTransactionAction | UpdateTransactionAction | AddExternalAddressAction | AddInternalAddressAction | UpdateExternalAddressBalanceAction | UpdateInternalAddressBalanceAction | IncrementBalanceAction | DecrementBalanceAction | SetUtxosAction | SetCurrencyAction | SetLanguageAction | SetMultiDeviceSupportAction

// Our starting initiate state

const initialState: WalletState = {
    isActive: false,
    isSyncing: false,
    isRestoring: false,
    newlyCreated: false,
    transactions: [],
    internalAddresses: [],
    externalAddresses: [],
    internalIndex: 0,
    externalIndex: 0,
    utxos: [],
    feeRates: [],
    fiatRates: {},
    balance: "0",
    currency: 'USD',
    language: 'en',
    multiDeviceSupport: false
}

export function walletReducer(state = initialState, action: WalletStateActionTypes): WalletState {
    switch (action.type) {

        case CLEAR_WALLET: {
            return {
                ...state,
                isActive: false,
                isSyncing: false,
                isRestoring: false,
                newlyCreated: false,
                transactions: [],
                internalAddresses: [],
                externalAddresses: [],
                internalIndex: 0,
                externalIndex: 0,
                utxos: [],
                balance: "0",
                multiDeviceSupport: false
            }
        }

        case IS_ACTIVE: {
            return {
                ...state, isActive: action.active
            }
        }

        case IS_SYNCING: {
            return {
                ...state, isSyncing: true
            }
        }

        case DONE_SYNCING: {
            return {
                ...state, isSyncing: false
            }
        }

        case IS_RESTORING: {
            return {
                ...state, isRestoring: action.restoring
            }
        }

        case NEWLY_CREATED: {
            return {
                ...state, newlyCreated: action.new
            }
        }

        case SET_FEE_RATES: {
            return {
                ...state, feeRates: action.rates
            }
        }

        case SET_FIAT_RATES: {
            return {
                ...state, fiatRates: action.rates
            }
        }

        case INCREMENT_EXTERNAL_INDEX: {

            return {
                ...state,
                externalIndex: state.externalIndex + 1,
                externalAddresses: state.externalAddresses.map(a =>
                    a.index == state.externalIndex + 1 ? { ...a, isLookAhead: false } : a
                )
            }
        }

        case INCREMENT_INTERNAL_INDEX: {


            return {
                ...state,
                internalIndex: state.internalIndex + 1,
                internalAddresses: state.internalAddresses.map(a =>
                    a.index == state.internalIndex + 1 ? { ...a, isLookAhead: false } : a
                )
            }
        }

        case ADD_TRANSACTION: {

            let newBalance = state.balance

            // Only change balance if confirmed tx, or one of our own unconfirmed spends
            if ((!action.transaction.confirmed && action.transaction.amount.includes('-')) || (action.transaction.confirmed)) {
                newBalance = new BigNumber(state.balance).plus(new BigNumber(action.transaction.amount)).toString()
            }

            return {
                ...state, balance: newBalance, transactions: [action.transaction, ...state.transactions,]
            }
        }


        case UPDATE_TRANSACTION: {
            
            let derivedBalance = state.balance
            let newTransactions = state.transactions.map((t) => t.hash == action.hash ? { ...t, height: action.height, confirmed: action.confirmed } : t)

            // Since a transaction got confirmed, let's re-order 
            if (action.confirmed) {
                let confirmed = newTransactions.filter((tx) => tx.confirmed)
                let unconfirmed = newTransactions.filter((tx) => !tx.confirmed)

                let confirmedSorted = confirmed.sort((tx1, tx2) => tx2.height - tx1.height)
                newTransactions = unconfirmed.concat(confirmedSorted)

                let derived = new BigNumber(0)

                // Get the new derived balance
                for (var i = 0; i < confirmedSorted.reverse().length; i++) {
                    derived = derived.plus(new BigNumber(confirmedSorted.reverse()[i].amount))
                }

                derivedBalance = derived.toString()
            }

            return {
                ...state,
                balance: derivedBalance,
                transactions: newTransactions
            }
        }

        case ADD_EXTERNAL_ADDRESS: {
            return {
                ...state, externalAddresses: [...state.externalAddresses, action.address]
            }
        }

        case ADD_INTERNAL_ADDRESS: {
            return {
                ...state, internalAddresses: [...state.internalAddresses, action.address]
            }
        }

        case UPDATE_EXTERNAL_ADDRESS_BALANCE: {


            return {
                ...state,
                externalAddresses: state.externalAddresses.map((a) => a.address == action.address ? { ...a, balance: action.balance } : a)
            }
        }

        case UPDATE_INTERNAL_ADDRESS_BALANCE: {


            return {
                ...state,
                internalAddresses: state.internalAddresses.map((a) => a.address == action.address ? { ...a, balance: action.balance } : a)
            }
        }

        case INCREMENT_BALANCE: {
            return {
                ...state, balance: new BigNumber(state.balance).plus(new BigNumber(action.amount)).toString()
            }
        }

        case DECREMENT_BALANCE: {
            return {
                ...state, balance: new BigNumber(state.balance).minus(new BigNumber(action.amount)).toString()
            }
        }

        case SET_UTXOS: {
            return {
                ...state, utxos: action.utxos
            }
        }

        case SET_LANGUAGE: {

            return {
                ...state, language: action.language
            }
        }

        case SET_CURRENCY: {
            return {
                ...state, currency: action.currency
            }
        }

        case SET_MULTI_DEVICE_SUPPORT: {
            return {
                ...state, multiDeviceSupport: action.enabled
            }
        }

        default:
            return state
    }
}

const persistConfig = {
    key: 'root',
    storage: AsyncStorage
}

const persistedReducer = persistReducer(persistConfig, walletReducer)

export const store = createStore(persistedReducer, applyMiddleware(thunk))
export const persistor = persistStore(store)
