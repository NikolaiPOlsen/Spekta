import { APIRequestParameterAmount } from "../_shared/constants.ts";

export const concatenateParameters = (parameters: string[]) => {
	let concatenatedParameters = "";
	for (let i = 0; i < parameters.length; i++) {
		const operator = "|"; // positive ? "|" : ","; // Math.random() < 0.8 ? "|" : ",";

		if (i != 0) {
			concatenatedParameters += operator;
		}
		concatenatedParameters += parameters[i];
	}

	return concatenatedParameters;
}

export const findMinMaxValuesInRange = (array: string[]) => {
	let maxValue = 0;
	let minValue = 9.2E18;

	array.forEach(element => {
		const numbers = element.split("-");
		const rangeMin = parseInt(numbers[0]);
		const rangeMax = parseInt(numbers[1]);

		if (Number.isNaN(rangeMin) || Number.isNaN(rangeMax)) {
			throw new Error("Cannot convert string to valid number");
		}

		if (rangeMin < minValue) {
			minValue = rangeMin;
		}

		if (rangeMax > maxValue) {
			maxValue = rangeMax;
		}
	});

	return {
		min: minValue,
		max: maxValue,
	};
}

export const formatDate = (date: Date) => {
	return date.toISOString().split("T")[0];
}

export const getRegularQueryParameters = (positive: boolean, parameters: string[], urlParamType: string) => {
	const urlKey = positive ? `with_${urlParamType}` : `without_${urlParamType}`;
	// Always add with_{e.g. keywords} (using OR) for positive
	// 75% of the time, without_{e.g. keywords} will be there
	if (positive || Math.random() < 0.75) {
		const urlParameter = concatenateParameters(parameters);
		return {
			key: urlKey,
			param: urlParameter
		};
	}

	return null;
}

const getRandomElements = (original: string[], returnCount: number) => {
	const shuffled = [...original];

	// Fisher-Yates shuffle (Knuth shuffle)
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
	}

	// first elements
	return shuffled.slice(0, returnCount);
}

const getParameterAmount = (randomAmount: number | boolean) => {
	if (typeof randomAmount == "number") {
		return randomAmount;
	}

	const amount = Math.floor(Math.random() * 10) + Math.ceil(APIRequestParameterAmount / 2);
	return amount;
}