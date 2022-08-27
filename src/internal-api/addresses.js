import {query} from "../modules/postgres.js";

export const AddressesAPI = {
    addressesCount: async () => {
        const sql = `
        select count(*) from addresses 
    `
        return (await query(sql)).rows[0].count
    }
}