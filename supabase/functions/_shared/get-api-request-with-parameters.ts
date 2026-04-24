import getUserWeights from "../_shared/get-weights-from-db.ts";
import { getAPIRequestProperties, UserParameterWeight, APIRequestTypeParameter } from "../_shared/properties.ts";
import { APIRequestParameterAmount } from "../_shared/constants.js";

const getAPIRequestWithParameters = async ({ supabaseClientInstance, userId, addRandomness }: getAPIRequestProperties) => {
    const withRandomness = addRandomness ? true : false;

    const parameters: UserParameterWeight[][] = await getUserWeights(supabaseClientInstance, userId);
    // const parameterAmount = parameters.length;
    const resultParams: APIRequestTypeParameter[] = [];

    parameters.forEach(parameterWeights => {
        if (withRandomness) {
            // loop through and add randomness to weights
        }

        const parameterWeightsLength = parameterWeights.length;
        const sortedWeights = parameterWeights.sort((a, b) => b.weight - a.weight);
        // const reverseSortedWeights = [...sortedWeights].reverse();
        const topParameterWeights = sortedWeights.slice(0, APIRequestParameterAmount);

        // Build data structure of parameters that will be specified in API request
        const paramType = parameterWeights[0].parameter_type;
        const resultParametersPositive: APIRequestTypeParameter = {
            positive: true, // for top 5 (positive weight)
            with_type: paramType,
            parameters: []
        };

        topParameterWeights.forEach(parameterWeight => {
            // const paramType = parameterWeight.parameter_type;
            const paramValue = parameterWeight.parameter_value;
            resultParametersPositive.parameters.push(paramValue);
        });

        resultParams.push(resultParametersPositive);

        // Otherwise top and bottom would overlap, compare to APIRequestParameterAmount multiplied by almost 2
        if (parameterWeightsLength > Math.ceil(APIRequestParameterAmount * 1.75)) {
            const resultParametersNegative: APIRequestTypeParameter = {
                positive: true, // for top 5 (positive weight)
                with_type: paramType,
                parameters: []
            };

            // Indexes of bottom 5 (last element)
            const bottomParametersWeights = sortedWeights.slice(parameterWeightsLength - APIRequestParameterAmount, parameterWeightsLength - 1);

            // Fill with negative weights (meaning without in API)
            bottomParametersWeights.forEach(parameterWeight => {
                // const paramType = parameterWeight.parameter_type;
                const paramValue = parameterWeight.parameter_value;
                resultParametersNegative.parameters.push(paramValue);
            });

            resultParams.push(resultParametersNegative);
        }
    });
}

export default getAPIRequestWithParameters;