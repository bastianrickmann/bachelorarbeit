import { poolConnection } from "../db/connection";
import {MaterializedCategory} from "../entity/materialized-path-category";
import {NestedCategory} from "../entity/nested-set-category";


export const MaterializedRepository = {
    create: async (c: MaterializedCategory): Promise<MaterializedCategory> => {
        if (c.parent) {
            const insertedQuery =
                ` INSERT INTO CategoryMaterialized (name, path)
                  VALUES ('${c.name}', '')
                  RETURNING *
                `;
            const inserted = await poolConnection.query(insertedQuery);
            const insertedUpdate = await poolConnection.query(
                `  UPDATE CategoryMaterialized SET path = CONCAT( (SELECT path FROM CategoryMaterialized as cc WHERE cc.id = ${c.parent.id}) ,CONCAT(id, '.')) WHERE id = ${inserted.rows[0].id} RETURNING *`
            );


            return <MaterializedCategory>{
                children: [], parent: c.parent,
                id: inserted.rows[0].id,
                name: inserted.rows[0].name
            }
        } else {
            const query =
                ` INSERT INTO CategoryMaterialized (name, path)
                    VALUES ('${c.name}', '')
                    RETURNING *
                `;

            const inserted = await poolConnection.query(query);
            const updatePath = await poolConnection.query(`
                  UPDATE CategoryMaterialized as c SET path = CONCAT(id, '.') WHERE id = ${inserted.rows[0].id} RETURNING *;
`               );


            return <MaterializedCategory>{
                children: [], parent: c.parent,
                id: inserted.rows[0].id,
                name: inserted.rows[0].name
            }
        }
    }
}