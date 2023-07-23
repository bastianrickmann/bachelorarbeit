import Benchmark from "../benchmark";
import {faker} from "@faker-js/faker/locale/de";
import {
    AVGMeasurementPoint,
    dataStores,
    forEachImplementation,
    getGroupedMeasurements,
    getMeasurementValue,
    getStorageName
} from "../helpers";
import _ from "lodash";
import Measurement, {MeasurementType, MeasurementUnit} from "../types";

const CreateBenchmark = new Benchmark("CREATE");

CreateBenchmark.setTestFunction(async (executionInformation) => {
    const newRootNode = executionInformation.referenceRepository.create({
        name: faker.string.alphanumeric({length: 20}),
        parent: executionInformation.reference
    });

    const startTime = Date.now();
    const enteredNode = await executionInformation.referenceRepository.save(newRootNode);
    const endTime = Date.now();

    const measuredTime = endTime - startTime;

    const m: Measurement = {
        reference: enteredNode,
        referenceInformation: {
            round: executionInformation.referenceInformation.round,
            treeDepth: executionInformation.referenceInformation.treeDepth,
            nodeID: enteredNode.id
        },
        label: MeasurementType.EXECUTION_TIME,
        value: measuredTime,
        unit: MeasurementUnit.MS
    }
    return m;
});



CreateBenchmark.setPostProcessingFunction((benchmarkName) => {


    forEachImplementation((e) => {

        getGroupedMeasurements(benchmarkName, e, p => p.referenceInformation.nodeID, MeasurementType.EXECUTION_TIME)
        getGroupedMeasurements(benchmarkName, e, p => p.referenceInformation.treeDepth, MeasurementType.EXECUTION_TIME)

        /*
        // avg base on NodeID

        const dataPoints: Measurement[] = dataStores.get(getStorageName(benchmarkName, e.name));

        dataStores.set(getStorageName(benchmarkName, e.name, "avg"), new Array<Measurement>());

        const avgDataPoints: Measurement[] = dataStores.get(getStorageName(benchmarkName, e.name, "avg"));

        const groupedData = _.values(_.groupBy(dataPoints, (p: Measurement) => p.referenceInformation.nodeID));

        avgDataPoints.push(...groupedData.map((d: Measurement[]): Measurement => {
                const executionTimes: number[] = d.map(v => getMeasurementValue(v, MeasurementType.EXECUTION_TIME));

                return {
                    value: executionTimes.reduce(
                            (accumulator,
                             currentValue,
                             currentIndex,
                             array
                            ) => accumulator + currentValue / array.length
                            , 0),
                    unit: "ms",
                    label: "avg execution Time",
                    partialMeasurements: [
                        ...d.map((m): SingleMeasurement => ({
                            label: "executionTime",
                            value: getMeasurementValue(m, MeasurementType.EXECUTION_TIME),
                            reference: m.reference,
                            referenceInformation: {
                                round: m.referenceInformation.round
                            },
                            unit: "ms"
                        }))
                    ],
                    referenceInformation: {
                        treeDepth: d[0].referenceInformation.treeDepth,
                        nodeID: d[0].referenceInformation.nodeID
                    }
                };
            }
        ))*/

        /*
        // avg Base on treeDepth

        const nameDepth = getStorageName(benchmarkName, e.name);
        const dataPointsDepth: Measurement[] = dataStores.get(nameDepth);

        dataStores.set(getStorageName(benchmarkName, e.name, "avg", "treeDepth"), new Array<any>());

        const avgDataPointsDepth: any[] = dataStores.get(getStorageName(benchmarkName, e.name, "avg", "treeDepth"));

        const groupedDataDepth = _.values(_.groupBy(dataPointsDepth, (p) => p.referenceInformation.treeDepth));

        avgDataPointsDepth.push(...groupedDataDepth.map((d): any => {
                const executionTimes: number[] = d.map(v => getMeasurementValue(v, MeasurementType.EXECUTION_TIME));

                return ({
                    treeDepth: d[0].treeDepth,
                    executionTime: executionTimes,
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
        */
    });

    /*

    type cad = {
        nodeId: number;
        treeDepth: number;
        [key:string]: number;
    }

    const name = benchmarkName;
    const dataPoints: cad[] = new Array<cad>();

    forEachImplementation((e) => {

        const name = getStorageName(benchmarkName, e.name);
        const avgDataPoints: AVGMeasurementPoint[] = dataStores.get(getStorageName(benchmarkName, e.name, "avg"));

        avgDataPoints.forEach((data, index) => {
            const d = dataPoints.at(index - 1) ?? {
                nodeId: data.nodeId, treeDepth: data.treeDepth
            };

            d[e.name] = data.avgExecutionTime;

            dataPoints.splice(index - 1, 1, d)
        })
    })

    dataStores.set(name, dataPoints);


    const nameDepth = getStorageName(benchmarkName, "",  "treeDepth")
    const dataPointsDepth: any[] = new Array<any>();

    forEachImplementation((e) => {

        const name = benchmarkName + e.name;
        const avgDataPoints: any[] = dataStores.get(getStorageName(benchmarkName, e.name, "avg", "treeDepth"));

        avgDataPoints.forEach((data, index) => {
            const d = dataPointsDepth.at(index - 1) ?? {
                treeDepth: data.treeDepth
            };

            d[e.name] = data.avgExecutionTime;

            dataPointsDepth.splice(index - 1, 1, d)
        })
    });

    dataStores.set(nameDepth, dataPointsDepth);




    */


});





export default CreateBenchmark;