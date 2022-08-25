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
    setTimeout(saveGasCount, 10_000)
}

const saveCoinTransfer = async () => {
    globalThis.coinTransfer = await arch.transferCoinCount()
    setTimeout(saveGasCount, 10_000)
}

export const Interact = {
    run(){
        saveLedger()
        saveArchive()
        saveCounters()
        saveGasCount()
        saveCoinTransfer()
    }
}