import {query} from "./postgres.js";
import {datetime} from "@olton/datetime";
import {sleep} from "../helpers/sleep.js";

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
        const result = (await query(sql)).rows[0]
        return result.version
    } catch (e) {
        return 0
    }
}

export const setLastVersion = async (version) => {
    const sql = `
        update archive_status
        set version = $1 
    `

    return (await query(sql, [version]))
}

export const saveTransaction = async (data) => {
    const {
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
    } = data

    const sql = `
        insert into transactions(
            hash, type, version, status, status_message, timestamp, 
            gas_used, state_root_hash, event_root_hash, accumulator_root_hash)
        values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)    
        ON CONFLICT DO NOTHING
        RETURNING *    
   `

    const result = await query(sql, [
        hash,
        TRANS_TYPES[type],
        version,
        success,
        vm_status,
        datetime(+timestamp/1000).format("YYYY-MM-DD HH:mm:ss"),
        gas_used,
        state_root_hash,
        event_root_hash,
        accumulator_root_hash
    ])

    return result.rows[0].id
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
            payload, 
            changes, 
            signature, 
            events, 
            timestamp)
        values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING
    `
    const {
        changes, sender, sequence_number, max_gas_amount, gas_unit_price,
        expiration_timestamp_secs, payload, signature, events, timestamp
    } = data

    try {
        await query(sql, [
            id,
            sender,
            +sequence_number,
            +max_gas_amount,
            +gas_unit_price,
            +expiration_timestamp_secs,
            JSON.stringify(payload),
            JSON.stringify(changes),
            JSON.stringify(signature),
            JSON.stringify(events),
            datetime(+timestamp / 1000).format("YYYY-MM-DD HH:mm:ss")
        ])

        await savePayload(id, payload)
        await saveChanges(id, changes)
        await saveEvents(id, events)
    } catch (e) {
        console.log(e.message)
    }
}

export const saveMetaTransaction = async (id, data) => {
    const sql = `
        insert into meta_transactions(
            id, tr_id, epoch, round, proposer, timestamp, changes, events, previous_block_votes, failed_proposer_indices)
        values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
    `
    const {
        id: tr_id, epoch, round, proposer, timestamp, changes, events, previous_block_votes, failed_proposer_indices
    } = data

    await query(sql, [
        id,
        tr_id,
        epoch,
        round,
        proposer,
        datetime(+timestamp/1000).format("YYYY-MM-DD HH:mm:ss"),
        JSON.stringify(changes),
        JSON.stringify(events),
        JSON.stringify(previous_block_votes),
        JSON.stringify(failed_proposer_indices)
    ])

    await saveChanges(id, changes)
    await saveEvents(id, events)
}

export const savePayload = async (id, data) => {
    const sql = `
        insert into payloads(id, function, type_arguments, arguments, type)
        values($1, $2, $3, $4, $5)
    `

    await query(sql, [id, data.function, JSON.stringify(data.type_arguments), JSON.stringify(data.arguments), data.type])
}

export const saveChanges = async (id, data) => {
    const sql = `
        insert into changes(id, address, state_key_hash, data, type)
        values($1, $2, $3, $4, $5)
    `

    for (let c of data) {
        await query(sql, [id, c.address, c.state_key_hash, JSON.stringify(c.data), c.type])
    }
}

export const saveEvents = async (id, data) => {
    const sql = `
        insert into events(id, key, sequence_number, type, data)
        values($1, $2, $3, $4, $5)
    `
    for (let e of data) {
        await query(sql, [id, e.key, e.sequence_number, e.type, JSON.stringify(e.data)])
    }
}

export const processTransaction = async (data) => {
    const id = await saveTransaction(data)

    if (data.type === 'user_transaction') {
        await saveUserTransaction(id, data)
    }

    if (data.type === 'block_metadata_transaction') {
        await saveMetaTransaction(id, data)
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
    for(let t of data) {
        await processTransaction(t)
        index++
    }
    await setLastVersion(index)
}

export const startArchiveProcess = async (batch_size = 100) => {
    let start = await getLastVersion() // ver begin
    let ledger = await getLedger()

    while (start >= ledger.version) {
        await sleep(5_000)
        await startArchiveProcess(batch_size)
    }

    const pack = await getPack(batch_size, start)

    await query("BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED")
    try {
        await savePack(pack, start)
        await query("COMMIT")
    } catch (e) {
        console.log(e.message)
        await query("ROLLBACK")
    }

    await sleep(3000)
    console.log(`Batch size processed...from ${start} to ${+start + +batch_size}`)

    await startArchiveProcess(batch_size)
}