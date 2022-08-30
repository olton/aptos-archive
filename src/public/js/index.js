import {connect} from "./websocket.js";

globalThis.trans_records = 25
globalThis.darkMode = $.dark
globalThis.graph_gas_avg = null
globalThis.graph_transfer_avg = null
globalThis.graph_mint_avg = null

const storedDarkMode = Metro.storage.getItem("darkMode")
if (typeof storedDarkMode !== "undefined") {
    globalThis.darkMode = storedDarkMode
}

if (darkMode) {
    $("html").addClass("dark-mode")
}

$(".light-mode-switch, .dark-mode-switch").on("click", () => {
    globalThis.darkMode = !globalThis.darkMode
    Metro.storage.setItem("darkMode", darkMode)
    if (darkMode) {
        $("html").addClass("dark-mode")
    } else {
        $("html").removeClass("dark-mode")
    }
})

$("#reload_last_transactions").on("click", function() {
    globalThis.autoReloadLastTransactions = this.checked
})

$(".trans_records").on("click", function() {
    globalThis.trans_records = $(this).find("input").val()
})

connect()
