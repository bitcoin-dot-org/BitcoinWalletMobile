export class AddressLookup {
    index: number
    address: string
    balance: number
    isLookAhead: boolean

    constructor(i: number, a: string, b: number, look: boolean) {
        this.index = i
        this.address = a
        this.balance = b
        this.isLookAhead = look
    }
}

export class Transaction {
    hash: string
    amount: string
    height: number
    time : Date
    confirmed : boolean

    constructor(h: string, a: string, c: number, d : Date, confirm : boolean) {
        this.hash = h
        this.amount = a
        this.height = c
        this.time = d
        this.confirmed = confirm
    }
}
