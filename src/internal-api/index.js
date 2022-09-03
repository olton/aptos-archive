import {TransactionsAPI} from "./transactions.js";
import {StatusAPI} from "./status.js";
import {createDBConnection} from "../modules/postgres.js";
import {GasAPI} from "./gas.js";
import {CoinAPI} from "./coin.js";
import {NftAPI} from "./nft.js";
import {AddressesAPI} from "./addresses.js";

const defaultDBOptions = {
    debug: true,
    max: 3000,
    allowExitOnIdle: true,
    idleTimeoutMillis: 1_000,
    connectionTimeoutMillis: 0
}

export class Archive {
    constructor({proto = 'http', host = 'localhost', port = 5432, user, password, database, options = {}}) {
        this.connect = {proto, host, port, user, password, database}
        this.options = Object.assign({}, defaultDBOptions, options)

        createDBConnection(this.connect, this.options)
    }
}

Object.assign(Archive.prototype, TransactionsAPI, StatusAPI, GasAPI, CoinAPI, NftAPI, AddressesAPI)