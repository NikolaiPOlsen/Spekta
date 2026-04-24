// Type for returned weights
export type UserParameterWeight = {
    parameter_type: string;
    parameter_value: string;
    weight: number;
    interaction_count: number;
};

export interface getAPIRequestProperties {
    userId: string;
    addRandomness?: boolean;
};

export interface UsesUserId {
    userId: string;
};