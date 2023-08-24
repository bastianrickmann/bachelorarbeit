import { poolConnection } from "../db/connection";
import {ClosureCategory} from "../entity/closure-table-category";
import {NestedCategory} from "../entity/nested-set-category";



export const ClosureRepository = {
    create: async (c: ClosureCategory): Promise<ClosureCategory> => {

        const client = await poolConnection.connect();
        const inserted = await client.query(
            ` INSERT INTO CategoryClosure (name)
              VALUES ('${c.name}') RETURNING *; `
        );


        if (c.parent) {
            const insertedClosure = await client.query(
                ` INSERT INTO CategoryClosure_closure (SELECT ${inserted.rows[0].id}, ${inserted.rows[0].id}, 0
                                                       UNION
                                                       SELECT CategoryClosure_closure.ancestor as ancestor,
                                                              ${inserted.rows[0].id} as descendant,
                                                              (CategoryClosure_closure.depth + 1) as depth
                                                       FROM CategoryClosure_closure
                                                       WHERE CategoryClosure_closure.descendant = ${c.parent.id})
                `
            );


        } else {
            const query = ` INSERT INTO CategoryClosure_closure
                  VALUES ($1, $1, 0)`;
            const insertedClosure = await client.query(
                query, [inserted.rows[0].id]
            );
        }

        client.release();

        return <ClosureCategory>{
            id: inserted.rows[0].id,
            name: inserted.rows[0].name,
            parent: c.parent
        }
    },

    findAncestors: async (c: NestedCategory): Promise<NestedCategory[]> => {
        const findQuery: string =
            `       SELECT c.*
                        FROM categoryclosure c
                        JOIN categoryclosure_closure cc on c.id = cc.ancestor
                        WHERE cc.descendant = $1 AND cc.depth > 0
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
            `       SELECT c.*
                    FROM categoryclosure c
                             JOIN categoryclosure_closure cc on c.id = cc.descendant
                    WHERE cc.ancestor = $1 AND cc.depth > 0
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