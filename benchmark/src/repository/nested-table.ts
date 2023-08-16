import { poolConnection } from "../db/connection";
import { NestedCategory } from "../entity/nested-set-category";
import {AdjacenyCategory} from "../entity/adjaceny-list-category";


export const NestedRepository = {
    create: async (c: NestedCategory): Promise<NestedCategory> => {

        if (c.parent) {
            const parentQuery =
                `SELECT *
                 FROM CategoryNested
                 WHERE id = ${c.parent.id}`;
            const parent = (await poolConnection.query(parentQuery));

            const query =
               `
                UPDATE CategoryNested
                SET rightNode = (rightNode + 2)
                WHERE rightNode >= ${parent.rows[0].rightnode};
                UPDATE CategoryNested
                SET leftNode = (leftNode + 2)
                WHERE leftNode >= ${parent.rows[0].rightnode};
                INSERT INTO CategoryNested (name, leftNode, rightNode)
                VALUES ('${c.name}', ${parent.rows[0].rightnode}, ${parent.rows[0].rightnode + 1})
                RETURNING * 
                `;
            const inserted = await poolConnection.query(query);

            return <NestedCategory>{
                children: [], parent: parent.rows[0],
                id: inserted[2].rows[0].id,
                name: inserted[2].rows[0].name,
                leftnode: inserted[2].rows[0].leftnode,
                rightnode: inserted[2].rows[0].rightnode
            }
        } else {
            const inserted = await poolConnection.query(
                ` INSERT INTO CategoryNested (name, leftNode, rightNode)
                  VALUES ('${c.name}', 1, 2)
                  RETURNING * `
            );

            return <NestedCategory>{
                children: [], parent: null,
                id: inserted.rows[0].id,
                name: inserted.rows[0].name,
                leftnode: inserted.rows[0].leftnode,
                rightnode: inserted.rows[0].rightnode
            }
        }
    },

    findAncestors: async (c: NestedCategory): Promise<NestedCategory[]> => {
            const findQuery: string =
                `       SELECT *
                        FROM categorynested
                        WHERE leftnode < (SELECT leftnode
                            FROM categorynested
                            WHERE id = $1 LIMIT 1) AND rightnode > (SELECT rightnode
                            FROM categorynested
                            WHERE id = $1 LIMIT 1) ORDER BY id ASC
                    `;

            const found = await poolConnection.query(findQuery, [c.id]);
            return found.rows.map(r => {
                return ({
                    children: [], parent: null,
                    id: r.id,
                    name: r.name,
                    leftnode: r.leftnode,
                    rightnode: r.rightnode
                });
            })

    },
    findDescendant: async  (c: NestedCategory): Promise<NestedCategory[]> => {
        const findQuery: string =
            `       SELECT *
                        FROM categorynested
                        WHERE leftnode > (SELECT leftnode
                            FROM categorynested
                            WHERE id = $1 LIMIT 1) AND rightnode <  (SELECT rightnode
                            FROM categorynested
                            WHERE id = $1 LIMIT 1) ORDER BY id ASC
                    `;

        const found = await poolConnection.query(findQuery, [c.id]);
        return found.rows.map(r => {
            return ({
                children: [], parent: null,
                id: r.id,
                name: r.name,
                leftnode: r.leftnode,
                rightnode: r.rightnode
            });
        })
    }

}