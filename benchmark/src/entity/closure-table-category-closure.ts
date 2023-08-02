import {Column, Entity, ManyToOne, PrimaryColumn, TreeChildren, TreeLevelColumn, TreeParent} from "typeorm";
import {ClosureCategory} from "./closure-table-category";


@Entity({name: "category_closure"})
export class ClosureCategory_Closure {

    @PrimaryColumn()
    id_ancestor: number

    @PrimaryColumn()
    id_descendant: number;

    @TreeLevelColumn()
    @Column({type: "integer", default: 0, nullable: false})
    level: number;
}