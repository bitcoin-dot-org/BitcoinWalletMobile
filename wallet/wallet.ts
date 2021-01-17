import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import * as bip32 from 'bip32'
import ElectrumClient from 'electrum-client'
import accumulative from 'coinselect/accumulative'
import split from 'coinselect/split'
import Axios from 'axios'
import BigNumber from 'bignumber.js'
import RNSecureKeyStore from "react-native-secure-key-store";
import { store, setUtxos, isSyncing, isDoneSyncing, incrementExternalIndex, incrementInternalIndex, updateExternalAddress, updateInternalAddress, addExternalAddress, addInternalAddress, updateTransaction, addTransaction, setFeeRates, setFiatRates, isRestoring, setNewlyCreated } from '../store/WalletStateStore'
import { AddressLookup, Transaction } from './walletTypes'
import { Platform } from 'react-native'

export class Wallet {

    seed!: string
    root!: bip32.BIP32Interface
    client!: any
    seedLoaded = false
    setUpRoot = false
    setUpClient = false
    lastTransaction = new bitcoin.Psbt()
    shouldFetchUtxos = false
    internalAddressesToFetchUtxosFor: AddressLookup[] = []
    externalAddressesToFetchUtxosFor: AddressLookup[] = []
    isCreatingAddresses = false

    async setUpSeedAndRoot() {
        try {
            let s = await RNSecureKeyStore.get('WALLET_SEED')
            this.seed = s
            let seedBuffer = bip39.mnemonicToSeedSync(this.seed)
            this.root = bip32.fromSeed(seedBuffer)
            this.setUpRoot = true
        }
        catch {
        }
    }

    async getExternalAddress(index: number): Promise<string> {

        if (!this.setUpRoot) {
            await this.setUpSeedAndRoot()
        }

        let first = this.root.derivePath(`m/49'/0'/0'/0/${index}`)
        let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: first.publicKey })
        let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh })
        let address = p2sh.address!
        return address
    }

    async getInternalAddress(index: number): Promise<string> {

        if (!this.setUpRoot) {
            await this.setUpSeedAndRoot()
        }

        let first = this.root.derivePath(`m/49'/0'/0'/1/${index}`)
        let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: first.publicKey })
        let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh })
        let address = p2sh.address!
        return address
    }

    async connectToElectrum() {
        try {
            this.client = new ElectrumClient(50001, "electrum1.bitcoin.org", 'tcp')
            await this.client.initElectrum({ client: 'Bitcoin Wallet', version: '1.4' });
            await this.client.connect()
            this.setUpClient = true
            this.client.onError = () => {
                if (Platform.OS === 'android' && this.setUpClient) {
                    this.client.close()
                    this.setUpClient = false
                    setTimeout(() => {
                        this.connectToElectrum()
                    }, 500);
                    return;
                }
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    async finishGeneratingAddresses() {

        if((store.getState().externalAddresses.length<21 || store.getState().internalAddresses.length<21) && !this.isCreatingAddresses && store.getState().isActive) {

            this.isCreatingAddresses = true

            let externalSize = store.getState().externalAddresses.length
            let internalSize = store.getState().internalAddresses.length

            let externalAddress = await this.getExternalAddress(externalSize)
            let internalAddress = await this.getInternalAddress(internalSize)

            if((externalSize + 1) <= 21) {
                store.dispatch(addExternalAddress(new AddressLookup(externalSize, externalAddress, 0, true)))
            }

            if((internalSize + 1) <= 21) {
                store.dispatch(addInternalAddress(new AddressLookup(internalSize, internalAddress, 0, true)))
            }

            this.isCreatingAddresses = false
        }
    }

    async fetchUtxos() {

        if (!this.setUpRoot) {
            await this.setUpSeedAndRoot()
        }

        let request = await Axios.get('https://blockchain.info/latestblock?&cors=true')

        if (request.status == 200) {

            let newUtxos = new Array()

            let height = request.data.height

            let addresses = this.externalAddressesToFetchUtxosFor

            for (var i = 0; i < addresses.length; i++) {
                let utxo: any[] = await this.client.blockchainScripthash_listunspent(this.convertToElectrumScriptHash(addresses[i].address))
                for (var x = 0; x < utxo.length; x++) {
                    if ((height - utxo[x].height) >= 6) { // Only utxos with 6 confirmations if the address is EXTERNAL
                        if (!this.setUpRoot) {
                            let seedBuffer = await bip39.mnemonicToSeed(this.seed)
                            this.root = bip32.fromSeed(seedBuffer)
                            this.setUpRoot = true
                        }

                        let isExternal = store.getState().externalAddresses.filter((a) => a.address == addresses[i].address).length > 0
                        let index = addresses[i].index
                        let path = this.root.derivePath(`m/49'/0'/0'/${isExternal ? '0' : '1'}/${index}`)
                        let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: path.publicKey })
                        let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh })

                        newUtxos.push({ height: utxo[x].height, txId: utxo[x].tx_hash, value: utxo[x].value, vout: utxo[x].tx_pos, script: p2sh.output!, witnessUtxo: { script: p2sh.output!, value: utxo[x].value } })
                    }
                }
            }

            addresses = this.internalAddressesToFetchUtxosFor

            for (var i = 0; i < addresses.length; i++) {
                let utxo: any[] = await this.client.blockchainScripthash_listunspent(this.convertToElectrumScriptHash(addresses[i].address))
                for (var x = 0; x < utxo.length; x++) {

                    if (!this.setUpRoot) {
                        let seedBuffer = await bip39.mnemonicToSeed(this.seed)
                        this.root = bip32.fromSeed(seedBuffer)
                        this.setUpRoot = true
                    }

                    let isExternal = store.getState().externalAddresses.filter((a) => a.address == addresses[i].address).length > 0
                    let index = addresses[i].index
                    let path = this.root.derivePath(`m/49'/0'/0'/${isExternal ? '0' : '1'}/${index}`)
                    let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: path.publicKey })
                    let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh })

                    newUtxos.push({ height: utxo[x].height, txId: utxo[x].tx_hash, value: utxo[x].value, vout: utxo[x].tx_pos, script: p2sh.output!, witnessUtxo: { script: p2sh.output!, value: utxo[x].value } })

                }

            }

            store.dispatch(setUtxos(newUtxos))
        }
    }

    async fetchFeeRates() {
        const important = await this.client.blockchainEstimatefee(6)
        const standard = await this.client.blockchainEstimatefee(10)
        const low = await this.client.blockchainEstimatefee(20)
        let feeRates = [Math.ceil(new BigNumber(low).multipliedBy(100000000).dividedBy(1000).toNumber()), Math.ceil(new BigNumber(standard).multipliedBy(100000000).dividedBy(1000).toNumber()), Math.ceil(new BigNumber(important).multipliedBy(100000000).dividedBy(1000).toNumber())]
        store.dispatch(setFeeRates(feeRates))
    }

    async synchronize(smallSync: boolean) {

        if(store.getState().isSyncing) {
            return
        }

        store.dispatch(isSyncing())

        try {
            // This will be set to true if any new transactions have occurred and we need to fetch utxos
            this.shouldFetchUtxos = false || !this.setUpClient

            // Let's initialize our client if we haven't done so already
            if (!this.setUpClient) {
                await this.connectToElectrum()
            }

            // First fetch the addresses we care about from the database

            var externalAddresses: AddressLookup[] = []
            var internalAddresses: AddressLookup[] = []

            if (store.getState().isRestoring) {
                externalAddresses = store.getState().externalAddresses
                internalAddresses = store.getState().internalAddresses

                this.externalAddressesToFetchUtxosFor = []
                this.internalAddressesToFetchUtxosFor = []
            }

            else if (store.getState().newlyCreated) {
                externalAddresses = store.getState().externalAddresses.filter((a) => !a.isLookAhead)
                internalAddresses = store.getState().internalAddresses.filter((a) => !a.isLookAhead)

                this.externalAddressesToFetchUtxosFor = externalAddresses.filter((a) => a.balance > 0)
                this.internalAddressesToFetchUtxosFor = internalAddresses.filter((a) => a.balance > 0)
            }

            else {
                if (smallSync) {
                    externalAddresses = store.getState().externalAddresses.filter((a) => !a.isLookAhead)
                    internalAddresses = store.getState().internalAddresses.filter((a) => !a.isLookAhead || a.balance > 0)
                }
                else {
                    externalAddresses = store.getState().externalAddresses
                    internalAddresses = store.getState().internalAddresses
                }

                this.externalAddressesToFetchUtxosFor = externalAddresses.filter((a) => a.balance > 0)
                this.internalAddressesToFetchUtxosFor = internalAddresses.filter((a) => a.balance > 0)

            }


            await wallet.finishGeneratingAddresses()
            await this.processAddresses(externalAddresses, internalAddresses)

            // We need to fetch the utxos
            if (this.shouldFetchUtxos) {
                await this.fetchUtxos()
            }

            //Get the fiat rates
            let request = await Axios.get("https://www.blockchain.com/ticker?&cors=true")

            if (request.status == 200) {
                if (request.data["USD"] != undefined) {
                    store.dispatch(setFiatRates(request.data))
                }
            }

            if (store.getState().isRestoring) {
                store.dispatch(isRestoring(false))
            }

            await wallet.fetchFeeRates()

            store.dispatch(isDoneSyncing())
        }

        catch {
            store.dispatch(isDoneSyncing())
        }

    }

    // Fetches balance information and potential transactions for the given addresses
    async processAddresses(externalAddresses: AddressLookup[], internalAddresses: AddressLookup[]) {

        if (externalAddresses.length == 0 && internalAddresses.length == 0) {
            return
        }

        // Addresses that need further processing (for example they are added lookahead addresses)
        let externalsNeedLookup: AddressLookup[] = []
        let internalsNeedLookup: AddressLookup[] = []

        // We use this to keep track of and store newly observed transactions we don't yet know about
        let newTransactions: Transaction[] = new Array()

        let scriptHashToAddressLookup: { [key: string]: string } = {}
        let addressToBalanceLookup: { [key: string]: string } = {}
        let scripthashes = [];

        for (var i = 0; i < externalAddresses.length; i++) {
            let addressString = externalAddresses[i].address
            let scriptHash = this.convertToElectrumScriptHash(addressString)
            scripthashes.push(scriptHash)
            scriptHashToAddressLookup[scriptHash] = addressString
        }

        let chunks = this.splitIntoChunks(scripthashes, 50)

        for (var i = 0; i < chunks.length; i++) {
            let results = await this.client.blockchainScripthash_getBalanceBatch(chunks[i]);

            for (var x = 0; x < results.length; x++) {
                addressToBalanceLookup[scriptHashToAddressLookup[results[x].param]] = results[x].result.confirmed + results[x].result.unconfirmed
            }
        }

        let scriptHashToAddressLookupInternal: { [key: string]: string } = {}
        let addressToBalanceLookupInternal: { [key: string]: string } = {}
        let scripthashesInternal = [];

        for (var i = 0; i < internalAddresses.length; i++) {
            let addressString = internalAddresses[i].address
            let scriptHash = this.convertToElectrumScriptHash(addressString)
            scripthashesInternal.push(scriptHash)
            scriptHashToAddressLookupInternal[scriptHash] = addressString
        }

        chunks = this.splitIntoChunks(scripthashesInternal, 50)

        for (var i = 0; i < chunks.length; i++) {
            let results = await this.client.blockchainScripthash_getBalanceBatch(chunks[i]);

            for (var x = 0; x < results.length; x++) {
                addressToBalanceLookupInternal[scriptHashToAddressLookupInternal[results[x].param]] = results[x].result.confirmed + results[x].result.unconfirmed
            }
        }


        /* Cycle through the addresses and get the balance, if the address is a lookahead address,
        then we increment the external or internal trackers until we catch up fully, then we re-populate the addresses */

        for (var i = 0; i < externalAddresses.length; i++) {

            let balance: any = addressToBalanceLookup[externalAddresses[i].address]

            // Transactions that we don't know about have occurred
            if (balance != externalAddresses[i].balance) {

                let transactions: any[] = await this.client.blockchainScripthash_getHistory(this.convertToElectrumScriptHash(externalAddresses[i].address))

                if (transactions.length > 0) {
                    this.shouldFetchUtxos = true
                }

                // Our external index trackers are behind so we need to catch up
                if ((transactions.length > 0) && externalAddresses[i].index >= store.getState().externalIndex) {
                    for (var j = 0; j <= externalAddresses[i].index - store.getState().externalIndex; j++) {
                        store.dispatch(incrementExternalIndex())
                        let newAddress = await this.getExternalAddress(store.getState().externalIndex + 20)
                        externalsNeedLookup.push(new AddressLookup(store.getState().externalIndex + 20, newAddress, -1, true))
                        store.dispatch(addExternalAddress(new AddressLookup(store.getState().externalIndex + 20, newAddress, -1, true)))
                    }
                }

                for (var j = 0; j < transactions.length; j++) {
                    // Make sure we haven't already saved the transaction or we don't already have it
                    let exists = store.getState().transactions.filter((tx) => tx.confirmed && tx.hash == transactions[j].tx_hash)

                    if (exists.length == 0 && newTransactions.filter((tx) => tx.hash == transactions[j].tx_hash).length == 0) {

                        // Gotta update the utxos now that we have a new transaction with 6 confirmations
                        if (transactions[j].confirmations >= 6) {
                            newTransactions.push(new Transaction(transactions[j].tx_hash, '0', transactions[j].height, new Date(), true))
                        }

                        else {
                            newTransactions.push(new Transaction(transactions[j].tx_hash, '0', transactions[j].height, new Date(), false))
                        }
                    }
                }
            }

            // This is set when the wallet is first created to force look up of the history, we can set to 0 now that we have history
            if (externalAddresses[i].balance == -1) {
                store.dispatch(updateExternalAddress(0, externalAddresses[i].address))
            }

        }

        for (var i = 0; i < internalAddresses.length; i++) {
            let balance: any = addressToBalanceLookupInternal[internalAddresses[i].address]

            // Transactions that we don't know about have occurred
            if (balance != internalAddresses[i].balance) {

                let transactions: any[] = await this.client.blockchainScripthash_getHistory(this.convertToElectrumScriptHash(internalAddresses[i].address))

                if (transactions.length > 0) {
                    this.shouldFetchUtxos = true
                }

                // Our internal index trackers are behind so we need to catch up
                if ((transactions.length > 0) && internalAddresses[i].index >= store.getState().internalIndex) {
                    for (var j = 0; j <= internalAddresses[i].index - store.getState().internalIndex; j++) {
                        store.dispatch(incrementInternalIndex())
                        let newAddress = await this.getInternalAddress(store.getState().internalIndex + 20)
                        internalsNeedLookup.push(new AddressLookup(store.getState().internalIndex + 20, newAddress, -1, true))
                        store.dispatch(addInternalAddress(new AddressLookup(store.getState().internalIndex + 20, newAddress, -1, true)))
                    }
                }

                for (var j = 0; j < transactions.length; j++) {
                    // Make sure we haven't already saved the transaction or we don't already have it
                    let exists = store.getState().transactions.filter((tx) => tx.confirmed && tx.hash == transactions[j].tx_hash)
                    if (exists.length == 0 && newTransactions.filter((tx) => tx.hash == transactions[j].tx_hash).length == 0) {
                        if (transactions[j].confirmations >= 6) {
                            newTransactions.push(new Transaction(transactions[j].tx_hash, '0', transactions[j].height, new Date(), true))
                        }
                        else {
                            newTransactions.push(new Transaction(transactions[j].tx_hash, '0', transactions[j].height, new Date(), false))
                        }
                    }
                }
            }

            // This is set when the wallet is first created to force look up of the history, we can set to 0 now that we have history
            if (internalAddresses[i].balance == -1) {
                store.dispatch(updateInternalAddress(0, internalAddresses[i].address))
            }

        }

        // Confirmed transactions (sorted by height)
        let confirmedTransactions = newTransactions.filter((tx) => tx.height > 0).sort((tx1, tx2) => tx1.height - tx2.height)

        // Unconfirmed transactions
        let unconfirmedTransactions = newTransactions.filter((tx) => tx.height == 0)

        await this.processTransactions(confirmedTransactions, externalAddresses, internalAddresses)
        await this.processTransactions(unconfirmedTransactions, externalAddresses, internalAddresses)
        await this.processAddresses(externalsNeedLookup, internalsNeedLookup)

    }


    async processTransactions(newTransactions: Transaction[], externalAddresses: AddressLookup[], internalAddresses: AddressLookup[]) {
        for (var i = 0; i < newTransactions.length; i++) {
            let transaction = await this.client.blockchainTransaction_get(newTransactions[i].hash, true)
            let amount = new BigNumber(0)

            // Read the inputs
            for (var j = 0; j < transaction.vin.length; j++) {

                // We need to fetch the referenced input transaction to get the addresses and amounts
                let inputTransaction = await this.client.blockchainTransaction_get(transaction.vin[j].txid, true)
                for (var k = 0; k < inputTransaction.vout.length; k++) {
                    if (transaction.vin[j].vout == inputTransaction.vout[k].n) {
                        for (var x = 0; x < inputTransaction.vout[k].scriptPubKey.addresses.length; x++) {
                            let address: string = inputTransaction.vout[k].scriptPubKey.addresses[x]
                            if (externalAddresses.filter((a) => a.address == address).length > 0 || internalAddresses.filter((a) => a.address == address).length > 0) {
                                amount = amount.minus(inputTransaction.vout[k].value)

                                // Spent from an external address so update our balance
                                if (externalAddresses.filter((a) => a.address == address).length > 0) {
                                    for (var l = 0; l < externalAddresses.length; l++) {
                                        if (externalAddresses[l].address == address) {
                                            if (transaction.confirmations >= 6) {
                                                let satoshi = new BigNumber(inputTransaction.vout[k].value).multipliedBy(100000000)
                                                let currentBalance = store.getState().externalAddresses.filter((a) => a.address == externalAddresses[l].address)[0].balance
                                                let newBalance = new BigNumber(currentBalance).minus(satoshi).toNumber()
                                                store.dispatch(updateExternalAddress(newBalance, externalAddresses[l].address))

                                                if(newBalance == 0) {
                                                    this.externalAddressesToFetchUtxosFor = this.externalAddressesToFetchUtxosFor.filter((a) => a.address != externalAddresses[l].address)
                                                }
                                            }
                                        }
                                    }
                                }

                                // Need to update the balance of one of our internal addresses as we have spent from it
                                if (internalAddresses.filter((a) => a.address == address).length > 0) {
                                    for (var l = 0; l < internalAddresses.length; l++) {
                                        if (internalAddresses[l].address == address) {
                                            if (transaction.confirmations >= 6) {
                                                store.dispatch(updateInternalAddress(0, internalAddresses[l].address))
                                            }
                                            // We don't need to fetch UTXOs for this address anymore
                                            this.internalAddressesToFetchUtxosFor = this.internalAddressesToFetchUtxosFor.filter((a) => a.address != internalAddresses[l].address)
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }


            // Read the outputs
            for (var j = 0; j < transaction.vout.length; j++) {
                for (var k = 0; k < transaction.vout[j].scriptPubKey.addresses.length; k++) {
                    let address: string = transaction.vout[j].scriptPubKey.addresses[k]

                    // If we've received to an external address, credit the amount
                    if (externalAddresses.filter((a) => a.address == address).length > 0) {
                        amount = amount.plus(transaction.vout[j].value)

                        // Find the external address
                        for (var l = 0; l < externalAddresses.length; l++) {

                            // We got it
                            if (externalAddresses[l].address == address) {

                                // Let's adjust our balance if we have 6 confs and add it to our addressesses to get UTXOs for
                                if (transaction.confirmations >= 6) {
                                    let satoshi = new BigNumber(transaction.vout[j].value).multipliedBy(100000000)
                                    let currentBalance = store.getState().externalAddresses.filter((a) => a.address == externalAddresses[l].address)[0].balance
                                    let newBalance = new BigNumber(currentBalance).plus(satoshi).toNumber()
                                    store.dispatch(updateExternalAddress(newBalance, externalAddresses[l].address))
                                    if(this.externalAddressesToFetchUtxosFor.filter((a) => a.address == externalAddresses[l].address).length == 0) {
                                        this.externalAddressesToFetchUtxosFor.push(externalAddresses[l])
                                    }
                                }

                            }
                        }
                    }

                    if (internalAddresses.filter((a) => a.address == address).length > 0) {
                        // See if this is one of our change outputs
                        for (var x = 0; x < internalAddresses.length; x++) {

                            // Yep address is change
                            if (internalAddresses[x].address == address) {

                                // Add back our change to the amount because we're obviously not spending it
                                amount = amount.plus(transaction.vout[j].value)

                                // Convert to satoshis which is the format of the balances
                                let satoshi = new BigNumber(transaction.vout[j].value).multipliedBy(100000000)

                                if(this.internalAddressesToFetchUtxosFor.filter((a) => a.address == internalAddresses[x].address).length == 0) {
                                    this.internalAddressesToFetchUtxosFor.push(internalAddresses[x])
                                }

                                // Reduce the balance we have on record for this address by the amount spent only if the transaction has 6 confirmations
                                if (transaction.confirmations >= 6) {
                                    store.dispatch(updateInternalAddress(satoshi.toNumber(), internalAddresses[x].address))
                                }
                            }
                        }
                    }
                }
            }

            // Check if we've seen it
            let weAlreadyHave = store.getState().transactions.filter((tx) => tx.hash == newTransactions[i].hash)

            let newTx = new Transaction(newTransactions[i].hash, amount.toString(), transaction.confirmations > 0 ? newTransactions[i].height : 0, transaction.confirmations > 0 ? new Date(transaction.time * 1000) : new Date(), transaction.confirmations >= 6)

            // We haven't seen this, so put it in
            if (weAlreadyHave.length == 0) {
                store.dispatch(addTransaction(newTx))

            }

            // Update the transaction
            else {
                let currentTx = store.getState().transactions.filter((tx) => tx.hash == newTransactions[i].hash)[0]
                let confirmed = transaction.confirmations >= 6
                let height = 0

                if (transaction.confirmations > 0) {
                    height = newTransactions[i].height
                }

                store.dispatch(updateTransaction(currentTx.hash, height, amount.toString(), confirmed))
            }


        }
    }

    // Creates a Bitcoin transaction to a destination address

    async createTransaction(satoshis: number, destination: string, feeRate: number, sendMax: boolean): Promise<void> {

        if (!this.setUpRoot) {
            await this.setUpSeedAndRoot()
        }

        let target = undefined
        let select = accumulative

        if (sendMax) {
            target = [{ address: destination }]
            select = split
        }

        else {
            target = [{ address: destination, value: satoshis }]
        }

        let psbt = new bitcoin.Psbt()
        let { inputs, outputs, fee } = select(store.getState().utxos, target, feeRate)

        if (!inputs || !outputs || fee == 0) {
            return Promise.reject()
        }


        let externalAddresses = store.getState().externalAddresses
        let internalAddresses = store.getState().internalAddresses

        let keys: { index: number, key: any }[] = new Array()

        for (var i = 0; i < inputs.length; i++) {

            let address = bitcoin.address.fromOutputScript(inputs[i].witnessUtxo.script)
            let isExternal = true
            let index = 0

            for (var x = 0; x < externalAddresses.length; x++) {
                if (externalAddresses[x].address == address) {
                    isExternal = true
                    index = externalAddresses[x].index
                }
            }

            for (var x = 0; x < internalAddresses.length; x++) {
                if (internalAddresses[x].address == address) {
                    isExternal = false
                    index = internalAddresses[x].index
                }
            }

            let path = this.root.derivePath(`m/49'/0'/0'/${isExternal ? '0' : '1'}/${index}`)
            let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: path.publicKey })
            let keyPair = bitcoin.ECPair.fromWIF(path.toWIF())

            psbt.addInput({ hash: inputs[i].txId, index: inputs[i].vout, witnessUtxo: inputs[i].witnessUtxo, redeemScript: p2wpkh.output })
            keys.push({ index: i, key: keyPair })
        }

        for (var i = 0; i < outputs.length; i++) {

            let isChange = !outputs[i].address
            let shouldAdd = true

            // This is a change output so we need to fill in a change address
            if (isChange) {
                outputs[i].address = await this.getInternalAddress(store.getState().internalIndex)
                // Not worth collecting this dust as change, so skip it
                if (outputs[i].value <= 800) {
                    shouldAdd = false
                }
            }

            if (shouldAdd) {
                psbt.addOutput({ address: outputs[i].address, value: outputs[i].value })
            }
        }

        for (var i = 0; i < keys.length; i++) {
            psbt.signInput(keys[i].index, keys[i].key)
        }

        this.lastTransaction = psbt.finalizeAllInputs()
    }

    async broadcastLastTransaction() {
        await this.client.blockchainTransaction_broadcast(this.lastTransaction.extractTransaction().toHex())
    }

    convertToElectrumScriptHash(address: string): string {
        let script = bitcoin.address.toOutputScript(address)
        let hash = bitcoin.crypto.sha256(script)
        let reverse = Buffer.from(hash.reverse())
        return reverse.toString('hex')
    }

    splitIntoChunks(arr: string[], chunkSize: number): string[][] {
        const groups = [];
        let i;
        for (i = 0; i < arr.length; i += chunkSize) {
            groups.push(arr.slice(i, i + chunkSize));
        }
        return groups;
    };
}

export const wallet = new Wallet()