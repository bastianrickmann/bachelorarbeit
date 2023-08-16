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
    },

    findAncestors: async (c: AdjacenyCategory): Promise<AdjacenyCategory[]> => {
        return new Promise<AdjacenyCategory[]>( async (resolve, reject) => {
            const list = [];
            const findNextOne = async (id: number) => {

                const findQuery =
                    `
                        SELECT *
                        FROM categoryadjacency
                        WHERE id = $1
                    `;
                const found = await poolConnection.query(findQuery, [id]);
                if (found.rows.length === 0) {
                    return;
                }
                list.push({
                    children: [], parent: null,
                    id: found.rows[0].id,
                    name: found.rows[0].name
                });
                if (found.rows[0].parent) {
                    await findNextOne(found.rows[0].parent);
                }

            }

            await findNextOne(c.id);

            resolve(list);
        })
    },

    findDescendant: async (c: AdjacenyCategory): Promise<AdjacenyCategory[]> => {
        return new Promise<AdjacenyCategory[]>( async (resolve, reject) => {

            const list = [];
            const findNextOne = async (ids: number[]) => {

                const findQuery =
                    `
                        SELECT *
                        FROM categoryadjacency
                        WHERE parent IN (` + ids.join(', ') + `)
                    `;

                const founds = await poolConnection.query(findQuery);
                if (founds.rows.length === 0) {
                    return;
                }
                founds.rows.map(r => {
                    list.push({
                        children: [], parent: null,
                        id: r.id,
                        name: r.name
                    });
                })

                await findNextOne(founds.rows.map(r => {
                    return r.id
                }));

            }

            await findNextOne([c.id]);

            resolve(list);
        })
    }
}