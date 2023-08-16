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
    },

    findAncestors: async (c: MaterializedCategory): Promise<MaterializedCategory[]> => {
        const findQuery: string =
            ` SELECT *
              FROM categorymaterialized
              WHERE
                      (SELECT path
                       FROM categorymaterialized
                       WHERE id = $1 LIMIT 1
                      ) LIKE CONCAT(path,'%') AND id != $1
            `;

        const found = await poolConnection.query(findQuery, [c.id]);
        return found.rows.map(r => {
            return (<MaterializedCategory>{
                children: [], parent: null,
                id: r.id,
                name: r.name,
                leftnode: r.leftnode,
                rightnode: r.rightnode
            });
        })
    },

    findDescendant: async (c: MaterializedCategory): Promise<MaterializedCategory[]> => {
        const findQuery: string =
            ` SELECT *
              FROM categorymaterialized
              WHERE path LIKE CONCAT('%', CONCAT($1::text,'%')) AND id != $2;
            `;

        const found = await poolConnection.query(findQuery, [c.id.toString(), c.id]);
        return found.rows.map(r => {
            return (<MaterializedCategory>{
                children: [], parent: null,
                id: r.id,
                name: r.name,
                leftnode: r.leftnode,
                rightnode: r.rightnode
            });
        })

    }
}