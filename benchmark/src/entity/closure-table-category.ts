import {
    Entity,
    Column,
    PrimaryGeneratedColumn, AfterInsert, OneToMany, Tree, TreeLevelColumn, TreeParent, TreeChildren,
} from "typeorm";
import { ClosureCategory_Closure } from "./closure-table-category-closure"
import {AppDataSource} from "../data-source";

@Entity()
@Tree("closure-table", {
    closureTableName: "category_closure",
    ancestorColumnName: (column) => column.propertyName + "_ancestor",
    descendantColumnName: (column) => column.propertyName + "_descendant",
})
export class ClosureCategory {

    @PrimaryGeneratedColumn({type: "integer"})
    id: number;

    @Column()
    name: string;

    @TreeParent()
    parent;

    @TreeLevelColumn()
    level: number;

}
