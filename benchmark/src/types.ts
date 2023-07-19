
export type Measurement = (CombinedMeasurement | SingleMeasurement) & Reference;


export type CombinedMeasurement = {
    label: string;
    partialMeasurements: Array<SingleMeasurement>;
};

export type SingleMeasurement = {
    label: string;
    value: number;
    unit?: string;
};


export type Reference = {
    reference: any;
    referenceInformation: {
        [key: string]: any
    }
};

export default Measurement;