import {query} from "./postgres.js";
import {datetime} from "@olton/datetime";
import {sleep} from "../helpers/sleep.js";
import {info} from "../helpers/logging.js";
import {cleanObj} from "../helpers/clean-string.js";

const TRANS_TYPES = {
    'user_transaction': 'user',
    'block_metadata_transaction': 'meta',
    'genesis_transaction': 'genesis',
    'state_checkpoint_transaction': 'state',
}

export const updateLedgerStatus = async () => {
    const response = await aptos.getLedger()
    if (!response.ok) {
        console.log(response.message)
        setTimeout(updateLedgerStatus, 30_000)
    } else {
        const {chain_id, epoch, ledger_version, block_height, ledger_timestamp} = response.payload
        const sql = `
            update ledger
            set chain_id = $1, 
                version = $2, 
                epoch = $3, 
                timestamp = $4,
                block_height = $5 
            where true
        `
        await query(sql, [+chain_id, +ledger_version, +epoch, datetime(+ledger_timestamp/1000).format("YYYY-MM-DD HH:mm:ss"), +block_height])
        setTimeout(updateLedgerStatus, 1_000)
    }
}

export const getLedger = async () => {
    const sql = `
        select chain_id, version, epoch, block_height, timestamp
        from ledger
    `
    return (await query(sql)).rows[0]
}

export const getLastVersion = async () => {
    const sql = `
        select version, timestamp 
        from archive_status
    `

    try {
        return (await query(sql)).rows[0]
    } catch (e) {
        throw new Error(`getLastVersion --> ${e.message}`)
    }
}

export const setLastVersion = async (version) => {
    const sql = `
        update archive_status
        set version = $1, timestamp = current_timestamp where true
    `

    return (await query(sql, [version]))
}

export const saveTransaction = async (data) => {
    const sql = `
        insert into transactions (
            hash, 
            type, 
            version, 
            success, 
            vm_status, 
            timestamp, 
            gas_used, 
            state_root_hash, 
            event_root_hash, 
            accumulator_root_hash,
            payload,
            events,
            changes
            )
        values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)    
        ON CONFLICT DO NOTHING
        RETURNING *    
    `

    try {
        const result = await query(sql, [
            data.hash,
            TRANS_TYPES[data.type] ? TRANS_TYPES[data.type] : data.type,
            data.version,
            data.success,
            data.vm_status,
            data.timestamp ? datetime(+data.timestamp / 1000).format("YYYY-MM-DD HH:mm:ss") : null,
            data.gas_used,
            data.state_root_hash,
            data.event_root_hash,
            data.accumulator_root_hash,
            data.payload ? JSON.stringify(data.payload) : null,
            data.events ? JSON.stringify(data.events) : null,
            data.changes ? JSON.stringify(data.changes) : null
        ])

        return result.rows[0].id
    } catch (e) {
        throw new Error("saveTransaction --> "+e.message)
    }
}

export const saveUserTransaction = async (id, data) => {
    const sql = `
        insert into user_transactions(
            id, 
            sender, 
            sequence_number, 
            max_gas_amount, 
            gas_unit_price, 
            expiration_timestamp_secs, 
            signature, 
            timestamp)
        values($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
    `

    try {
        await query(sql, [
            id,
            data.sender,
            +data.sequence_number,
            +data.max_gas_amount,
            +data.gas_unit_price,
            +data.expiration_timestamp_secs,
            JSON.stringify(data.signature),
            datetime(+data.timestamp / 1000).format("YYYY-MM-DD HH:mm:ss")
        ])

        await savePayload(id, data.payload)
        await saveChanges(id, data.changes)
        await saveEvents (id, data.events)
    } catch (e) {
        throw new Error("saveUserTransaction --> "+e.message)
    }
}

export const saveMetaTransaction = async (id, data) => {
    const sql = `
        insert into meta_transactions(
            id, 
            tr_id,
            epoch, 
            round, 
            proposer, 
            timestamp, 
            previous_block_votes, 
            failed_proposer_indices
            )
        values($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
    `

    try {
        await query(sql, [
            id,
            data.id,
            +data.epoch,
            +data.round,
            data.proposer,
            datetime(+data.timestamp / 1000).format("YYYY-MM-DD HH:mm:ss"),
            JSON.stringify(data.previous_block_votes_bitvec),
            JSON.stringify(data.failed_proposer_indices)
        ])

        await saveChanges(id, data.changes)
        await saveEvents(id, data.events)
    } catch (e) {
        throw new Error("saveMetaTransaction --> "+e.message)
    }
}

export const savePayload = async (id, data) => {
    const sql = `
        insert into payloads(id, function, type_arguments, arguments, type)
        values($1, $2, $3, $4, $5)
    `

    try {
        await query(sql, [id, data.function, JSON.stringify(data.type_arguments), JSON.stringify(data.arguments), data.type])
    } catch (e) {
        throw new Error("savePayload --> "+e.message)
    }
}

export const saveChanges = async (id, data) => {
    const sql = `
        insert into changes(id, address, state_key_hash, data, type)
        values($1, $2, $3, $4, $5)
    `

    try {
        for (let c of data) {
            await query(sql, [id, c.address, c.state_key_hash, JSON.stringify(c.data), c.type])
        }
    } catch (e) {
        throw new Error("saveChanges --> "+e.message)
    }
}

export const saveEvents = async (id, data) => {
    const sql = `
        insert into events(id, key, sequence_number, type, data)
        values($1, $2, $3, $4, $5)
    `

    try {
        for (let e of data) {
            await query(sql, [id, e.key, e.sequence_number, e.type, JSON.stringify(e.data)])
        }
    } catch (e) {
        throw new Error("saveEvents --> "+e.message)
    }
}

export const getPack = async (limit = 100, start = 0) => {
    const response = await aptos.getTransactions({limit, start})
    if (!response.ok) {
        throw new Error(response.message)
    }
    return response.payload
}

export const savePack = async (data, start) => {
    let index = start

    data = cleanObj(data)

    try {
        for (let t of data) {
            const id = await saveTransaction(t)
            if (t.type === 'user_transaction') await saveUserTransaction(id, t)
            if (t.type === 'block_metadata_transaction') await saveMetaTransaction(id, t)
            index++
        }
        await setLastVersion(index)
        info(`Block complete from ${start} to ${index}`)
    } catch (e) {
        throw new Error("savePack --> " + e.message)
    }
}

export const startArchiveProcess = async (batch_size = 100) => {
    let start = await getLastVersion() // ver begin
    let ledger = await getLedger()

    while (+start.version >= +ledger.version) {
        info(`No transactions, wait 5 seconds and try again!..`)
        await sleep(5_000)
        await startArchiveProcess(batch_size)
    }

    const pack = await getPack(batch_size, +start.version)

    try {
        await query("BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED")
        await savePack(pack, start.version)
        await query("COMMIT")
        await sleep(100)
        await startArchiveProcess(batch_size)
    } catch (e) {
        await query("ROLLBACK")
        throw new Error("startArchiveProcess --> " + e.message)
    }
}