import {
    updateAddressesCountPanel,
    updateArchivePanel,
    updateCoinMintCountPanel,
    updateCoinTransferCountPanel, updateCollectionsCountPanel,
    updateGasCountPanel,
    updateLastTransactionsPanel,
    updateLedgerPanel, updateTokensCountPanel,
    updateTransactionsCountPanel,
    updateTransactionsTotalPanel
} from "./ui.js";

globalThis.webSocket = null
globalThis.ipData = await (await fetch('https://api.db-ip.com/v2/free/self')).json()
globalThis.autoReloadLastTransactions = true

const isOpen = (ws) => ws && ws.readyState === ws.OPEN

export const connect = () => {
    const {host, port = 80, secure} = serverConfig.server
    const ws = new WebSocket(`${secure ? 'wss' : 'ws'}://${host}:${port}`)

    globalThis.webSocket = ws

    ws.onmessage = event => {
        try {
            const content = JSON.parse(event.data)
            if (typeof wsMessageController === 'function') {
                wsMessageController.apply(null, [ws, content])
            }
        } catch (e) {
            console.log(e.message)
            console.log(event.data)
            console.log(e.stack)
        }
    }

    ws.onerror = error => {
        error('Socket encountered error: ', error.message, 'Closing socket');
        ws.close();
    }

    ws.onclose = event => {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', event.reason);
        setTimeout(connect, 1000)
    }

    ws.onopen = event => {
        console.log(`Welcome to Aptos Archive from ${globalThis.ipData.city}, ${globalThis.ipData.countryName}, IP: ${globalThis.ipData.ipAddress}`);
    }
}

const request = (channel = 'ping', data = {}, ws = globalThis.webSocket) => {
    if(isOpen(ws)) {
        ws.send(JSON.stringify({
            channel,
            data
        }))
    }
}

const wsMessageController = (ws, response) => {
    const {channel, data} = response

    if (!channel) {
        return
    }

    switch(channel) {
        case 'welcome': {
            request('api::ledger')
            request('api::archive')
            request('api::transactions::count')
            request('api::gas::count')
            request('api::coin::transfer')
            request('api::coin::mint')
            request('api::transactions::last', {
                limit: globalThis.trans_records
            })
            request('api::collections::count')
            request('api::tokens::count')
            request('api::addresses::count')
            break
        }
        case 'api::ledger': {
            updateLedgerPanel(data)
            setTimeout(request, 1000, channel)
            break
        }
        case 'api::archive': {
            updateArchivePanel(data)
            setTimeout(request, 1000, channel)
            break
        }
        case 'api::transactions::count': {
            updateTransactionsCountPanel(data)
            updateTransactionsTotalPanel(data)
            setTimeout(request, 1000, channel)
            break
        }
        case 'api::gas::count': {
            updateGasCountPanel(data)
            setTimeout(request, 1000, channel)
            break
        }
        case 'api::coin::transfer': {
            updateCoinTransferCountPanel(data)
            setTimeout(request, 1000, channel)
            break
        }
        case 'api::coin::mint': {
            updateCoinMintCountPanel(data)
            setTimeout(request, 1000, channel)
            break
        }
        case 'api::transactions::last': {
            if (globalThis.autoReloadLastTransactions) updateLastTransactionsPanel(data)
            setTimeout(request, 1000, channel, {
                limit: globalThis.trans_records
            })
            break
        }
        case 'api::collections::count': {
            updateCollectionsCountPanel(data)
            setTimeout(request, 1000, channel)
            break
        }
        case 'api::tokens::count': {
            updateTokensCountPanel(data)
            setTimeout(request, 1000, channel)
            break
        }
        case 'api::addresses::count': {
            updateAddressesCountPanel(data)
            setTimeout(request, 1000, channel)
            break
        }
    }
}

