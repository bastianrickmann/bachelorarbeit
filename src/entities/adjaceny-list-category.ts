import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToOne((type) => Category, (category) => category.children)
    parent: Category;

    @OneToMany((type) => Category, (category) => category.parent)
    children: Category[];
}
