import {
    AppDataSource
} from "./data-source"
import figlet from "figlet";
import chalk from "chalk";
import {faker} from "@faker-js/faker/locale/de";
import cliProgress from "cli-progress";
import {TreeRepository} from "typeorm";
import _ from "lodash";
import {
    TestFunction,
    MeasurementPoint,
    runTestForEachTreeNode,
    allRunsCompleted,
    writeDataSetToFile,
    dataStores,
    AVGMeasurementPoint,
    getAvgExecutionTime, forEachImplementation
} from "./helpers";
import Settings from "./settings";
import CreateBenchmark from "./benchmarks/create";
import GetAncestorsBenchmark from "./benchmarks/find";



figlet("Benchmark", (error, result) => {
    if (error) {
        return
    }
    console.log(chalk.yellow(result));
(async () => {


    const Benchmark1 = CreateBenchmark;

    await Benchmark1.run();


    const Benchmark2 = GetAncestorsBenchmark;

    await Benchmark2.run();

    /*** Benchmark run ***/
})();
});
