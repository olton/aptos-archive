import pg from 'pg'
import {debug, error, info} from "../helpers/logging.js"
import {datetime} from "@olton/datetime"

const { Pool } = pg

const createPool = (conn, opt) => {
    const {host, port, user, database, password} = conn ?? config.db

    const pool = new Pool({
        user,
        host,
        database,
        password,
        port,
        ...opt
    })

    pool.on('error', (err, client) => {
        error(`Unexpected error on idle client ${err.message}`, err)
        process.exit(-1)
    })

    return pool
}

export const createDBConnection = async (conn, opt) => {
    globalThis.postgres = createPool(conn, opt)

    const pool = globalThis.postgres

    await pool.query('select now()', (err, res) => {
        if (err) {
            throw err
        }
        info(`DB clients pool created at ${datetime(+(res.rows[0].now)).format(config['date-format']['log'])}`)
    })
}

export const listenNotifies = async () => {
    const client = await globalThis.postgres.connect()

    client.query('LISTEN new_deal', (err, res) => {
        if (err) {
            throw err
        }
        info(`Start listening for DB events`)
    })
    client.on('notification', async (data) => {
        info(`${data.channel} notification:`, data.payload)
        if (data.channel === 'new_deal') {
            globalThis.everyone[data.channel] = JSON.parse(data.payload)
        }
    })
}

export const query = async (q, p) => {
    const client = await globalThis.postgres.connect()
    let result = null

    try {
        const start = Date.now()
        const res = await client.query(q, p)
        const duration = Date.now() - start
        if (config.debug.pg_query) {
            debug('Executed query', { q, p, duration: duration + 'ms', rows: res.rowCount })
        }
        result = res
    } catch (e) {
        // console.log("Errored sql: ", q, p)
        throw new Error("Query --> "+e.message)
    } finally {
        client.release()
    }

    return result
}

export const batch = async (a = []) => {
    if (!a.length) return
    const client = await globalThis.postgres.connect()
    let result
    try {
        const start = Date.now()
        await client.query("BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED")
        for (let q of a) {
            const [sql, par] = q
            await client.query(sql, par)
        }
        client.query("COMMIT")
        const duration = Date.now() - start
        if (config.debug.pg_query) {
            debug('Executed batch', { duration: duration + 'ms' })
        }
        result = true
    } catch (e) {
        result = false
        client.query("ROLLBACK")
        error(e.message, config.debug.pg_query ? e : null)
    } finally {
        client.release()
    }
    return result
}

export const beginTransaction = async () => {
    await query("BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED")
}

export const commitTransaction = async () => {
    await query("COMMIT")
}

export const rollbackTransaction = async () => {
    await query("ROLLBACK")
}

export const getClient = async () => {
    return await globalThis.postgres.connect()
}

export const releaseClient = c => {
    c.release()
}