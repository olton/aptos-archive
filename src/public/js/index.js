import {connect} from "./websocket.js";

globalThis.darkMode = $.dark

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

connect()