import { poolConnection } from "./connection";
import fs from "fs";


export const buildDB = async () => {

    var sql = fs.readFileSync("./src/db.sql", "utf-8");
    const res = await poolConnection.query(sql);
}