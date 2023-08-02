import figlet from "figlet";
import chalk from "chalk";
import CreateBenchmark from "./benchmarks/create";
import "reflect-metadata";



figlet("Benchmark", (error, result) => {
    if (error) {
        return
    }
    console.log(chalk.yellow(result));
(async () => {


    const Benchmark1 = CreateBenchmark;

    await Benchmark1.run();


    //const Benchmark2 = GetAncestorsBenchmark;

    //await Benchmark2.run();

    /*** Benchmark run ***/
})();
});
