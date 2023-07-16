import { stringify } from "csv";
import { AdjacenyCategory} from "./entity/adjaceny-list-category";
import { ClosureCategory } from "./entity/closure-table-category";
import {MaterializedCategory} from "./entity/materialized-path-category";
import {NestedCategory} from "./entity/nested-set-category";
import cliProgress from "cli-progress";
import { AppDataSource } from "./data-source"
import fs from "fs";
import path from "path";
import {TreeRepository} from "typeorm";


import { EXPECTED_NODE_COUNT, ROOT_NODE_COUNT, BRANCH_NODE_COUNT, TREE_DEPTH , ROUNDS } from "./settings";
import {faker} from "@faker-js/faker/locale/de";

// General helpers

export type TestFunction = (referenceNode: any, depth: number, repository: TreeRepository<any>, bar?: cliProgress.SingleBar, timeStore?: Array<MeasurementPoint>) => Promise<any>;

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

export const entities = [ClosureCategory, AdjacenyCategory, MaterializedCategory, NestedCategory];


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

export const iterateTree = async (repository, nodeFunction: TestFunction, rootCount: number, childrenCount: number, treeDepth: number) => {

    const depthCall = async (nodeFunction: TestFunction, parentNode, depth: number) => {
        for (let subNodeI = 0; subNodeI < childrenCount; subNodeI++) {
            let newSubNode = await nodeFunction(parentNode, depth, repository);
            if (depth < treeDepth) {
                await depthCall(nodeFunction, newSubNode, depth + 1);
            }
        }
    }

    for (let rootI = 0; rootI < rootCount; rootI++) {
        let newRoot = await nodeFunction(null, 1, repository);
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




export const runTest = async (name: string, testFunction: TestFunction, repository, rootCount: number, childrenCount: number, treeDepth: number, bar: any) => {

    if(!dataStores.get(name)) {
        dataStores.set(name, new Array<MeasurementPoint>());
    }

    const calculatedTimes = dataStores.get(name);

    bar.start(EXPECTED_NODE_COUNT, 0, {testname: name});

    const depthCall = async (testFunction: TestFunction, parentNode, depth: number) => {
        for (let subNodeI = 0; subNodeI < childrenCount; subNodeI++) {
            let newSubNode = await testFunction(parentNode, depth, repository, bar, calculatedTimes);
            if (depth < treeDepth) {
                await depthCall(testFunction, newSubNode, depth + 1);
            }
        }
    }

    for (let rootI = 0; rootI < rootCount; rootI++) {
        let newRoot = await testFunction(null, 1, repository, bar, calculatedTimes);
        if (1 < treeDepth) {
            await depthCall(testFunction, newRoot, 2);
        }
    }

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