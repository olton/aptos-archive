import {query} from "../modules/postgres.js";

export const GasAPI = {
    async gasCount(){
        const sql = `
            select
               sum(gas_used) as gas_total,
               max(gas_used) as gas_max,
               min(gas_used) as gas_min,
               avg(gas_used) as gas_avg
            from transactions
            where type = 'user'
        `

        return (await query(sql)).rows[0]
    }
}