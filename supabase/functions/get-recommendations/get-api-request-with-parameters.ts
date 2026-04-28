import getUserWeights from "../_shared/get-weights-from-db.ts";
import { getAPIRequestProperties, UserParameterWeight, APIRequestTypeParameter, BuildAPIRequestURLSpecification, tmdbData } from "../_shared/properties.ts";
import { APIRequestDefaultSortingMethod, APIRequestParameterAmount, APIRequestRandomPageMax, APIRequestRandomPageMin } from "../_shared/constants.ts";
import { ParameterTypeName } from "../_shared/parameter-type-names.ts";
import { getUserSettingsFromDb } from "../_shared/get-user-settings.ts";

const buildAPIRequestURLFromParameters = ({ tmdbData, includeAdult, parameters, languagePreference, randomPage, randomSorting, randomWithGenres, randomWithCast, randomWithoutGenres, randomWithoutCast, userGenres, userCast }: BuildAPIRequestURLSpecification) => {
    if ((randomWithGenres || randomWithoutGenres) && (!userGenres || userGenres.length < APIRequestParameterAmount)) {
        throw new Error("userGenres must be present and length > APIRequestParameterAmount if `randomWithGenres` or `randomWithoutGenres` are set");
    }

    if ((randomWithCast || randomWithoutCast) && (!userCast || userCast.length < APIRequestParameterAmount)) {
        throw new Error("userCast must be present and length > APIRequestParameterAmount if `randomWithCast` or `randomWithoutCast` are set");
    }

    console.log(`
        API Request parameters:\n
        includeAdult: ${includeAdult}\n
        parametersLength: ${parameters.length}\n
        languagePreference: ${languagePreference}\n
        randomPage: ${randomPage}\n
        randomSorting: ${randomSorting}\n
        randomWithGenres: ${randomWithGenres}\n
        randomWithoutGenres: ${randomWithoutGenres}\n
        randomWithCast: ${randomWithCast}\n
        randomWithoutCast: ${randomWithoutCast}\n
    `);


    const tmdbAPIKey = tmdbData.APIKey;
    // const tmdbBaseURL = tmdbData.baseURL;

    const baseURL = tmdbData.baseURL;
    const queryParams = new URLSearchParams({ api_key: encodeURIComponent(tmdbAPIKey) });

    // language
    if (languagePreference) {
        queryParams.append("language", languagePreference);
    }

    // include adult
    if (includeAdult) {
        queryParams.append("include_adult", includeAdult ? "true" : "false");
    }

    // random page
    if (randomPage == undefined) {
        // get first page
        queryParams.append("page", String("1"));
    } else {
        // random page
        let page: number = 1;

        if (typeof randomPage == "boolean") {
            page = Math.floor(Math.random() * APIRequestRandomPageMax) + APIRequestRandomPageMin;
        } else {
            const min = randomPage[0];
            const max = randomPage[1];

            page = Math.floor(Math.random() * (max - min + 1)) + min;
        }

        queryParams.append("page", String(page));
    }

    // sorting
    if (randomSorting) {
        const sortOptions = ["original_title.asc", "original_title.desc", "popularity.asc", "popularity.desc", "revenue.asc, revenue.desc", "primary_release_date.asc", "title.asc", "title.desc", "primary_release_date.desc", "vote_average.asc", "vote_average.desc", "vote_count.asc", "vote_count.desc"];

        const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
        queryParams.append("sort_by", randomSort);
    } else {
        queryParams.append("sort_by", APIRequestDefaultSortingMethod);
    }

    const concatenateParameters = (parameters: string[]) => {
        let concatenatedParameters = "";
        for (let i = 0; i < parameters.length; i++) {
            if (i != 0) {
                concatenatedParameters += "|";
            }
            concatenatedParameters += `|${parameters[i]}`;
        }

        return concatenatedParameters;
    }

    const findMinMaxValuesInRange = (array: string[]) => {
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

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0];
    }

    const handleGenreParameters = (parameter: APIRequestTypeParameter) => {
        const positive = parameter.positive;
        const genres = parameter.parameters;
        const URLKey = positive ? "with_genres" : "without_genres";
        let URLArgument = concatenateParameters(genres);
        queryParams.append(URLKey, URLArgument);
    }

    const handleActorParameters = (parameter: APIRequestTypeParameter) => {
        const positive = parameter.positive;
        const actors = parameter.parameters;
        const URLKey = positive ? "with_cast" : "without_cast";
        let URLArgument = concatenateParameters(actors);
        queryParams.append(URLKey, URLArgument);
    }

    const handleRuntimeParameters = (parameter: APIRequestTypeParameter) => {
        const positive = parameter.positive;
        if (!positive) return;

        const URLKey = { lower: "with_runtime.gte", upper: "with_runtime.lte" };
        const runtimes = parameter.parameters;

        const { min, max } = findMinMaxValuesInRange(runtimes);

        queryParams.append(URLKey.lower, String(min));
        queryParams.append(URLKey.upper, String(max));

    }

    const handleReleaseDateParameters = (parameter: APIRequestTypeParameter) => {
        const positive = parameter.positive;
        if (!positive) return;

        const URLKey = { lower: "primary_release_date.gte", upper: "primary_release_date.lte" };
        const dateRanges = parameter.parameters;

        const { min, max } = findMinMaxValuesInRange(dateRanges);

        const startDate = new Date(min, 0, 1, 0, 0, 0); // first time of a year
        const endDate = new Date(max, 11, 31, 23, 59, 59); // last time of a year

        queryParams.append(URLKey.lower, formatDate(startDate));
        queryParams.append(URLKey.upper, formatDate(endDate));
    }

    const handleRevenueParameters = (parameter: APIRequestTypeParameter) => {
        const positive = parameter.positive;
        if (!positive) return;

        const URLKey = { lower: "primary_release_date.gte", upper: "primary_release_date.lte" };
        const dateRanges = parameter.parameters;

        const { min, max } = findMinMaxValuesInRange(dateRanges);

        const startDate = new Date(min, 0, 1, 0, 0, 0); // first time of a year
        const endDate = new Date(max, 11, 31, 23, 59, 59); // last time of a year

        queryParams.append(URLKey.lower, formatDate(startDate));
        queryParams.append(URLKey.upper, formatDate(endDate));
    }

    parameters.forEach(parameter => {
        const type = parameter.type;

        switch (type) {
            case ParameterTypeName.Genre:
                // Check if randomWithGenres is set to false or not specified
                if ((!randomWithGenres || randomWithGenres != undefined)) {
                    handleGenreParameters(parameter);
                }
                break;

            case ParameterTypeName.Actor:
                // Check if randomWithCast is set to false or not specified
                if (!randomWithCast || randomWithCast != undefined) {
                    handleActorParameters(parameter);
                }
                break;

            case ParameterTypeName.Runtime:
                // ~Half the time: no runtime parameters added to URL
                if (Math.random() < 0.5) {
                    handleRuntimeParameters(parameter);
                }
                break;

            case ParameterTypeName.ReleaseDate:
                // ~Half the time: no release_date parameters added to URL
                if (Math.random() < 0.5) {
                    handleReleaseDateParameters(parameter);
                }
                break;

            default:
                break;
        }
    });

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

    // random with_genres
    if (randomWithGenres && userGenres != undefined) {
        const URLKey = "with_genres";
        const amount = getParameterAmount(randomWithGenres);
        const randomGenreIds = getRandomElements(userGenres, amount);
        const concatenatedParameters = concatenateParameters(randomGenreIds);
        queryParams.append(URLKey, concatenatedParameters);
    }

    // random without_genres
    if (randomWithoutGenres && userGenres != undefined) {
        const URLKey = "without_genres";
        const amount = getParameterAmount(randomWithoutGenres);
        const randomGenreIds = getRandomElements(userGenres, amount);
        const concatenatedParameters = concatenateParameters(randomGenreIds);
        queryParams.append(URLKey, concatenatedParameters);
    }

    // random with_cast
    if (randomWithCast && userCast != undefined) {
        const URLKey = "with_genres";
        const amount = getParameterAmount(randomWithCast);
        const randomGenreIds = getRandomElements(userCast, amount);
        const concatenatedParameters = concatenateParameters(randomGenreIds);
        queryParams.append(URLKey, concatenatedParameters);
    }

    // random without_cast
    if (randomWithCast && userCast != undefined) {
        const URLKey = "without_genres";
        const amount = getParameterAmount(randomWithCast);

        const randomGenreIds = getRandomElements(userCast, amount);
        const concatenatedParameters = concatenateParameters(randomGenreIds);
        queryParams.append(URLKey, concatenatedParameters);
    }

    return `${baseURL}?${queryParams.toString()}`;
}

const getAPIRequestWithParameters = async ({ tmdbData, supabaseClientInstance, userId, randomWeightOffset = false, randomizeURLParameters = false }: getAPIRequestProperties) => {
    const useRandomWeightOffset = randomWeightOffset ? true : false;
    const useRandomURLParameters = randomizeURLParameters ? true : false;

    console.log("Before getUserWeights");
    const parameters: UserParameterWeight[][] = await getUserWeights(supabaseClientInstance, userId);
    console.log("After getUserWeights");



    // const parameterAmount = parameters.length;
    const resultParams: APIRequestTypeParameter[] = [];

    parameters.forEach(parameterWeights => {
        if (!parameterWeights || parameterWeights.length < 1) {
            return;
        }

        if (useRandomWeightOffset) {
            // loop through and add randomness to weights
        }

        const parameterWeightsLength = parameterWeights.length;
        const sortedWeights = parameterWeights.sort((a, b) => b.weight - a.weight);
        // const reverseSortedWeights = [...sortedWeights].reverse();
        const topParameterWeights = sortedWeights.slice(0, APIRequestParameterAmount);

        console.log(parameterWeights);

        // Build data structure of parameters that will be specified in API request
        const paramType = parameterWeights[0].parameter_type;
        const resultParametersPositive: APIRequestTypeParameter = {
            positive: true, // for top 5 (positive weight)
            type: paramType,
            parameters: []
        };

        console.log(`currently looping for ${paramType}`);

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
                type: paramType,
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

    const userPreferences = await getUserSettingsFromDb(supabaseClientInstance, userId);
    const preferredLanguage = userPreferences.preferred_language;

    let buildAPIRequestURLOptions: BuildAPIRequestURLSpecification = {
        tmdbData: tmdbData,
        parameters: resultParams,
        includeAdult: userPreferences.include_adult
    };

    if (!buildAPIRequestURLOptions.parameters || buildAPIRequestURLOptions.parameters.length < 1) {
        buildAPIRequestURLOptions.randomPage = true;
        buildAPIRequestURLOptions.randomSorting = true;
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

        buildAPIRequestURLOptions.randomPage = true;
        buildAPIRequestURLOptions.randomSorting = true;
        buildAPIRequestURLOptions.randomWithGenres = true;
        buildAPIRequestURLOptions.randomWithCast = true;
        buildAPIRequestURLOptions.randomWithoutGenres = true;
        buildAPIRequestURLOptions.randomWithoutCast = true;
        buildAPIRequestURLOptions.userGenres = userCast,
        buildAPIRequestURLOptions.userCast = userCast
    }

    const APIRequestURL = buildAPIRequestURLFromParameters(buildAPIRequestURLOptions);
    return APIRequestURL;
}

export default getAPIRequestWithParameters;