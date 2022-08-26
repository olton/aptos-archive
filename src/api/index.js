import {Postgres} from "./postgres.js";
import {TransactionsAPI} from "./transactions.js";
import {StatusAPI} from "./status.js";
import {createDBConnection} from "../modules/postgres.js";
import {GasAPI} from "./gas.js";
import {CoinAPI} from "./coin.js";
import {NftAPI} from "./nft.js";

const defaultIndexerOptions = {
    debug: true,
    max: 20,
    allowExitOnIdle: true,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 0
}

export class Archive {
    constructor({proto = 'http', host = 'localhost', port = 5432, user, password, database, options = {}}) {
        this.connect = {
            proto, host, port, user, password, database,
            allowExitOnIdle: true, max: 30
        }
        this.options = Object.assign({}, defaultIndexerOptions, options)

        createDBConnection(this.connect)
    }
}

Object.assign(Archive.prototype, Postgres, TransactionsAPI, StatusAPI, GasAPI, CoinAPI, NftAPI)