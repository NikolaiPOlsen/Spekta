import { APIRequestParameterAmount } from "../_shared/constants.js";
import { ApiRequestTypeParameter, GetParametersFromWeightsParameters, UserParameterWeight } from "../_shared/properties.js";

const getDiscoverApiRequestUrlParametersFromWeights = ({ userParameterWeights, randomWeightOffset = false, randomizeURLParameters = false }: GetParametersFromWeightsParameters) => {
    const useRandomWeightOffset = randomWeightOffset ? true : false;
    const useRandomURLParameters = randomizeURLParameters ? true : false;

    // console.log("Before getUserWeights");
    // const parameters: UserParameterWeight[][] = await getUserWeights(supabaseClientInstance, userId);
    // console.log("After getUserWeights");

    // const parameterAmount = parameters.length;
    const resultParams: ApiRequestTypeParameter[] = [];

    userParameterWeights.forEach(parameterWeights => {
        if (!parameterWeights || parameterWeights.length < 1) {
            return;
        }

        if (useRandomWeightOffset) {
            // loop through and add randomness to weights
            parameterWeights.forEach(parameterWeight => {
                if (Math.random() < 0.5) {
                    const addition = Math.random() * 2 - 1; // Math.abs(parameterWeight.weight) * Math.random() * 3 - 1.5;
                    parameterWeight.weight += addition;
                } 
            });
        }

        const parameterWeightsLength = parameterWeights.length;
        const sortedWeights = parameterWeights.sort((a, b) => b.weight - a.weight);

        const weights: number[] = [];

        sortedWeights.forEach(weightobj => {
            weights.push(weightobj.weight);
        });

        console.log(`sorted weights: ${weights}`);

        const positiveLimit = Math.random() * 0.2 + 0.4;

        // const reverseSortedWeights = [...sortedWeights].reverse();
        const topParameterWeights = sortedWeights.slice(0, APIRequestParameterAmount);

        // console.log("top weights");

        // console.log(parameterWeights);

        // Build data structure of parameters that will be specified in API request
        const paramType = parameterWeights[0].parameter_type;
        const resultParametersPositive: ApiRequestTypeParameter = {
            positive: true, // for top 5 (positive weight)
            type: paramType,
            parameters: []
        };
        
        console.log(`currently looping for weight type: ${paramType}`);
        
        topParameterWeights.forEach(parameterWeight => {
            // const paramType = parameterWeight.parameter_type;
            const paramValue = parameterWeight.parameter_value;
            resultParametersPositive.parameters.push(paramValue);
            // console.log(parameterWeight.weight);
        });
        
        // console.log("top weight");
        
        resultParams.push(resultParametersPositive);
        
        // Otherwise top and bottom would overlap, compare to APIRequestParameterAmount multiplied by almost 2
        if (parameterWeightsLength > Math.ceil(APIRequestParameterAmount * 1.75)) {
            const resultParametersNegative: ApiRequestTypeParameter = {
                positive: false, // for bottom 5 (negative weight)
                type: paramType,
                parameters: []
            };
            
            // Bottom 5 weights (last elements)
            const bottomParametersWeights = sortedWeights.slice(parameterWeightsLength - APIRequestParameterAmount, parameterWeightsLength - 1);

            // Fill with negative weights (meaning without in API)
            bottomParametersWeights.forEach(parameterWeight => {
                // const paramType = parameterWeight.parameter_type;
                const paramValue = parameterWeight.parameter_value;
                resultParametersNegative.parameters.push(paramValue);
                // console.log(parameterWeight.weight);
            });
            // console.log("top weight");
            
            resultParams.push(resultParametersNegative);
        }
    });

    return resultParams;

    // const userPreferences = await getUserSettingsFromDb(supabaseClientInstance, userId);
    // const preferredLanguage = userPreferences.preferred_language;

    let buildAPIRequestURLOptions: BuildAPIRequestURLSpecification = {
        tmdbData: tmdbData,
        parameters: resultParams,
        includeAdult: userPreferences.include_adult,
        randomPage: true,
        randomSorting: true
    };

    if (!buildAPIRequestURLOptions.parameters || buildAPIRequestURLOptions.parameters.length < 1) {
        buildAPIRequestURLOptions.randomPage = false;
        buildAPIRequestURLOptions.randomSorting = false;
    }

    if (preferredLanguage != null) {
        buildAPIRequestURLOptions.languagePreference = preferredLanguage;
    }

    if (useRandomURLParameters) {
        const userGenres: string[] = [];
        const userCast: string[] = [];

        resultParams.forEach(paramType => {
            if (paramType.type == ParameterTypeName.Genre && paramType.positive) {
                for (let i = 0; i < paramType.parameters.length; i++) {
                    userGenres.push(paramType.parameters[i]);
                }
            }

            if (paramType.type == ParameterTypeName.Actor && paramType.positive) {
                for (let i = 0; i < paramType.parameters.length; i++) {
                    userCast.push(paramType.parameters[i]);
                }
            }
        });

        // buildAPIRequestURLOptions.randomPage = true;
        // buildAPIRequestURLOptions.randomSorting = true;
        // buildAPIRequestURLOptions.randomWithGenres = true;
        // buildAPIRequestURLOptions.randomWithCast = true;
        // buildAPIRequestURLOptions.randomWithoutGenres = true;
        // buildAPIRequestURLOptions.randomWithoutCast = true;
        // buildAPIRequestURLOptions.userGenres = userCast,
        // buildAPIRequestURLOptions.userCast = userCast
    }
}

export default getDiscoverApiRequestUrlParametersFromWeights;