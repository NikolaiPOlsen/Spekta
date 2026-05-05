import { APIRequestParameterAmount } from "../_shared/constants.ts";
import { ApiRequestTypeParameter, GetParametersFromWeightsFunctionParameters, UserParameterWeight } from "../_shared/properties.ts";

const getDiscoverApiRequestUrlParametersFromWeights = ({ userParameterWeights, randomWeightOffset = false, randomizeURLParameters = false }: GetParametersFromWeightsFunctionParameters) => {
    const useRandomWeightOffset = randomWeightOffset ? true : false;

    // TODO: implement positiveLimit instead of top 5

    const resultParams: ApiRequestTypeParameter[] = [];

    userParameterWeights.forEach(parameterWeights => {
        if (!parameterWeights || parameterWeights.length < 1) {
            return;
        }


        if (useRandomWeightOffset) {
            // loop through and add randomness to weights
            parameterWeights.forEach(parameterWeight => {
                if (Math.random() < 0.5) {
                    const addition = Math.random() * 0.5 - 0.25; // Math.abs(parameterWeight.weight) * Math.random() * 3 - 1.5;
                    parameterWeight.weight += addition;
                }
            });
        }

        // const parameterWeightsLength = parameterWeights.length;
        // const sortedWeights = parameterWeights.sort((a, b) => b.weight - a.weight);

        // const weights: number[] = [];

        // sortedWeights.forEach(weightobj => {
        //     weights.push(weightobj.weight);
        // });

        // console.log(`sorted weights: ${weights}`);

        const positiveLimit = 0.25 + Math.random() * 0.5;
        const negativeLimit = -0.4 - Math.random() * 0.5

        // Build data structure of parameters that will be specified in API request
        const paramType = parameterWeights[0].parameter_type;
        // console.log(`using parameter type: ${paramType}`);
        const resultParametersPositive: ApiRequestTypeParameter = {
            positive: true, // for top 5 (positive weight)
            type: paramType,
            parameters: []
        };

        const resultParametersNegative: ApiRequestTypeParameter = {
            positive: false, // for bottom 5 (negative weight)
            type: paramType,
            parameters: []
        };

        parameterWeights.forEach((parameterWeight: UserParameterWeight) => {
            const weight: number = parameterWeight.weight;
            const parameterValue = parameterWeight.parameter_value;

            if (weight > positiveLimit) {
                resultParametersPositive.parameters.push(parameterValue);
                // console.log(`positive weight: ${weight}`);
            } else if (weight < negativeLimit) {
                resultParametersNegative.parameters.push(parameterValue);
                // console.log(`negative weight: ${weight}`);
            }
        });

        // limit amount of without_genres, otherwise too restrictive
        if (resultParametersNegative.parameters.length > APIRequestParameterAmount * 1.5 && paramType != "keywords") {
            const sortedNegativeParameters = parameterWeights.sort((a, b) => b.weight - a.weight).reverse();
            resultParametersNegative.parameters = sortedNegativeParameters.slice(0, APIRequestParameterAmount).map(obj => obj.parameter_value);
        }

        resultParams.push(resultParametersPositive);
        resultParams.push(resultParametersNegative);

        // const reverseSortedWeights = [...sortedWeights].reverse();
        // const topParameterWeights = sortedWeights.slice(0, APIRequestParameterAmount);

        // console.log("top weights");

        // console.log(parameterWeights);





        // console.log(`currently looping for weight type: ${paramType}`);

        // topParameterWeights.forEach(parameterWeight => {
        //     // const paramType = parameterWeight.parameter_type;
        //     const paramValue = parameterWeight.parameter_value;
        //     resultParametersPositive.parameters.push(paramValue);
        //     // console.log(parameterWeight.weight);
        // });

        // console.log("top weight");

        // resultParams.push(resultParametersPositive);

        // // Otherwise top and bottom would overlap, compare to APIRequestParameterAmount multiplied by almost 2
        // if (parameterWeightsLength > Math.ceil(APIRequestParameterAmount * 1.75)) {
        //     const resultParametersNegative: ApiRequestTypeParameter = {
        //         positive: false, // for bottom 5 (negative weight)
        //         type: paramType,
        //         parameters: []
        //     };

        //     // Bottom 5 weights (last elements)
        //     const bottomParametersWeights = sortedWeights.slice(parameterWeightsLength - APIRequestParameterAmount, parameterWeightsLength - 1);

        //     // Fill with negative weights (meaning without in API)
        //     bottomParametersWeights.forEach(parameterWeight => {
        //         // const paramType = parameterWeight.parameter_type;
        //         const paramValue = parameterWeight.parameter_value;
        //         resultParametersNegative.parameters.push(paramValue);
        //         // console.log(parameterWeight.weight);
        //     });
        //     // console.log("top weight");

        //     resultParams.push(resultParametersNegative);
        // }
    });

    return resultParams;
}

export default getDiscoverApiRequestUrlParametersFromWeights;