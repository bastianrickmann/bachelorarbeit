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

        for(let ti = 1; ti <= Settings.ROUNDS; ti++) {

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

                await runTestForEachTreeNode(ti, this.BenchmarkName + e.name, this.testFunction, AppDataSource.getTreeRepository(e), Settings.ROOT_NODE_COUNT, Settings.BRANCH_NODE_COUNT, Settings.TREE_DEPTH, bar);
            });

            await allRunsCompleted(multibar);

            await AppDataSource.destroy();
        }

    }

}