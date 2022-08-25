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
            select sum(amount::bigint) as coin_total,
                   max(amount::bigint) as coin_max,
                   min(amount::bigint) as coin_min,
                   avg(amount::bigint) as coin_avg
            from v_transfer_coin
            where amount::text not like '0x%'
              and amount::bigint > 0
        `
        return (await query(sql)).rows[0]
    },

    mintCoinCount: async () => {
        const sql = `
            select sum(amount::bigint) as coin_total,
                   max(amount::bigint) as coin_max,
                   min(amount::bigint) as coin_min,
                   avg(amount::bigint) as coin_avg
            from v_mint_coin
            where amount::text not like '0x%'
              and amount::bigint > 0
        `
        return (await query(sql)).rows[0]
    }
}