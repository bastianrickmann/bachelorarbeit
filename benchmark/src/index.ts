import { AppDataSource } from "./data-source"
import figlet from "figlet";
import chalk from "chalk";
import {faker} from "@faker-js/faker/locale/de";
import cliProgress from "cli-progress";
import {TreeRepository} from "typeorm";
import _ from "lodash";
import { TestFunction, MeasurementPoint, runTest, allRunsCompleted, writeDataSetToFile, dataStores, AVGMeasurementPoint, entities } from "./helpers";
import { EXPECTED_NODE_COUNT, ROOT_NODE_COUNT, BRANCH_NODE_COUNT, TREE_DEPTH , ROUNDS } from "./settings";




figlet("Benchmark", (error, result) => {
    if (error) {
        return
    }
    console.log(chalk.yellow(result));
(async () => {


    /*** Benchmark run ***/

    for(let ti = 0; ti < ROUNDS; ti++) {

        console.log(chalk.greenBright.underline.italic.bold(`BENCHMARKRUN #${ti + 1}`));

        await AppDataSource.initialize();

        if (AppDataSource.isInitialized) {

            await AppDataSource.synchronize(true);

            console.info(chalk.blackBright(" - DataSource synced"));

            const getAvgExecutionTime = (timeStore: MeasurementPoint[]) => {
                return timeStore.reduce(function (acc, num) {
                    return acc + num.executionTime;
                }, 0) / timeStore.length;
            }



            const multibar = new cliProgress.MultiBar({
                clearOnComplete: false,
                hideCursor: true,
                format: ' {bar} | {testname} | current Avg. Time: {curAvgTime} | {value}/{total}',
                stopOnComplete: true
            }, cliProgress.Presets.shades_grey);


            for (const e of entities) {


                const bar = multibar.create(0,0);
                const createFunction: TestFunction = async (parentNode, depth: number, repository: TreeRepository<any>, _ , timeStore) => {
                    const newRootNode = repository.create({
                        name: faker.string.alphanumeric({length: 20}),
                        parent: parentNode
                    });

                    const startTime = Date.now();
                    const enteredNode = await repository.save(newRootNode);
                    const endTime = Date.now();

                    dataStores.get("Create " + e.name).push({
                        round: ti + 1,
                        nodeId: enteredNode.id,
                        time: startTime,
                        executionTime: endTime - startTime,
                        treeDepth: depth
                    });

                    bar.update(enteredNode.id, {curAvgTime: getAvgExecutionTime(timeStore)});
                    return enteredNode;
                }

                await runTest("Create " + e.name, createFunction, AppDataSource.getTreeRepository(e), ROOT_NODE_COUNT, BRANCH_NODE_COUNT, TREE_DEPTH, bar);
            }

            await allRunsCompleted(multibar);

        } else {
            console.info(chalk.red.bold("DataSource not yet synced"))
        }

        await AppDataSource.destroy();
    }


    // POST PROCESSING



    for (const e of entities) {


        // avg base on NodeID

        const name = "Create " + e.name;
        const dataPoints: MeasurementPoint[] = dataStores.get(name);

        dataStores.set("avg " + name, new Array<AVGMeasurementPoint>());

        const avgDataPoints: AVGMeasurementPoint[] = dataStores.get("avg " + name);

        const groupedData = _.values(_.groupBy(dataPoints, (p) => p.nodeId));

        avgDataPoints.push(...groupedData.map((d): AVGMeasurementPoint => {
                const executionTimes: number[] = d.map(v => v.executionTime);

                return ({
                    nodeId: d[0].nodeId,
                    treeDepth: d[0].treeDepth,
                    executionTime: d.map(v => v.executionTime),
                    avgExecutionTime: executionTimes.reduce(
                        (accumulator,
                         currentValue,
                         currentIndex,
                         array
                        ) => accumulator + (currentValue / array.length)
                        , 0)
                })
            }
        ))

        // avg Base on treeDepth

        const nameDepth = "Create " + e.name;
        const dataPointsDepth: MeasurementPoint[] = dataStores.get(nameDepth);

        dataStores.set("avg treeDepth" + nameDepth, new Array<any>());

        const avgDataPointsDepth: any[] = dataStores.get("avg treeDepth" + nameDepth);

        const groupedDataDepth = _.values(_.groupBy(dataPointsDepth, (p) => p.treeDepth));

        avgDataPointsDepth.push(...groupedDataDepth.map((d): any => {
                const executionTimes: number[] = d.map(v => v.executionTime);

                return ({
                    treeDepth: d[0].treeDepth,
                    executionTime: d.map(v => v.executionTime),
                    avgExecutionTime: executionTimes.reduce(
                        (accumulator,
                         currentValue,
                         currentIndex,
                         array
                        ) => accumulator + (currentValue / array.length)
                        , 0)
                })
            }
        ))
        };



        type cad = {
            nodeId: number;
            treeDepth: number;
            [key:string]: number;
        }

        const name = "Create";
        const dataPoints: cad[] = new Array<cad>();

        for (const e of entities) {

            const name = "Create " + e.name;
            const avgDataPoints: AVGMeasurementPoint[] = dataStores.get("avg " + name);

            avgDataPoints.forEach((data, index) => {
                    const d = dataPoints.at(index - 1) ?? {
                        nodeId: data.nodeId, treeDepth: data.treeDepth
                    };

                    d[e.name] = data.avgExecutionTime;

                    dataPoints.splice(index - 1, 1, d)
                })
        }

        dataStores.set(name, dataPoints);


        const nameDepth = "Create TreeDepth";
        const dataPointsDepth: any[] = new Array<any>();

        for (const e of entities) {

            const name = "Create " + e.name;
            const avgDataPoints: any[] = dataStores.get("avg treeDepth" + name);

            avgDataPoints.forEach((data, index) => {
                const d = dataPointsDepth.at(index - 1) ?? {
                   treeDepth: data.treeDepth
                };

                d[e.name] = data.avgExecutionTime;

                dataPointsDepth.splice(index - 1, 1, d)
            })
        }

        dataStores.set(nameDepth, dataPointsDepth);

        writeDataSetToFile();


})();
});
