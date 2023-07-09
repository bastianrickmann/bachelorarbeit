import "reflect-metadata"
import { DataSource } from "typeorm"
import {ClosureCategory} from "./entity/closure-table-category";
import {AdjacenyCategory} from "./entity/adjaceny-list-category";
import {NestedCategory} from "./entity/nested-set-category";
import {MaterializedCategory} from "./entity/materialized-path-category";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "thesis",
    password: "password",
    database: "thesis",
    synchronize: true,
    logging: false,
    entities: [ClosureCategory, AdjacenyCategory, NestedCategory, MaterializedCategory],
    migrations: [],
    subscribers: [],
})
