import {
    allRunsCompleted,
    forEachImplementation,
    getStorageName, MeasurementFunction, RunFunction,
    runTestForEachTreeNode,
    TestFunction,
    writeDataSetToFile
} from "./helpers";
import Settings from "./settings"
import {AppDataSource} from "./data-source";
import chalk from "chalk";
import cliProgress from "cli-progress";

export default class Benchmark {

    protected BenchmarkName: string;

    private testFunction: MeasurementFunction;

    private postProcessing: (...args: any[]) => any;

    private preRunFunction: (...args: any[]) => any = () => {};

    constructor(name: string) {
        this.BenchmarkName = name;
    }

    public setTestFunction(fn: MeasurementFunction) {
       this.testFunction = fn;
    }

    public setPostProcessingFunction(fn: (benchmarkName: string) => void) {
        this.postProcessing = fn;
    }

    public setPreRunFunction(fn: (repository) => void) {
        this.preRunFunction = fn;
    }




    public async run() {



        await this.benchmark();

        await this.postProcessing(this.BenchmarkName);


        writeDataSetToFile();

    }


    public async benchmark () {



        /*** Benchmark run ***/

        for(let ti = 1; ti <= Settings.ROUNDS; ti++) {


            console.log(chalk.greenBright.underline.italic.bold(`${this.BenchmarkName} BENCHMARKRUN #${ti}`));

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
                format: ' {bar} | {testname} | current avg. time: {curAvgTime}ms | {value}/{total}',
                stopOnComplete: true
            }, cliProgress.Presets.shades_grey);


            forEachImplementation(async (e) => {

                await this.preRunFunction(AppDataSource.getTreeRepository(e));

                const bar = multibar.create(0,0);

                await runTestForEachTreeNode(ti, getStorageName(this.BenchmarkName, e.name), this.testFunction, AppDataSource.getTreeRepository(e), Settings.ROOT_NODE_COUNT, Settings.BRANCH_NODE_COUNT, Settings.TREE_DEPTH, bar);
            });

            await allRunsCompleted(multibar);

            await AppDataSource.destroy();
        }

    }

}