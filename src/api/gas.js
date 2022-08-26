import {query} from "../modules/postgres.js";

export const GasAPI = {
    async gasCount(){
        const sql = `
            select coin_total,
                   coin_max,
                   coin_min,
                   coin_avg
            from coin_counters
            where function = 'gas'
        `
        return (await query(sql)).rows[0]
    }
}