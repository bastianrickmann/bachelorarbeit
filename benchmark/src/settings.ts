
// Benchmark settings

export const ROOT_NODE_COUNT: number = 1;
export const TREE_DEPTH: number = 3;
export const BRANCH_NODE_COUNT: number = 1;

export const EXPECTED_NODE_COUNT: number = (ROOT_NODE_COUNT * (BRANCH_NODE_COUNT > 1 ? (Math.pow(BRANCH_NODE_COUNT, TREE_DEPTH) - 1) / (BRANCH_NODE_COUNT - 1) : BRANCH_NODE_COUNT * TREE_DEPTH));
export const ROUNDS: number = 2;