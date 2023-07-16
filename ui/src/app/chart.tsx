"use client"
import { Card, AreaChart, Title, Text } from "@tremor/react";


export type cad = {
    nodeId: number;
    treeDepth: number;
    [key:string]: number;
}

export default function Chart({ title, description, data, suffix, x }: { title: string, description: string, data: cad[], suffix?: string; x?: string;})  {
    return (
        <Card>
            <Title>{ title }</Title>
            <Text>{ description }</Text>
            <AreaChart
                className="mt-4 h-80"
                data={data}
                categories={["AdjacenyCategory", "NestedCategory", "MaterializedCategory", "ClosureCategory"]}
                index={x ?? "nodeId"}
                colors={["indigo", "fuchsia", "red", "green"]}
                yAxisWidth={60}
                valueFormatter={(number: number) =>
                    `${Intl.NumberFormat("de").format(number).toString()}${suffix ? suffix : ""}`
                }
            />
        </Card>
    );
}