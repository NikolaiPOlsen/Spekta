import { ParameterTypeName } from "../../_shared/parameter-type-names.ts";
import { ApiRequestTypeParameter, GetParametersFromWeightsFunctionParameters, UserParameterWeight } from "../../_shared/properties.ts";
import getDiscoverApiRequestUrlParametersFromWeights from "../get-discover-url-parameters.ts";
import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { APIRequestParameterAmount } from "../../_shared/constants.ts";

Deno.test("getDiscoverApiRequestUrlParametersFromWeights correctly finds and formats the parameters based on weights", () => {

	const parameterData = [
		{
			type: "release_date",
			values: ["1940-1949", "1950-1959", "1960-1969", "1970-1979", "1980-1989", "1990-1999", "2000-2009", "2010-2019", "2020-2029"]
		},
		{
			type: "runtime",
			values: ["0-29", "30-59", "60-89", "90-119", "120-149", "150-179", "180-209", "210-239"]
		},
		{
			type: "genre",
			values: ["65640", "47595", "59369", "87986", "39801", "64739", "97755", "74904", "68623", "34094", "21750", "33156", "72447", "61650", "66095"]
		},
		{
			type: "keyword",
			values: ["78257", "64774", "52337", "44279", "12951", "12620", "85893", "57132", "39273", "87166", "67438", "23903", "43003", "1775", "58202"]
		}
	];

	const userParameterWeights: UserParameterWeight[][] = [];

	// Simulate getWeightsFromDb function by generating fake weights data
	parameterData.forEach(parameterDataItem => {
		let weightCount = -1;
		const type = parameterDataItem.type;
		const values = parameterDataItem.values;

		const parameterWeights: UserParameterWeight[] = [];

		values.forEach(value => {
			const randomWeight = Math.random() * 2 - 1;

			const parameterWeight: UserParameterWeight = {
				parameter_type: type,
				parameter_value: value,
				weight: randomWeight,
				interaction_count: 0 // interaction_count was not used in calculations, although it should have been
			};

			parameterWeights.push(parameterWeight);

			weightCount += 0.01;
		});

		userParameterWeights.push(parameterWeights);
	});

	const expectedResult: ApiRequestTypeParameter[] = [];

	// find expected result
	userParameterWeights.forEach((parameterWeights: UserParameterWeight[]) => {
		const sliceAmount = APIRequestParameterAmount

		// .sort() is in-place and sorts the values in the existing array
		parameterWeights.sort((parameterA, parameterB) => parameterB.weight - parameterA.weight);
		const type = parameterWeights[0].parameter_type;

		const expectedResultParametersPositive: ApiRequestTypeParameter = {
			positive: true, // for top 5 (positive weight)
			type: type,
			parameters: []
		};

		const expectedResultParametersNegative: ApiRequestTypeParameter = {
			positive: false, // for bottom 5 (negative weight)
			type: type,
			parameters: []
		};

		const length = parameterWeights.length;
		const lastIndex = length - 1;

		if (type == ParameterTypeName.Keyword) {
			const bottomKeyword = parameterWeights[lastIndex].parameter_value;
			expectedResultParametersNegative.parameters.push(bottomKeyword);
			expectedResult.push(expectedResultParametersNegative);

		} else {
			const topParameters = parameterWeights.slice(0, sliceAmount).map(param => param.parameter_value);
			expectedResultParametersPositive.parameters.push(...topParameters);
			expectedResult.push(expectedResultParametersPositive);

			// console.log(`length: ${length} | type: ${type}`);
			if (length > Math.ceil(APIRequestParameterAmount * 2)) {
				const bottomParameters = parameterWeights.slice(lastIndex - sliceAmount, lastIndex).map(param => param.parameter_value);
				expectedResultParametersNegative.parameters.push(...bottomParameters);
				expectedResult.push(expectedResultParametersNegative);
			}
		}

		
	});

	// console.log(userParameterWeights);

	// options
	const getUrlParametersOptions: GetParametersFromWeightsFunctionParameters = {
		userParameterWeights: userParameterWeights,
		randomWeightOffset: false, // test simple case, no randomness
		randomizeURLParameters: false
	};

	console.log("BEFORE FUNCTION CALL");

	const discoverUrlParameters: ApiRequestTypeParameter[] = getDiscoverApiRequestUrlParametersFromWeights(getUrlParametersOptions);

	console.log("AFTER FUNCTION CALL");

	// discoverUrlParameters.forEach(urlParam => {
	// 	let paramString = "";
	// 	urlParam.parameters.forEach((parameter: string) => {
	// 		paramString += `${parameter}, `;
	// 	});

	// 	console.log(`type: ${urlParam.type} | positive: ${urlParam.positive} | parameters: [${paramString}]`);
	// });

	assertEquals(discoverUrlParameters, expectedResult);

	// assertEquals(result, 10 * 2 + 5 * 3); // 20 + 15 = 35

	// TODO: bruk random weights, og loop gjennom userParameterWeights og sorter og basically gjør funksjonen, men på utsiden.
});