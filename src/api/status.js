import {query} from "../modules/postgres.js";

export const StatusAPI = {
    archive: async () => {
        const sql = `
            select * from archive_status
        `
        return (await query(sql)).rows[0]
    },

    ledger: async () => {
        const sql = `
            select * from ledger
        `
        return (await query(sql)).rows[0]
    },

    counters: async () => {
        const sql = `
            select * from counters
        `
        return (await query(sql)).rows
    },

    gasUsed: async () => {
        const sql = `
            select * from gas_used
        `
        return (await query(sql)).rows
    },
}