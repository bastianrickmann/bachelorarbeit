import { Pool, Client } from 'pg'
import {Connection} from "typeorm";

export const poolConnection = new Pool({
    user: 'thesis',
    host: 'localhost',
    database: 'thesis',
    password: 'password',
    port: 5432,
})


export const disconnect = () => {
    poolConnection.end();
}