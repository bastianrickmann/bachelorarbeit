import {
    Entity,
    Tree,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
} from "typeorm";

@Entity()
@Tree("nested-set")
export class NestedCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @TreeChildren()
    children: NestedCategory[];

    @TreeParent()
    parent: NestedCategory;
}
