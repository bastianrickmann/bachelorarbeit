import "reflect-metadata"
import { DataSource } from "typeorm"
import {ClosureCategory} from "./entity/closure-table-category";
import {AdjacenyCategory} from "./entity/adjaceny-list-category";
import {NestedCategory} from "./entity/nested-set-category";
import {MaterializedCategory} from "./entity/materialized-path-category";

export const entities = [ClosureCategory, AdjacenyCategory, MaterializedCategory, NestedCategory];

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "thesis",
    password: "password",
    database: "thesis",
    synchronize: true,
    logging: false,
    entities: entities,
    migrations: [],
    subscribers: [],
})
