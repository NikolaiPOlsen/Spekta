import { APIRequestParameterAmount } from "../_shared/constants.ts";
import { ParameterTypeName } from "../_shared/parameter-type-names.ts";
import { ApiRequestTypeParameter, GetParametersFromWeightsFunctionParameters } from "../_shared/properties.ts";

const getDiscoverApiRequestUrlParametersFromWeights = ({ userParameterWeights, randomWeightOffset = false, randomizeURLParameters = false }: GetParametersFromWeightsFunctionParameters) => {
	const useRandomWeightOffset = randomWeightOffset ? true : false;
	const useRandomURLParameters = randomizeURLParameters ? true : false;

	// TODO: fix without_genres and without_keywords not showing up
	// sometimes works, sometimes doesnt.

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
				// ~25% chance to add +0.25 or -0.25 to weights to sometimes show user new things
				if (Math.random() < 0.75) {
					const addition = Math.random() * 0.5 - 0.25;
					parameterWeight.weight += addition;
				}
			});
		}

		const paramType = parameterWeights[0].parameter_type;
		const isCurrentlyKeyword = paramType == ParameterTypeName.Keyword;
		const isCurrentlyGenre = paramType == ParameterTypeName.Genre;
		const parameterWeightsLength = parameterWeights.length;
		const relevantKeywordWeightBoundary = Math.random() * 0.2 + 0.75;
		const sortedWeights = parameterWeights.sort((a, b) => b.weight - a.weight);

		console.log(`currently looping for weight type: ${paramType}`);

		// Build data structure of parameters that will be specified in API request
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

		if (isCurrentlyKeyword) {
			const withKeyword = sortedWeights[0];
			const withoutKeyword = sortedWeights[parameterWeightsLength - 1];

			// console.log(`withkeyword: ${withKeyword.parameter_value}`);
			// console.log(`withoutkeyword: ${withoutKeyword.parameter_value}`);

			// For keywords: only use most liked and most disliked keyword
			// only include with_keywords if its very high rated, because including with_keyword for obscure keywords causes issues with few results
			if (withKeyword.weight > relevantKeywordWeightBoundary) {
				resultParametersPositive.parameters.push(withKeyword.parameter_value);
				resultParams.push(resultParametersPositive);
			}

			// always include without_keywords, because excluding one keyword is fine
			resultParametersNegative.parameters.push(withoutKeyword.parameter_value);
			resultParams.push(resultParametersNegative);

			return;
		}


		const weights: number[] = [];

		sortedWeights.forEach(weightobj => {
			weights.push(weightobj.weight);
		});

		const topParameterWeights = sortedWeights.slice(0, APIRequestParameterAmount);

		topParameterWeights.forEach(parameterWeight => {
			const paramValue = parameterWeight.parameter_value;
			resultParametersPositive.parameters.push(paramValue);
		});

		resultParams.push(resultParametersPositive);

		// Otherwise top and bottom would overlap, compare to APIRequestParameterAmount multiplied by 2 (both top and bottom)
		if (parameterWeightsLength > Math.ceil(APIRequestParameterAmount * 2)) {

			// Bottom 5 weights (last elements)
			const bottomParametersWeights = sortedWeights.slice(parameterWeightsLength - APIRequestParameterAmount - 1, parameterWeightsLength - 1);

			// Fill with negative weights (meaning without in API)
			bottomParametersWeights.forEach(parameterWeight => {
				if (isCurrentlyGenre && Math.random() < 0.8) {
					const paramValue = parameterWeight.parameter_value;
					resultParametersNegative.parameters.push(paramValue);
				} else if (!isCurrentlyGenre) {
					const paramValue = parameterWeight.parameter_value;
					resultParametersNegative.parameters.push(paramValue);
				}
			});

			resultParams.push(resultParametersNegative);
		}
	});

	return resultParams;
}

export default getDiscoverApiRequestUrlParametersFromWeights;