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
import {stringify} from "csv";
import fs from "fs";
import {de, tr} from "@faker-js/faker";
(async () => {

    figlet("Benchmark", (error, result) => {
        if (error) {
            return
        }
        console.log(chalk.yellow(result));
    });

    type TestFunction = (parentNode: any, depth: number, repository: TreeRepository<any>, bar: cliProgress.SingleBar, timeStore: Array<MeasurementPoint>) => Promise<any>;

    type MeasurementPoint = {
        nodeId: number;
        time: number;
        executionTime: number;
        treeDepth: number;
    }

    const entities = [ClosureCategory, AdjacenyCategory, MaterializedCategory, NestedCategory];

    const allRunsCompleted = (multibar) => new Promise(resolve => {
        multibar.on('stop', () => {
            console.log('All Runs completed');
            resolve(true);
        });
    });

    const runTest = async (name: string, createFunction: TestFunction, repository, rootCount: number, childrenCount: number, treeDepth: number, bar: cliProgress.MultiBar) => {

        const bar1 = bar.create(0, 0);

        const nodeCount = (rootCount * (Math.pow(childrenCount, treeDepth) - 1) / (childrenCount - 1));

        const calculatedTimes = new Array<MeasurementPoint>();

        bar1.start(nodeCount, 0, {testname: name});

        const depthCall = async (createFunction: TestFunction, parentNode, depth: number) => {
            for (let subNodeI = 0; subNodeI < childrenCount; subNodeI++) {
                let newSubNode = await createFunction(parentNode, depth, repository, bar1, calculatedTimes);
                if (depth < treeDepth) {
                    await depthCall(createFunction, newSubNode, depth + 1);
                }
            }
        }

        for (let rootI = 0; rootI < rootCount; rootI++) {
            let newRoot = await createFunction(null, 1, repository, bar1, calculatedTimes);
            if (1 < treeDepth) {
                await depthCall(createFunction, newRoot, 2);
            }
        }

        bar1.stop();


        const stringifier = stringify({header: true});
        calculatedTimes.forEach((cT) => {
            stringifier.write(cT);
        })

        const writableStream = fs.createWriteStream(name + '.csv');
        stringifier.pipe(writableStream);

    }


    const ROOT_NODE_COUNT = 1;
    const TREE_DEPTH = 3;
    const BRANCH_NODE_COUNT = 10;

    for(let ti = 0; ti < 10; ti++) {

        console.log(chalk.green.bold(`BENCHMARKRUN #${ti + 1}`));

        await AppDataSource.initialize();

        if (AppDataSource.isInitialized) {

            await AppDataSource.synchronize(true);

            console.info(chalk.green.bold("DataSource synced"));

            const getAvgExecutionTime = (timeStore: MeasurementPoint[]) => {
                return timeStore.reduce(function (acc, num) {
                    return acc + num.executionTime;
                }, 0) / timeStore.length;
            }

            const createFunction: TestFunction = async (parentNode, depth: number, repository: TreeRepository<any>, bar, timeStore) => {
                const newRootNode = repository.create({
                    name: faker.string.alphanumeric({length: 20}),
                    parent: parentNode
                });

                const startTime = Date.now();
                const enteredNode = await repository.save(newRootNode);
                const endTime = Date.now();

                timeStore.push({
                    nodeId: enteredNode.id,
                    time: startTime,
                    executionTime: endTime - startTime,
                    treeDepth: depth
                });

                bar.update(enteredNode.id, {curAvgTime: getAvgExecutionTime(timeStore)});
                return enteredNode;
            }

            const multibar = new cliProgress.MultiBar({
                clearOnComplete: false,
                hideCursor: true,
                format: ' {bar} | {testname} | current Avg. Time: {curAvgTime} | {value}/{total}',
                stopOnComplete: true
            }, cliProgress.Presets.shades_grey);


            entities.forEach((e) => {
                runTest("Create " + e.name, createFunction, AppDataSource.getTreeRepository(e), ROOT_NODE_COUNT, BRANCH_NODE_COUNT, TREE_DEPTH, multibar);
            })

            await allRunsCompleted(multibar);

        } else {
            console.info(chalk.red.bold("DataSource not yet synced"))
        }

        await AppDataSource.destroy();
    }


})();