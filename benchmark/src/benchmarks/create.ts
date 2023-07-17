import Benchmark from "../benchmark";
import {TreeRepository} from "typeorm";
import {faker} from "@faker-js/faker/locale/de";
import {
    AVGMeasurementPoint,
    dataStores,
    forEachImplementation,
    getAvgExecutionTime,
    MeasurementPoint
} from "../helpers";
import _ from "lodash";

const CreateBenchmark = new Benchmark("CREATE");

CreateBenchmark.setTestFunction(async (parentNode, repository: TreeRepository<any>) => {
    const newRootNode = repository.create({
        name: faker.string.alphanumeric({length: 20}),
        parent: parentNode
    });

    const startTime = Date.now();
    const enteredNode = await repository.save(newRootNode);
    const endTime = Date.now();

    const measuredTime = endTime - startTime;

    return {
        newReferenceNode: enteredNode,
        measurements: {
            time: startTime,
            executionTime: measuredTime,
        },
        informations: {
            nodeId: enteredNode.id
        }
    };
});



CreateBenchmark.setPostProcessingFunction((benchmarkName, ) => {


    forEachImplementation((e) => {


        // avg base on NodeID

        const name = benchmarkName + e.name;
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

        const nameDepth = benchmarkName + e.name;
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
    });



    type cad = {
        nodeId: number;
        treeDepth: number;
        [key:string]: number;
    }

    const name = benchmarkName;
    const dataPoints: cad[] = new Array<cad>();

    forEachImplementation((e) => {

        const name = benchmarkName + e.name;
        const avgDataPoints: AVGMeasurementPoint[] = dataStores.get("avg " + name);

        avgDataPoints.forEach((data, index) => {
            const d = dataPoints.at(index - 1) ?? {
                nodeId: data.nodeId, treeDepth: data.treeDepth
            };

            d[e.name] = data.avgExecutionTime;

            dataPoints.splice(index - 1, 1, d)
        })
    })

    dataStores.set(name, dataPoints);


    const nameDepth = benchmarkName + " TreeDepth";
    const dataPointsDepth: any[] = new Array<any>();

    forEachImplementation((e) => {

        const name = benchmarkName + e.name;
        const avgDataPoints: any[] = dataStores.get("avg treeDepth" + name);

        avgDataPoints.forEach((data, index) => {
            const d = dataPointsDepth.at(index - 1) ?? {
                treeDepth: data.treeDepth
            };

            d[e.name] = data.avgExecutionTime;

            dataPointsDepth.splice(index - 1, 1, d)
        })
    });

    dataStores.set(nameDepth, dataPointsDepth);







});





export default CreateBenchmark;