import fs from "fs"
import path from "path";
import {fileURLToPath} from "url";
import {createDBConnection, query} from "../modules/postgres.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configFile = path.resolve(path.dirname(__dirname), "config.json")

globalThis.config = JSON.parse(fs.readFileSync(configFile, 'utf-8'))

const tables = [
    'addresses', 'transactions', 'user_transactions', 'meta_transactions', 'state_transactions',
    'payloads', 'changes', 'events'
]

await createDBConnection()

console.log("Truncate tables...")
for(let t of tables) {
    const sql =  `truncate table ${t} restart identity cascade;`
    await query(sql)
}

console.log("Reset archive status...")
await query(`update archive_status set version = 0 where true`)
console.log("Reset ledger...")
await query(`update ledger set chain_id = 0, version = 0, epoch = 0, block_height = 0 where true`)
console.log("Reset counters...")
await query(`update counters set counter_value = 0 where true`)
console.log("Reset gas used...")
await query(`delete from gas_used where true`)

console.log("Archive DB cleared!")