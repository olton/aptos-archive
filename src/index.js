import path from "path"
import { fileURLToPath } from 'url'
import fs from "fs";
import {info, error} from "./helpers/logging.js"
import {broadcast, runWebServer} from "./modules/webserver.js";
import {createDBConnection} from "./modules/postgres.js";
import {Aptos} from "@olton/aptos-api";
import {startArchiveProcess, updateLedgerStatus} from "./modules/archive.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf-8'))

globalThis.rootPath = path.dirname(__dirname)
globalThis.serverPath = __dirname
globalThis.web = rootPath + "/src/public"
globalThis.srcPath = rootPath + "/src"
globalThis.pkg = readJson(""+path.resolve(rootPath, "package.json"))
globalThis.config = readJson(""+path.resolve(serverPath, "config.json"))
globalThis.appVersion = pkg.version
globalThis.appName = `Aptos Archive Node v${pkg.version}`
globalThis.indexer = null

const runProcesses = () => {
    setImmediate( updateLedgerStatus )
    setImmediate( startArchiveProcess )
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

run()