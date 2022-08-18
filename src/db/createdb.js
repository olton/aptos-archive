import fs from "fs"
import path from "path";
import {fileURLToPath} from "url";
import {createDBConnection, query} from "../modules/postgres.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configFile = path.resolve(path.dirname(__dirname), "config.json")

globalThis.config = JSON.parse(fs.readFileSync(configFile, 'utf-8'))

const files = [
    'tables', 'indexes', 'procedures', 'triggers', 'data'
]

await createDBConnection()

for(let f of files) {
    const sql =  fs.readFileSync(path.resolve(__dirname), `${f}.sql`)
    await query(sql)
}

console.log("Archive DB created!")