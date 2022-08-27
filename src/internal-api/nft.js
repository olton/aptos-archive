import {query} from "../modules/postgres.js";

export const NftAPI = {
    collectionsCount: async () => {
        const sql = `
        select count(*) from collections 
    `
        return (await query(sql)).rows[0].count
    },

    tokensCount: async () => {
        const sql = `
        select count(*) from tokens 
    `
        return (await query(sql)).rows[0].count
    }
}
