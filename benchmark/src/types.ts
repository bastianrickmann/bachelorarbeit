import {Repository} from "typeorm";

export type Measurement = (SingleMeasurement | CombinedMeasurement | (SingleMeasurement & CombinedMeasurement));
export enum MeasurementType {
    EXECUTION_TIME = "executionTime",
    QUERY_TIME = "queryTime",
    QUERY_BUILD_TIME = "queryBuildTime",
    RESPONSE_BUILD_TIME = "responseBuildTime"
}

export enum MeasurementUnit {
    MS = "ms",
}

export type CombinedMeasurement = {
    label: MeasurementType | string;
    partialMeasurements: Array<SingleMeasurement>;
} & Reference;

export type SingleMeasurement = {
    label: MeasurementType | string;
    value: number;
    unit?: string;
} & Reference;


export type Reference = {
    reference?: any;
    referenceRepository?: Repository<any>;
    referenceInformation?: {
        [key: string]: any;
    } & TreePosition;
};

export type TreePosition = {
    nodeID?: number;
    treeDepth?: number;
}

export default Measurement;