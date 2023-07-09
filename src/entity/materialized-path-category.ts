import {
    Entity,
    Tree,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
} from "typeorm";

@Entity()
@Tree("materialized-path")
export class MaterializedCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @TreeChildren()
    children: MaterializedCategory[];

    @TreeParent()
    parent: MaterializedCategory;
}
