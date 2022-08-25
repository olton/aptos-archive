import {debug, error, info} from "../helpers/logging.js";
import pg from "pg";

const { Pool } = pg

export const Postgres = {
    createPool() {
        const {host, port, user, database, password} = this.connect
        const {max, allowExitOnIdle, connectionTimeoutMillis, idleTimeoutMillis} = this.options

        const pool = new Pool({
            user,
            host,
            database,
            password,
            port,
            max,
            allowExitOnIdle,
            connectionTimeoutMillis,
            idleTimeoutMillis
        })

        pool.on('error', (err, client) => {
            error(`Unexpected error on idle client ${err.message}`, err)
            process.exit(-1)
        })

        return pool
    },

    createDBConnection() {
        this.pool = this.createPool()

        this.pool.query('select now()', (err, res) => {
            if (err) {
                throw err
            }
            info(`DB clients pool created`)
        })
    },

    async listenNotifies (notify, cb = () => {}) {
        const client = await this.pool.connect()

        client.query(`LISTEN ${notify}`, (err, res) => {
            if (err) {
                throw err
            }
            info(`Start listening for ${notify} DB event`)
        })
        client.on('notification', async (data) => {
            info(`${data.channel} notification:`, data.payload)
            if (data.channel === notify) {
                cb.apply(null, [data.channel, JSON.parse(data.payload)])
            }
        })
    },

    async query (q, p) {
        const client = await this.pool.connect()
        let result = null

        try {
            const start = Date.now()
            const res = await client.query(q, p)
            const duration = Date.now() - start
            if (this.options.debug) {
                debug('Executed query', { q, p, duration: duration + 'ms', rows: res.rowCount })
            }
            result = res
        } catch (e) {
            info(e.message, this.options.debug ? e : null)
        } finally {
            client.release()
        }

        return result
    },

    async batch (a = []) {
        if (!a.length) return
        const client = await this.pool.connect()
        let result
        try {
            const start = Date.now()
            client.query("BEGIN")
            for (let q of a) {
                const [sql, par] = q
                await client.query(sql, par)
            }
            client.query("COMMIT")
            const duration = Date.now() - start
            if (this.options.debug) {
                debug('Executed batch', { duration: duration + 'ms' })
            }
            result = true
        } catch (e) {
            result = false
            client.query("ROLLBACK")
            error(e.message, this.options.debug ? e : null)
        } finally {
            client.release()
        }
        return result
    },

    async getClient() {
        return await this.pool.connect()
    },
}