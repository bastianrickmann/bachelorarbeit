import cliProgress from "cli-progress";
import {AppDataSource, entities} from "./data-source"
import fs from "fs";
import path from "path";
import {Repository} from "typeorm";
import Settings, {BENCHMARKS_START_TIME} from "./settings";
import {faker} from "@faker-js/faker/locale/de";
import Measurement, {
    MeasurementComparison,
    MeasurementKeyWords,
    MeasurementType,
    MeasurementUnit,
    Reference,
    SingleMeasurement
} from "./types";
import _ from "lodash";

// General helpers

export type TestFunction = (referenceNode: any, repository: Repository<any>) => Promise<{
    newReferenceNode?: any,
    messurements?: {
        time: number,
        executionTime: number,
        [key: string]: any },
    informations?: any
} | any | Measurement>;

export type RunFunction = ExecutionFunction | MeasurementFunction;
export type ExecutionFunction = (executionInformation: Reference) => Promise<Reference>;
export type MeasurementFunction = (executionInformation: Reference) => Promise<Measurement>

export type MeasurementPoint = {
    round: number;
    nodeId: number;
    time: number;
    executionTime: number;
    treeDepth: number;
}

export type AVGMeasurementPoint = {
    nodeId: number;
    executionTime?: number[];
    avgExecutionTime: number;
    treeDepth: number;
}


export const dataStores: Map<string, any> = new Map<string, any>();

export const allRunsCompleted = (multibar) => new Promise(resolve => {
    multibar.on('stop', () => {
        console.log('All Runs completed');
        resolve(true);
    });
});


export const getAllNodes = async (repository) => {
    return await AppDataSource.getRepository(repository).find();
}

export const iterateTree = async (repository, nodeFunction, rootCount: number, childrenCount: number, treeDepth: number, bar?: cliProgress.SingleBar) => {

    let expectedIndex = 0;
    const depthCall = async (nodeFunction, parentNode, depth: number) => {
        for (let subNodeI = 0; subNodeI < childrenCount; subNodeI++) {
            expectedIndex++;
            let newSubNode = await nodeFunction(parentNode, depth, repository, bar, expectedIndex);
            if (depth < treeDepth) {
                await depthCall(nodeFunction, newSubNode, depth + 1);
            }
        }
    }

    for (let rootI = 0; rootI < rootCount; rootI++) {
        expectedIndex++;
        let newRoot = await nodeFunction(null, 1, repository, bar, expectedIndex);
        if (1 < treeDepth) {
            await depthCall(nodeFunction, newRoot, 2);
        }
    }
}

export const buildTree = async (repository, rootCount: number, childrenCount: number, treeDepth: number) => {
    await iterateTree(repository, async (referenceNode, depth, repository) => {
        return await repository.create({
            name: faker.string.alphanumeric({length: 20}),
            parent: referenceNode
        });
    }, rootCount, childrenCount, treeDepth);

}




export const runTestForEachTreeNode = async (round: number, name: string, testFunction: MeasurementFunction, repository, rootCount: number, childrenCount: number, treeDepth: number, bar: any, withSelfRef: boolean = false) => {


    //create.ts DataStore
    if(!dataStores.get(name)) {
        dataStores.set(name, new Array<Measurement>());
    }


    //set bar name, settings and start it
    bar.start(Settings.EXPECTED_NODE_COUNT, 0, {testname: name});
    await iterateTree(repository, async (referenceNode, depth, repository, ib,  expectedNodeId) => {
        const response = await testFunction(
            {
                                reference: referenceNode,
                                referenceRepository: repository,
                                referenceInformation: {
                                                round: round,
                                                treeDepth: depth,
                                                nodeID: expectedNodeId
                                                }
                            }
            );
        dataStores.get(name).push(response);

        bar.update(response.referenceInformation.nodeID, {curAvgTime: getAvgExecutionTime(dataStores.get(name))});

        return response.reference;

    }, rootCount, childrenCount, treeDepth);

    bar.stop();

}

export const writeDataSetToFile = () => {

    //write new measurement data

    fs.mkdir('../ui/public/' + Settings.BENCHMARKS_START_TIME.toISOString().split(".")[0] + ' | ' + Settings.EXPECTED_NODE_COUNT + ' Nodes', { recursive: true }, (err) => {
        if (err) throw err;
    });
    for (const [name, data] of dataStores.entries()) {
        fs.writeFileSync('../ui/public/' + Settings.BENCHMARKS_START_TIME.toISOString().split(".")[0] + ' | ' + Settings.EXPECTED_NODE_COUNT + ' Nodes/' + name + '.json', JSON.stringify(data, null ,2), {flag: "w"});
    }
}

export const getAvgExecutionTime = (timeStore: Measurement[]) => {
    return Math.round((timeStore.reduce(function (acc, num: Measurement) {
        if("value" in num && num.label === MeasurementType.EXECUTION_TIME && (!num.unit || num.unit === MeasurementUnit.MS)) {
            return acc + num.value;
        } else if ("partialMeasurements" in num) {
            return acc + (num.partialMeasurements.find((m) =>  m.label  === MeasurementType.EXECUTION_TIME && (!m.unit || m.unit === MeasurementUnit.MS))).value
        }
        return acc;
    }, 0) / timeStore.length)  * 100) / 100;
}


export const getMeasurementValue = (m: Measurement, valueName: MeasurementType) => {
    if("value" in m && m.label === valueName) {
        return m.value;
    } else if ("partialMeasurements" in m) {
        return (m.partialMeasurements.find((m) =>  m.label  === valueName)).value
    }
}

export const forEachImplementation = async (fn: (e) => void) => {
    for (let e of entities) {
        await fn(e);
    }
}

export const getStorageName = (benchmarkName: string, entityName: string, ...prefix: string[]) =>  {
    return [benchmarkName, ...prefix, entityName].join(" ")
}



export const getGroupedMeasurements = (benchmarkName, e, groupBy: (p: Measurement) => any, mType: MeasurementType) => {

    const dataPoints: Measurement[] = dataStores.get(getStorageName(benchmarkName, e.name));

    const splitoutGroupName = groupBy.toString().split('.')

    const storeName = getStorageName(benchmarkName, e.name, MeasurementKeyWords.AVG, groupBy.toString().split('.')[splitoutGroupName.length - 1], mType)
    dataStores.set(storeName, new Array<Measurement>());

    const avgDataPoints: Measurement[] = dataStores.get(storeName);

    const groupedData = _.values(_.groupBy(dataPoints, groupBy));

    avgDataPoints.push(...groupedData.map((d: Measurement[]): Measurement => {
            const executionTimes: number[] = d.map(v => getMeasurementValue(v, mType));

            return {
                value: executionTimes.reduce(
                    (accumulator,
                     currentValue,
                     currentIndex,
                     array
                    ) => accumulator + currentValue / array.length
                    , 0),
                unit: "ms",
                label: MeasurementKeyWords.AVG + " " + mType,
                partialMeasurements: [
                    ...d.map((m): SingleMeasurement => ({
                        label: mType,
                        value: getMeasurementValue(m, mType),
                        reference: m.reference,
                        referenceInformation: {
                            round: m.referenceInformation.round
                        },
                        unit: "unit" in m ? m.unit : undefined
                    }))
                ],
                referenceInformation: {
                    treeDepth: d[0].referenceInformation.treeDepth,
                    nodeID: d[0].referenceInformation.nodeID
                }
            };
        }
    ))
}


export const compareMeasurements = (benchmarkName, ...prefix) => {

    prefix = prefix.map(p => { const l = p.toString().split('.'); return l[l.length - 1]});

    const comp: MeasurementComparison = { }

    forEachImplementation((e) => {

        const measurements: Measurement[] = dataStores.get(getStorageName(benchmarkName, e.name, ...prefix));
        comp[e.name] = measurements;

    })

    dataStores.set(getStorageName(benchmarkName, MeasurementKeyWords.COMP, ...prefix), comp);
}