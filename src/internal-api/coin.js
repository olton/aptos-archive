import {query} from "../modules/postgres.js";

export const CoinAPI = {
    mintCoin: async ({order = "1 desc", limit, offset}) => {
        const sql = `
            select *
            from v_mint_coin
            order by '%ORDER%'
            limit $1 offset $2
        `.replace("'%ORDER%'", order)

        return (await query(sql , [limit, offset])).rows
    },

    transferCoin: async ({order = "1 desc", limit, offset}) => {
        const sql = `
            select *
            from v_transfer_coin
            order by '%ORDER%'
            limit $1 offset $2
        `.replace("'%ORDER%'", order)

        return (await query(sql, [limit, offset])).rows
    },

    transferCoinCount: async () => {
        const sql = `
            select coin_total,
                   coin_max,
                   coin_min,
                   coin_avg
            from coin_counters
            where function = 'transfer'
        `
        return (await query(sql)).rows[0]
    },

    mintCoinCount: async () => {
        const sql = `
            select coin_total,
                   coin_max,
                   coin_min,
                   coin_avg
            from coin_counters
            where function = 'mint' 
        `
        return (await query(sql)).rows[0]
    }
}