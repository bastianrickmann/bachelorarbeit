import { stringify } from "csv";
import cliProgress from "cli-progress";
import {AppDataSource, entities} from "./data-source"
import fs from "fs";
import path from "path";
import {TreeRepository} from "typeorm";
import Settings from "./settings";
import {faker} from "@faker-js/faker/locale/de";

// General helpers

export type TestFunction = (referenceNode: any, repository: TreeRepository<any>) => Promise<{
    newReferenceNode?: any,
    messurements?: {
        time: number,
        executionTime: number,
        [key: string]: any },
    informations?: any
} | any>;

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

    const depthCall = async (nodeFunction, parentNode, depth: number) => {
        for (let subNodeI = 0; subNodeI < childrenCount; subNodeI++) {
            let newSubNode = await nodeFunction(parentNode, depth, repository, bar);
            if (depth < treeDepth) {
                await depthCall(nodeFunction, newSubNode, depth + 1);
            }
        }
    }

    for (let rootI = 0; rootI < rootCount; rootI++) {
        let newRoot = await nodeFunction(null, 1, repository, bar);
        if (1 < treeDepth) {
            await depthCall(nodeFunction, newRoot, 2);
        }
    }
}

export const buildTree = async (repository, rootCount: number, childrenCount: number, treeDepth: number) => {

    await iterateTree(repository, (referenceNode, depth, repository) => {
        return repository.create({
            name: faker.string.alphanumeric({length: 20}),
            parent: null
        });
    }, rootCount, childrenCount, treeDepth);

}




export const runTestForEachTreeNode = async (name: string, testFunction: TestFunction, repository, rootCount: number, childrenCount: number, treeDepth: number, bar: any) => {


    //create.ts DataStore
    if(!dataStores.get(name)) {
        dataStores.set(name, new Array<MeasurementPoint>());
    }


    //set bar name, settings and start it
    bar.start(Settings.EXPECTED_NODE_COUNT, 0, {testname: name});
    await iterateTree(repository, async (referenceNode, depth, repository) => {

        const response = await testFunction(referenceNode, repository);

        const informations = {
            round: response.informations.round,
            nodeId: response.informations.nodeId,
            time: response.measurements.time,
            executionTime: response.measurements.executionTime,
            treeDepth: depth
        };

        dataStores.get(name).push(informations);

        bar.update(response.newReferenceNode.id, {curAvgTime: getAvgExecutionTime(dataStores.get(name))});

        return response.newReferenceNode;

    }, rootCount, childrenCount, treeDepth);

    bar.stop();

}

export const writeDataSetToFile = () => {

    //wipe measurements folder
    const directory ="../ui/public";
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
    });

    //write new measurement data

    for (const [name, data] of dataStores.entries()) {

        const stringifier = stringify( { header: true});

        data.forEach((cT) => {
            stringifier.write(cT);
        })

        const writableStream = fs.createWriteStream("../ui/public/" + name + '.csv', { flags: "w"});
        stringifier.pipe(writableStream);

    }
}

export const getAvgExecutionTime = (timeStore: MeasurementPoint[]) => {
    return timeStore.reduce(function (acc, num) {
        return acc + num.executionTime;
    }, 0) / timeStore.length;
}


export const forEachImplementation = (fn: (e) => void) => {
    for(let e of entities) {
        fn(e);
    }
}