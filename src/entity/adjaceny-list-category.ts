import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class AdjacenyCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne((type) => AdjacenyCategory, (category) => category.children)
    parent: AdjacenyCategory;

    @OneToMany((type) => AdjacenyCategory, (category) => category.parent)
    children: AdjacenyCategory[];
}
