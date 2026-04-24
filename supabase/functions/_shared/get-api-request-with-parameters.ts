import getUserWeights from "../_shared/get-weights-from-db.ts";
import { getAPIRequestProperties, UserParameterWeight } from "../_shared/properties.ts";

const getAPIRequestWithParameters = async ({ userId, addRandomness }: getAPIRequestProperties) => {
    const useRandom = addRandomness ? true : false;

    const parameters: UserParameterWeight[][] = await getUserWeights(userId);
    // const parameterAmount = parameters.length;
    const resultParams = [];
    
    parameters.forEach(parameter => {
        if (useRandom) {
            // loop through and add randomness to weights
        }

        const parameterWeightsLength = parameter.length;
        const sortedWeights = parameter.sort((a, b) => b.weight - a.weight);
        // const reverseSortedWeights = [...sortedWeights].reverse();
        const topFiveWeights = sortedWeights.slice(0, 5);
        const bottomFiveWeights = sortedWeights.slice(parameterWeightsLength - 5, parameterWeightsLength - 1); // Indexes of bottom 5 (last element)

        bottomFiveWeights.forEach(weight => {
            resultParams.push(weight.parameter_type);
        });
    });

    
}

export default getAPIRequestWithParameters;