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
                  RETURNING *`
            );


        } else {
            const query = ` INSERT INTO CategoryClosure_closure
                  VALUES (${inserted.rows[0].id}, ${inserted.rows[0].id}, 0)
                  RETURNING *`;
            const insertedClosure = await client.query(
                query
            );
        }

        client.release();

        return <ClosureCategory>{
            id: inserted.rows[0].id,
            name: inserted.rows[0].name,
            parent: c.parent
        }
    }
}