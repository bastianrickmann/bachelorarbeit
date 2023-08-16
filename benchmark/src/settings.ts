
// Benchmark settings

export const ROOT_NODE_COUNT: number = 1;
export const TREE_DEPTH: number = 5;
export const BRANCH_NODE_COUNT: number = 2;

export const EXPECTED_NODE_COUNT: number = (ROOT_NODE_COUNT * (BRANCH_NODE_COUNT > 1 ? (Math.pow(BRANCH_NODE_COUNT, TREE_DEPTH) - 1) / (BRANCH_NODE_COUNT - 1) : BRANCH_NODE_COUNT * TREE_DEPTH));
export const ROUNDS: number = 2;



export default {
    ROOT_NODE_COUNT: ROOT_NODE_COUNT,
    TREE_DEPTH: TREE_DEPTH,
    BRANCH_NODE_COUNT: BRANCH_NODE_COUNT,
    EXPECTED_NODE_COUNT: EXPECTED_NODE_COUNT,
    ROUNDS: ROUNDS
};