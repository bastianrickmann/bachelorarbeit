import Benchmark from "../benchmark";
import {
    buildTree,
    compareMeasurements,
    forEachImplementation,
    getGroupedMeasurements,
} from "../helpers";
import Settings from "../settings";
import Measurement, {MeasurementType, MeasurementUnit} from "../types";

const GetDescendantBenchmark = new Benchmark("DESCENDANTS");


GetDescendantBenchmark.setPreRunFunction(async (repository) => {
    await buildTree(repository, Settings.ROOT_NODE_COUNT, Settings.BRANCH_NODE_COUNT, Settings.TREE_DEPTH);
});

GetDescendantBenchmark.setTestFunction(async (executionInformation) => {

    const startTime = Date.now();
    const foundNodes = await executionInformation.referenceRepository.findDescendant({id: executionInformation.referenceInformation.nodeID});
    const endTime = Date.now();

    const measuredTime = endTime - startTime;

    const m: Measurement = {
        reference: executionInformation.reference,
        referenceInformation: {
            round: executionInformation.referenceInformation.round,
            treeDepth: executionInformation.referenceInformation.treeDepth,
            nodeID: executionInformation.referenceInformation.nodeID
        },
        label: MeasurementType.EXECUTION_TIME,
        value: measuredTime,
        unit: MeasurementUnit.MS
    }
    return m;
});



GetDescendantBenchmark.setPostProcessingFunction((benchmarkName) => {


    forEachImplementation((e) => {

        getGroupedMeasurements(benchmarkName, e, p => p.referenceInformation.nodeID, MeasurementType.EXECUTION_TIME)
        getGroupedMeasurements(benchmarkName, e, p => p.referenceInformation.treeDepth, MeasurementType.EXECUTION_TIME)

    });

    compareMeasurements(benchmarkName, "avg" , p => p.referenceInformation.nodeID, MeasurementType.EXECUTION_TIME);
    compareMeasurements(benchmarkName, "avg", p => p.referenceInformation.treeDepth,  MeasurementType.EXECUTION_TIME);


});








export default GetDescendantBenchmark;