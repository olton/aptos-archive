import path from "path";
import {fileURLToPath} from "url";
import {readJson} from "../helpers/readers.js";
import {Archive} from "../internal-api/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

globalThis.rootPath = path.dirname(path.dirname(__dirname))
globalThis.serverPath = path.dirname(__dirname)
globalThis.web = rootPath + "/src/public"
globalThis.srcPath = rootPath + "/src"
globalThis.pkg = readJson(""+path.resolve(rootPath, "package.json"))
globalThis.config = readJson(""+path.resolve(serverPath, "config.json"))
globalThis.appVersion = pkg.version
globalThis.appName = `Aptos Archive Node v${pkg.version}`
globalThis.arch = new Archive({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
})
globalThis.ledger = null
globalThis.archive = null
globalThis.counters = null