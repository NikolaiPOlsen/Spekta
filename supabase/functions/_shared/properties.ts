import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Type for returned weights
export type UserParameterWeight = {
    parameter_type: string;
    parameter_value: string;
    weight: number;
    interaction_count: number;
};

export interface getAPIRequestProperties {
    supabaseClientInstance: SupabaseClient
    userId: string;
    addRandomness?: boolean;
};

// export interface APIRequestParameter {
//     value: string;
// };

export interface APIRequestTypeParameter {
    positive: boolean;
    with_type: string;
    parameters: string[];
};

// export interface UsesUserId {
//     userId: string;
// };