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
				if (Math.random() < 0.5) {
					const addition = Math.random() * 0.5 - 0.25;
					parameterWeight.weight += addition;
				}
			});
		}

		const paramType = parameterWeights[0].parameter_type;
		const parameterWeightsLength = parameterWeights.length;
		const sortedWeights = parameterWeights.sort((a, b) => b.weight - a.weight);
		let sliceEnd = APIRequestParameterAmount;
		let includePositiveKeyword = true;
		const relevantKeywordWeightBoundary = Math.random() * 0.25 + 0.6;
		// let useKeywords = true;

		const weights: number[] = [];

		sortedWeights.forEach(weightobj => {
			weights.push(weightobj.weight);
		});

		console.log(`sorted weights: ${weights}`);


		if (paramType == ParameterTypeName.Keyword) {
			sliceEnd = 1;
		}

		// const reverseSortedWeights = [...sortedWeights].reverse();
		const topParameterWeights = sortedWeights.slice(0, sliceEnd);

		// prevents random keywords from being included, because to reach +0.5 or +0.75 weight, it needs to have been seen a few times
		if (paramType == ParameterTypeName.Keyword && topParameterWeights[0].weight <= relevantKeywordWeightBoundary) {
			includePositiveKeyword = false;
		}

		// // Same idea for negative weights, something
		// if (paramType == ParameterTypeName.Keyword && topParameterWeights[parameterWeightsLength - 1].weight >= -1 * relevantKeywordWeightBoundary) {
		// 	return;
		// }

		// console.log("top weights");

		// console.log(parameterWeights);

		// Build data structure of parameters that will be specified in API request
		const resultParametersPositive: ApiRequestTypeParameter = {
			positive: true, // for top 5 (positive weight)
			type: paramType,
			parameters: []
		};

		console.log(`currently looping for weight type: ${paramType}`);

		if (includePositiveKeyword) { // this is true for all other parameter types
			topParameterWeights.forEach(parameterWeight => {
				const paramValue = parameterWeight.parameter_value;
				resultParametersPositive.parameters.push(paramValue);
			});
		}


		// console.log("top weight");

		resultParams.push(resultParametersPositive);

		// Otherwise top and bottom would overlap, compare to APIRequestParameterAmount multiplied by 2 (both top and bottom)
		if (parameterWeightsLength > Math.ceil(APIRequestParameterAmount * 2)) {
			const resultParametersNegative: ApiRequestTypeParameter = {
				positive: false, // for bottom 5 (negative weight)
				type: paramType,
				parameters: []
			};

			// Bottom 5 weights (last elements)
			const bottomParametersWeights = sortedWeights.slice(parameterWeightsLength - sliceEnd - 1, parameterWeightsLength - 1);

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
}

export default getDiscoverApiRequestUrlParametersFromWeights;