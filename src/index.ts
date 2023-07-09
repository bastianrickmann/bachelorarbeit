import { AppDataSource } from "./data-source"
import { AdjacenyCategory} from "./entity/adjaceny-list-category";
import { ClosureCategory } from "./entity/closure-table-category";
import figlet from "figlet";
import chalk from "chalk";
import {faker} from "@faker-js/faker/locale/de";
import cliProgress from "cli-progress";
import {MaterializedCategory} from "./entity/materialized-path-category";
import {NestedCategory} from "./entity/nested-set-category";
import {TreeRepository} from "typeorm";

(async () => {

figlet("Benchmark",  (error, result) => {
    if(error) {
        return
    }
    console.log(chalk.yellow(result));
});


type TestFunction = (parentNode: any, repository:  TreeRepository<any>, bar: cliProgress.SingleBar, timeStore: Array<MeasurementPoint>) => Promise<any>;

type MeasurementPoint = {
    nodeId: number;
    time: number;
    executionTime: number;
}

const runTest = async (name: string, createFunction: TestFunction, repository, rootCount: number, childrenCount: number, treeDepth: number, bar: cliProgress.MultiBar) => {

    const bar1 = bar.create(0,0);

    const nodeCount = (rootCount * (Math.pow(childrenCount, treeDepth) - 1) / (childrenCount - 1));

    const calculatedTimes = new Array<MeasurementPoint>();

    bar1.start(nodeCount, 0, {testname: name});


    const depthCall = async (createFunction: TestFunction, parentNode, depth: number) => {
        for (let subNodeI = 0; subNodeI < childrenCount; subNodeI++) {
            let newSubNode = await createFunction(parentNode,repository, bar1, calculatedTimes);
            if (depth < treeDepth) {
                await depthCall(createFunction, newSubNode, depth + 1);
            }
        }
    }

    for (let rootI = 0; rootI < rootCount; rootI++) {
        let newRoot = await createFunction(null, repository, bar1, calculatedTimes);
        if (1 < treeDepth) {
            await depthCall(createFunction, newRoot, 2);
        }
    }

    bar1.stop();

}



const ROOT_NODE_COUNT = 1;
const TREE_DEPTH = 3;
const BRANCH_NODE_COUNT = 3;

await AppDataSource.initialize()

if(AppDataSource.isInitialized) {

    await AppDataSource.synchronize(true);

    console.info(chalk.green.bold("DataSource synced"));

    const getAvgExecutionTime = (timeStore: MeasurementPoint[]) => {
        return timeStore.reduce(function (acc, num) {
            return acc + num.executionTime;
        }, 0) / timeStore.length;
    }

    const createFunction: TestFunction = async (parentNode, repository:  TreeRepository<any>, bar, timeStore) => {
        const newRootNode = repository.create({
            name: faker.string.alphanumeric({length: 20}),
            parent: parentNode
        });

        const startTime = Date.now();
        const enteredNode = await repository.save(newRootNode);
        const endTime = Date.now();

        timeStore.push({nodeId: enteredNode.id, time: startTime, executionTime: endTime - startTime});

        bar.update(enteredNode.id, {curAvgTime: getAvgExecutionTime(timeStore)});
        return enteredNode;
    }

    const multibar = new cliProgress.MultiBar({
        clearOnComplete: true,
        hideCursor: true,
        format: ' {bar} | {testname} | current Avg. Time: {curAvgTime} | {value}/{total}',
    }, cliProgress.Presets.shades_grey);


    runTest("Test Closure Table", createFunction, AppDataSource.getTreeRepository(ClosureCategory), ROOT_NODE_COUNT, BRANCH_NODE_COUNT, TREE_DEPTH, multibar);
    runTest("Test Adjacent Table", createFunction, AppDataSource.getTreeRepository(AdjacenyCategory), ROOT_NODE_COUNT, BRANCH_NODE_COUNT, TREE_DEPTH, multibar);
    runTest("Test Materialized Table", createFunction, AppDataSource.getTreeRepository(MaterializedCategory), ROOT_NODE_COUNT, BRANCH_NODE_COUNT, TREE_DEPTH, multibar);
    runTest("Test Nested Table", createFunction, AppDataSource.getTreeRepository(NestedCategory), ROOT_NODE_COUNT, BRANCH_NODE_COUNT, TREE_DEPTH, multibar);

} else {
    console.info(chalk.red.bold("DataSource not yet synced"))
}





})();