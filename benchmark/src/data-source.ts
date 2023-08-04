import "reflect-metadata"
import { DataSource } from "typeorm"
import {ClosureCategory} from "./entity/closure-table-category";
import {AdjacenyCategory} from "./entity/adjaceny-list-category";
import {NestedCategory} from "./entity/nested-set-category";
import {MaterializedCategory} from "./entity/materialized-path-category";

import { ClosureRepository } from "./repository/closure-table";
import {AdjacencyRepository} from "./repository/adjacency-table";
import {MaterializedRepository} from "./repository/materialized-table";
import {NestedRepository} from "./repository/nested-table";

export const entities = [ClosureCategory, AdjacenyCategory, MaterializedCategory, NestedCategory];

export const getRepository = (e) => {
    switch(e) {
        case ClosureCategory:
            return ClosureRepository;
        case AdjacenyCategory:
            return AdjacencyRepository;
        case MaterializedCategory:
            return MaterializedRepository;
        case NestedCategory:
            return NestedRepository;
    }
}

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
