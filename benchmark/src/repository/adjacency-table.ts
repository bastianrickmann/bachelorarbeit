import { poolConnection } from "../db/connection";
import { AdjacenyCategory } from "../entity/adjaceny-list-category";
import {NestedCategory} from "../entity/nested-set-category";


export const AdjacencyRepository = {
    create: async (c: AdjacenyCategory): Promise<AdjacenyCategory> => {
        const inserted = await poolConnection.query(
            ` INSERT INTO CategoryAdjacency (name, parent)
              VALUES ('${c.name}', ${c.parent ? c.parent.id : 'NULL'})
              RETURNING * `
        );

        return <AdjacenyCategory>{
            children: [], parent: c.parent,
            id: inserted.rows[0].id,
            name: inserted.rows[0].name
        }
    }
}