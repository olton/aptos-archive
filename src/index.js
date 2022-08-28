import "./modules/global.js"
import {info, error} from "./helpers/logging.js"
import {broadcast, runWebServer} from "./modules/webserver.js";
import {createDBConnection} from "./modules/postgres.js";
import {Aptos} from "@olton/aptos-api";
import {startArchiveProcess, updateLedgerStatus} from "./modules/archive.js";
import {getArguments} from "./helpers/get-arguments.js";
import {Interact} from "./modules/api-interact.js";

const batch_size = 100

const args = getArguments()

const runProcesses = () => {
    if (!args.web) setImmediate( updateLedgerStatus )
    if (!args.web) setImmediate( startArchiveProcess, batch_size )
}

export const run = async () => {
    info("Starting Server...")

    try {

        globalThis.aptos = new Aptos(config.aptos.api)

        globalThis.cache = new Proxy({
        }, {
            set(target, p, value, receiver) {
                target[p] = value
                return true
            }
        })

        globalThis.everyone = new Proxy({
        }, {
            set(target, p, value, receiver) {
                target[p] = value

                broadcast({
                    channel: p,
                    data: value
                })

                return true
            }
        })

        await createDBConnection()
        runProcesses()
        runWebServer()

        info("Welcome to Aptos Archive Node!")
    } catch (e) {
        error(e)
        error(e.stack)
        process.exit(1)
    }
}

Interact.run()
run()