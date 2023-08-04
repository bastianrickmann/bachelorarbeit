import { poolConnection } from "../db/connection";
import { NestedCategory } from "../entity/nested-set-category";


export const NestedRepository = {
    create: async (c: NestedCategory): Promise<NestedCategory> => {

        if (c.parent) {
            const parentQuery =
                `SELECT *
                 FROM CategoryNested
                 WHERE id = ${c.parent.id}`;
            const parent = (await poolConnection.query(parentQuery));

            const query =
                `UPDATE CategoryNested
                 SET rightNode = (rightNode + 2)
                 WHERE rightNode >= ${parent.rows[0].rightnode};
                INSERT INTO CategoryNested (name, leftNode, rightNode)
                VALUES ('${c.name}', ${parent.rows[0].rightnode}, ${parent.rows[0].rightnode + 1})
                RETURNING * `;
            const inserted = await poolConnection.query(query);

            return <NestedCategory>{
                children: [], parent: parent.rows[0],
                id: inserted[1].rows[0].id,
                name: inserted[1].rows[0].name,
                leftnode: inserted[1].rows[0].leftnode,
                rightnode: inserted[1].rows[0].rightnode
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
    }
}