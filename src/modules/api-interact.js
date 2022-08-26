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
    globalThis.lastTransactions = await arch.transactions({order: "timestamp desc", limit: 25, offset: 0})
    setTimeout(saveLastTransactions, 1_000)
}

const saveCollectionsCount = async () => {
    globalThis.collectionsCount = await arch.collectionsCount()
    setTimeout(saveCollectionsCount, 10_000)
}

const saveTokensCount = async () => {
    globalThis.tokensCount = await arch.tokensCount()
    setTimeout(saveTokensCount, 10_000)
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
        setImmediate(saveCollectionsCount)
        setImmediate(saveTokensCount)
    }
}