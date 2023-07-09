import {
    Entity,
    Tree,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent, TreeLevelColumn,
} from "typeorm";

@Entity()
@Tree("closure-table")
export class ClosureCategory {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @TreeChildren({cascade: true})
    children: ClosureCategory[];

    @TreeParent({onDelete: "CASCADE"})
    parent: ClosureCategory;

}
