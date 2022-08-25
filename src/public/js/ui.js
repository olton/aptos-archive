import {n2f} from "./utils.js";

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
    if (!data.gas_total) return
    const {gas_total, gas_max, gas_min, gas_avg} = data
    $("#gas-max").html(n2f(+gas_max))
    $("#gas-min").html(n2f(+gas_min))
    $("#gas-avg").html(n2f(+gas_avg))
    $("#gas-total").html(n2f(+gas_total))
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
    $("#coin-total").html(n2f(+coin_total))
    $("#coin-max").html(n2f(+coin_max))
    $("#coin-min").html(n2f(+coin_min))
    $("#coin-avg").html(n2f(+coin_avg))
}