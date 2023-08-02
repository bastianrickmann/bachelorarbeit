import Benchmark from "../benchmark";
import {faker} from "@faker-js/faker/locale/de";
import {
    AVGMeasurementPoint,
    dataStores,
    forEachImplementation,
    getGroupedMeasurements,
    getMeasurementValue,
    getStorageName,
    compareMeasurements
} from "../helpers";
import _ from "lodash";
import Measurement, {MeasurementComparison, MeasurementKeyWords, MeasurementType, MeasurementUnit} from "../types";

const CreateBenchmark = new Benchmark("CREATE");

CreateBenchmark.setTestFunction(async (executionInformation) => {
    let newRootNode;
    if(executionInformation.reference) {

        newRootNode = executionInformation.referenceRepository.create({
            name: faker.string.alphanumeric({length: 20}),
            parent: executionInformation.reference
        });
    } else {
        newRootNode = executionInformation.referenceRepository.create({
            name: faker.string.alphanumeric({length: 20}),
            parent: undefined
        });
    }

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

    });

    compareMeasurements(benchmarkName, "avg" , p => p.referenceInformation.nodeID, MeasurementType.EXECUTION_TIME);
    compareMeasurements(benchmarkName, "avg", p => p.referenceInformation.treeDepth,  MeasurementType.EXECUTION_TIME);


});





export default CreateBenchmark;