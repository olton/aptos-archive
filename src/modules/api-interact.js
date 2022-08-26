const saveLedger = async () => {
    globalThis.ledger = await arch.ledger()
    setTimeout(saveLedger, 1_000)
}

const saveArchive = async () => {
    globalThis.archive = await arch.archive()
    setTimeout(saveArchive, 1_000)
}

const saveCounters = async () => {
    globalThis.counters = await arch.counters()
    setTimeout(saveCounters, 1_000)
}

const saveGasCount = async () => {
    globalThis.gasCount = await arch.gasCount()
    setTimeout(saveGasCount, 1_000)
}

const saveCoinTransfer = async () => {
    globalThis.coinTransfer = await arch.transferCoinCount()
    setTimeout(saveCoinTransfer, 1_000)
}

const saveCoinMint = async () => {
    globalThis.coinMint = await arch.mintCoinCount()
    setTimeout(saveCoinMint, 1_000)
}

const saveLastTransactions = async () => {
    globalThis.lastTransactions = await arch.transactions({limit: 25, offset: 0})
    setTimeout(saveLastTransactions, 1_000)
}


export const Interact = {
    run(){
        setImmediate(saveLedger)
        setImmediate(saveArchive)
        setImmediate(saveCounters)
        setImmediate(saveGasCount)
        setImmediate(saveCoinTransfer)
        setImmediate(saveCoinMint)
        setImmediate(saveLastTransactions)
    }
}