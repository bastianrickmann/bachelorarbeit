import Benchmark from "../benchmark";
import {TreeRepository} from "typeorm";
import {faker} from "@faker-js/faker/locale/de";
import {dataStores, getAvgExecutionTime} from "../helpers";

const CreateBenchmark = new Benchmark("CREATE");

CreateBenchmark.setTestFunction(async (parentNode, depth: number, repository: TreeRepository<any>) => {
    const newRootNode = repository.create({
        name: faker.string.alphanumeric({length: 20}),
        parent: parentNode
    });

    const startTime = Date.now();
    const enteredNode = await repository.save(newRootNode);
    const endTime = Date.now();

    dataStores.get("Create " + e.name).push({
        round: ti + 1,
        nodeId: enteredNode.id,
        time: startTime,
        executionTime: endTime - startTime,
        treeDepth: depth
    });

    bar.update(enteredNode.id, {curAvgTime: getAvgExecutionTime(dataStores.get("Create " + e.name))});
    return enteredNode;
});
CreateBenchmark.setPostProcessingFunction(() => {});





export default CreateBenchmark;