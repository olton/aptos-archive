import {n2f} from "./utils.js";
import {drawAvgGraph} from "./graphs.js";

export const updateLedgerPanel = (data) => {
    if (typeof data.chain_id === 'undefined') return
    const target = $("#ledger-status").clear()
    for (let key in data) {
        let val = data[key]
        if (key === 'timestamp') {
            val = datetime(val).format(dateFormat.full)
        } else {
            val = n2f(val)
        }
        $("<tr>").html(`
            <td class="value-label text-muted">${key}</td>
            <td class="value text-bold">${val}</td>
        `).appendTo(target)
    }
}

export const updateTransactionsCountPanel = (data = []) => {
    if (!data.length) return
    for (let r of data) {
        if (r.counter_type === 'genesis') $("#genesis-count").html(n2f(r.counter_value))
        if (r.counter_type === 'meta') $("#meta-count").html(n2f(r.counter_value))
        if (r.counter_type === 'user') $("#user-count").html(n2f(r.counter_value))
        if (r.counter_type === 'state') $("#state-count").html(n2f(r.counter_value))
    }
}

export const updateTransactionsTotalPanel = (data = []) => {
    if (!data.length) return
    for (let r of data) {
        if (r.counter_type === 'total') $("#total-count").html(n2f(r.counter_value))
        if (r.counter_type === 'success') $("#success-count").html(n2f(r.counter_value))
        if (r.counter_type === 'failed') $("#failed-count").html(n2f(r.counter_value))
    }
}

export const updateGasCountPanel = (data = []) => {
    if (!data.coin_total) return
    const {coin_total, coin_max, coin_min, coin_avg} = data
    $("#gas-coin-total").html(n2f(+coin_total))
    $("#gas-coin-max").html(n2f(+coin_max))
    $("#gas-coin-min").html(n2f(+coin_min))
    $("#gas-coin-avg").html(n2f(+coin_avg))

    if (globalThis.graph_gas_avg === null) {
        globalThis.graph_gas_avg = drawAvgGraph("#graph-gas-avg", [])
    }

    globalThis.graph_gas_avg.add(0, [datetime().time(), +coin_avg], true, false)
}

export const updateArchivePanel = (data = {}) => {
    if (typeof data.version === "undefined") return
    const {version, timestamp} = data
    $("#archive-version").html(n2f(version))
    $("#archive-time").html(datetime(timestamp).format(dateFormat.full))
}

export const updateCoinTransferCountPanel = (data = {}) => {
    if (!data.coin_total) return
    const {coin_total, coin_max, coin_min, coin_avg} = data
    $("#transfer-coin-total").html(n2f(+coin_total))
    $("#transfer-coin-max").html(n2f(+coin_max))
    $("#transfer-coin-min").html(n2f(+coin_min))
    $("#transfer-coin-avg").html(n2f(+coin_avg))

    if (globalThis.graph_transfer_avg === null) {
        globalThis.graph_transfer_avg = drawAvgGraph("#graph-transfer-avg", [], "#60a917")
    }

    globalThis.graph_transfer_avg.add(0, [datetime().time(), +coin_avg], true, false)

}

export const updateCoinMintCountPanel = (data = {}) => {
    if (!data.coin_total) return
    const {coin_total, coin_max, coin_min, coin_avg} = data
    $("#mint-coin-total").html(n2f(+coin_total))
    $("#mint-coin-max").html(n2f(+coin_max))
    $("#mint-coin-min").html(n2f(+coin_min))
    $("#mint-coin-avg").html(n2f(+coin_avg))

    if (globalThis.graph_mint_avg === null) {
        globalThis.graph_mint_avg = drawAvgGraph("#graph-mint-avg", [], "#e94c3b")
    }

    globalThis.graph_mint_avg.add(0, [datetime().time(), +coin_avg], true, false)
}

export const updateLastTransactionsPanel = (data) => {
    const target = $("#last-transactions").clear()
    for (let r of data) {
        $("<tr>").html(`
            <td>${r.type === 'user' ? "<span class='mif-user'></span>" : r.type === 'meta' ? "<span class='mif-server'></span>" : r.type === 'state' ? "<span class='mif-beenhere'></span>" : "<span class='mif-cake'></span>"}</td>
            <td>${r.success ? "<span class='mif-checkmark fg-green'></span>" : "<span class='mif-blocked fg-red'></span>"}</td>
            <td>${r.version}</td>
            <td>${r.hash}</td>
            <td class="text-center">${r.gas_used}</td>
            <td>${datetime(r.timestamp).format(dateFormat.full)}</td>
        `).appendTo(target)
    }
}

export const updateCollectionsCountPanel = data => {
    $("#collections-count").html(data)
}

export const updateTokensCountPanel = data => {
    $("#tokens-count").html(data)
}

export const updateAddressesCountPanel = data => {
    $("#addresses-count").html(data)
}
