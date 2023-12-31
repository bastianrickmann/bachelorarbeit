import figlet from "figlet";
import chalk from "chalk";
import CreateBenchmark from "./benchmarks/create";
import { buildDB } from "./db/database"
import "reflect-metadata";
import GetAncestorsBenchmark from "./benchmarks/findAnc";
import GetDescendantBenchmark from "./benchmarks/findDests";



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

    const Benchmark3 = GetDescendantBenchmark;

    await Benchmark3.run();

    /*** Benchmark run ***/
})();
});
