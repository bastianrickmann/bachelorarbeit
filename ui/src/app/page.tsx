"use client"
import Chart, {cad} from "@/app/chart";
import { parse } from "csv";
import {useEffect, useState} from "react";


export default function Home() {

    const [data1, setData1] = useState<cad[]>([]);
    const [data2, setData2] = useState<any[]>([]);


    useEffect(() => {
        ( async () => {
            const f = async (url: string): Promise<Array<any>> => new Promise<Array<any>>(async resolve => {
                const records = new Array<any>();

                const data = await fetch(url, {cache: "no-cache"})
                    .then((response) => response.text());
                const parser = parse(data, {
                    trim: true,
                    skip_empty_lines: true,
                    columns: true,
                    cast: true
                });
                // Use the readable stream api
                parser.on('readable', function () {
                    let record: cad;
                    while ((record = parser.read()) !== null) {
                        console.log(record);
                        records.push(record);
                    }
                    resolve(records);
                });
            });

            const t = await f("http://localhost:3000/Create.csv");
            const t2 = await f("http://localhost:3000/Create TreeDepth.csv");

            setData1(t);
            setData2(t2);
        })();
    }, [])


    return (
        <div className={"grid grid-cols-1 gap-8 m-4"}>
            <Chart title={"Execution Time By Node ID"} description={"Shows a graph based on execution time of each node"} data={data1} suffix={"ms"}/>
            <Chart title={"Execution Time By Tree Depth"} description={"Shows a graph based on execution time of tree depth"} data={data2} x={"treeDepth"} suffix={"ms"}/>

        </div>
    );
}