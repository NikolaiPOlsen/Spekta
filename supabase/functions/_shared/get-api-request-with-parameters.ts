import getUserWeights from "../_shared/get-weights-from-db.ts";
import { getAPIRequestProperties } from "../_shared/properties.ts";

const getAPIRequestWithParameters = async ({ userId, addRandomness }: getAPIRequestProperties) => {
    const useRandom = addRandomness ? true : false;
    const parameters = await getUserWeights(userId);
    // const parameterAmount = parameters.length;
    const resultParams = [];
    
    parameters.forEach(parameter => {
        if (useRandom) {
            // loop through and add randomness to weights
        }

        const sortedWeights = parameter.sort((a, b) => b.weight - a.weight);
        // const reverseSortedWeights = [...sortedWeights].reverse();

    });

}

export default getAPIRequestWithParameters;