import {query} from "../modules/postgres.js";

export const TransactionsAPI = {
    transactions: async ({order = "1 desc", limit, offset}) => {
        const sql = `
            select *
            from v_transactions
            order by '%ORDER%'
            limit $1 offset $2
        `.replace("'%ORDER%'", order)

        return (await query(sql, [limit, offset])).rows
    },

    userTransactions: async ({order = "1 desc", limit, offset}) => {
        const sql = `
            select *
            from v_transactions vt
              left join user_transactions ut on vt.id = ut.id 
            where type::text = 'user'
            order by '%ORDER%'
            limit $1 offset $2
        `.replace("'%ORDER%'", order)

        return (await query(sql, [limit, offset])).rows
    },

    metaTransactions: async ({order = "1 desc", limit, offset}) => {
        const sql = `
            select *
            from v_transactions vt
              left join meta_transactions mt on vt.id = mt.id 
            where type::text = 'meta'
            order by '%ORDER%'
            limit $1 offset $2
        `.replace("'%ORDER%'", order)

        return (await query(sql, [limit, offset])).rows
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
    }
}