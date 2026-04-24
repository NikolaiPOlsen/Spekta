import { getAPIRequestProperties } from "../_shared/properties";

const getAPIRequestWithParameters = async ({ userId, addRandomness }: getAPIRequestProperties) => {
    const useRandom = addRandomness ? true : false;
    const parameters

    const resultParams = [];

    const parameterAmount = parameters.length;
    
    parameters.forEach(parameter => {
        if (!useRandom) {
            const sortedWeights = parameter.sort((a, b) => b.weight - a.weight);
            // const reverseSortedWeights = [...sortedWeights].reverse();



        }
    });

}

export default getAPIRequestWithParameters;