import {
    allRunsCompleted,
    dataStores,
    forEachImplementation,
    getAvgExecutionTime,
    runTestForEachTreeNode,
    TestFunction, writeDataSetToFile
} from "./helpers";
import Settings from "./settings"
import {AppDataSource} from "./data-source";
import {TreeRepository} from "typeorm";
import {faker} from "@faker-js/faker/locale/de";
import chalk from "chalk";
import cliProgress from "cli-progress";

export default class Benchmark {

    private BenchmarkName: string;

    private testFunction: TestFunction;

    private postProcessing: (...args: any[]) => any;

    constructor(name: string) {
        this.BenchmarkName = name;
    }

    public setTestFunction(fn: TestFunction) {
       this.testFunction = fn;
    }

    public setPostProcessingFunction(fn: (...args: any[]) => any) {
        this.postProcessing = fn;
    }




    public async run() {



        await this.benchmark();

        await this.postProcessing();


        writeDataSetToFile();

    }


    public async benchmark () {



        /*** Benchmark run ***/

        for(let ti = 0; ti < Settings.ROUNDS; ti++) {

            console.log(chalk.greenBright.underline.italic.bold(`${this.BenchmarkName} BENCHMARKRUN #${ti + 1}`));

            await AppDataSource.initialize();

            if (!AppDataSource.isInitialized) {
                console.info(chalk.red.bold("DataSource did not connect with Database!"));
                return;
            }

            await AppDataSource.synchronize(true);

            console.info(chalk.blackBright(" - DataSource synced"));



            const multibar = new cliProgress.MultiBar({
                clearOnComplete: false,
                hideCursor: true,
                format: ' {bar} | {testname} | current Avg. Time: {curAvgTime} | {value}/{total}',
                stopOnComplete: true
            }, cliProgress.Presets.shades_grey);


            forEachImplementation(async (e) => {


                const bar = multibar.create(0,0);
                const createFunction: TestFunction = async (parentNode, depth: number, repository: TreeRepository<any>, testSpecificBar: cliProgress.SingleBar) => {
                    const newRootNode = repository.create({
                        name: faker.string.alphanumeric({length: 20}),
                        parent: parentNode
                    });

                    const startTime = Date.now();
                    const enteredNode = await repository.save(newRootNode);
                    const endTime = Date.now();

                    dataStores.get(this.BenchmarkName + e.name).push({
                        round: ti + 1,
                        nodeId: enteredNode.id,
                        time: startTime,
                        executionTime: endTime - startTime,
                        treeDepth: depth
                    });

                    testSpecificBar.update(enteredNode.id, {curAvgTime: getAvgExecutionTime(dataStores.get(this.BenchmarkName + e.name))});
                    return enteredNode;
                }

                await runTestForEachTreeNode(this.BenchmarkName + e.name, createFunction, AppDataSource.getTreeRepository(e), Settings.ROOT_NODE_COUNT, Settings.BRANCH_NODE_COUNT, Settings.TREE_DEPTH, bar);
            });

            await allRunsCompleted(multibar);

            await AppDataSource.destroy();
        }

    }

}