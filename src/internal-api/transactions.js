import {query} from "../modules/postgres.js";

export const TransactionsAPI = {
    transactions: async ({order = "timestamp", limit = 25, start = 0}) => {
        const sql = `
            select *
            from v_transactions
            where version >= $2
            order by '%ORDER%'            
            limit $1
        `.replace("'%ORDER%'", order)

        return (await query(sql, [limit, start])).rows
    },

    userTransactions: async ({order = "timestamp", limit = 25, start = 0}) => {
        const sql = `
            select *
            from v_transactions vt
              left join user_transactions ut on vt.id = ut.id 
            where type::text = 'user'
            and version >= $2
            order by '%ORDER%'
            limit $1 
        `.replace("'%ORDER%'", order)

        return (await query(sql, [limit, start])).rows
    },

    metaTransactions: async ({order = "timestamp", limit = 25, start = 0}) => {
        const sql = `
            select *
            from v_transactions vt
              left join meta_transactions mt on vt.id = mt.id 
            where type::text = 'meta'
            and version >= $2
            order by '%ORDER%'
            limit $1
        `.replace("'%ORDER%'", order)

        return (await query(sql, [limit, start])).rows
    },

    stateTransactions: async ({order = "timestamp", limit = 25, start = 0}) => {
        const sql = `
            select *
            from v_transactions vt
              left join state_transactions mt on vt.id = mt.id 
            where type::text = 'state'
            and version >= $2
            order by '%ORDER%'
            limit $1 
        `.replace("'%ORDER%'", order)

        return (await query(sql, [limit, start])).rows
    },

    genesis: async () => {
        const sql = `
            select *
            from v_transactions vt
            where type::text = 'genesis'
        `

        return (await query(sql)).rows[0]
    },

    transactionsCount: async () => {
        const sql = `
            select * from counters 
        `

        return (await query(sql)).rows
    },

    allTPM: async ()=>{
        const sql = `
            select 
                date_trunc('minute', timestamp) as timestamp,
                count(*)
            from v_transactions
            group by 1
            order by 1 desc
            limit 1000
        `
        return (await query(sql)).rows
    },
    userTPM: async ()=>{
        const sql = `
            select 
                date_trunc('minute', timestamp) as timestamp,
                count(*)
            from v_transactions
            where type::text = 'user'
            group by 1
            order by 1 desc
            limit 1000
        `
        return (await query(sql)).rows
    },
    metaTPM: async ()=>{
        const sql = `
            select 
                date_trunc('minute', timestamp) as timestamp,
                count(*)
            from v_transactions
            where type::text = 'meta'
            group by 1
            order by 1 desc
            limit 1000
        `
        return (await query(sql)).rows
    },
    stateTPM: async ()=>{
        const sql = `
            select 
                date_trunc('minute', timestamp) as timestamp,
                count(*)
            from v_transactions
            where type::text = 'state'
            group by 1
            order by 1 desc
            limit 1000
        `
        return (await query(sql)).rows
    },
}