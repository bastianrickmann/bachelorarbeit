"use client"
import Chart, {cad} from "@/app/chart";
import { parse } from "csv";
import {useEffect, useState} from "react";


export default function Home() {

    const [data1, setData1] = useState<cad[]>([]);
    const [data2, setData2] = useState<any[]>([]);
    const [data3, setData3] = useState<any[]>([]);

    const [pathFolder, setPathFolder] = useState("2023-08-24T17:00:49 | 25 Nodes")


    useEffect(() => {
        ( async () => {
            const f = async (url: string): Promise<Array<any>> => new Promise<Array<any>>(async resolve => {
                const data = await fetch(url, {cache: "no-cache"})
                    .then((response) => response.json());
                console.log("T:" , data)

                const g = [];

                data.AdjacenyCategory.forEach((a, i, s) => {
                    g.push(
                        {
                            nodeId: a.referenceInformation.nodeID,
                            "Adjazenzliste": data.AdjacenyCategory[i].value,
                            "Nested Set": data.NestedCategory[i].value,
                            "Materialized Path": data.MaterializedCategory[i].value,
                            "Closure Table": data.ClosureCategory[i].value,
                        }
                    )
                })
                resolve(g)
            });


            const t = await f("http://localhost:3000/" + pathFolder + "/CREATE avg nodeID executionTime comp.json");
            const t2 = await f("http://localhost:3000/" + pathFolder + "/ANCESTORS avg treeDepth executionTime comp.json");
            const t3 = await f("http://localhost:3000/" + pathFolder + "/DESCENDANTS avg treeDepth executionTime comp.json");

            setData1(t);
            setData2(t2);
            setData3(t3);
        })();
    }, [pathFolder])


    return (
        <div className={"grid grid-cols-1 gap-8 m-4"}>
            <Chart title={"Ausführungszeit pro Node"} description={"Der Graph zeigt den Durschnittswert aus 10 gleichen Ausführungen"} data={data1} x={"nodeId"} suffix={"ms"}/>
            <Chart title={"Ausführungszeit pro Node"} description={"Der Graph zeigt den Durschnittswert aus 10 gleichen Ausführungen"} data={data2} x={"nodeId"} suffix={"ms"}/>
            <Chart title={"Ausführungszeit pro Node"} description={"Der Graph zeigt den Durschnittswert aus 10 gleichen Ausführungen"} data={data3} x={"nodeId"} suffix={"ms"}/>
        </div>
    );
}