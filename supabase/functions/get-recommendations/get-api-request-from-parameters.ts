import { APIRequestTypeParameter, BuildAPIRequestURLSpecification } from "../_shared/properties.js";
import { APIRequestDefaultSortingMethod, APIRequestParameterAmount, APIRequestRandomPageMax, APIRequestRandomPageMin } from "../_shared/constants.js";
import { ParameterTypeName } from "../_shared/parameter-type-names.js";

const getAPIRequestUrlFromParameters = ({ tmdbData, includeAdult, parameters, languagePreference, randomPage, randomSorting }: BuildAPIRequestURLSpecification) => {
    const paramTypes: string[] = [];

    parameters.forEach(param => {
        paramTypes.push(param.type);
    });

    console.log(`Parameter types passed: ${paramTypes}`);

    console.log(`
        API Request parameters:
        includeAdult: ${includeAdult}
        | parametersLength: ${parameters.length}
        | languagePreference: ${languagePreference}
        | randomPage: ${randomPage}
        | randomSorting: ${randomSorting}
    `);

    const tmdbAPIKey = tmdbData.APIKey;
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
            const exponent = 4;
            const randomValue = Math.random();

            // page = Math.floor(Math.random() * (max - min + 1)) + min;

            // more likely to be a page with a lower value
            page = Math.floor((randomValue ** exponent) * max) + min;
        }

        queryParams.append("page", String(page));
    }

    // sorting
    if (randomSorting) {
        // const sortOptions = ["original_title.asc", "original_title.desc", "popularity.asc", "popularity.desc", "revenue.asc, revenue.desc", "primary_release_date.asc", "title.asc", "title.desc", "primary_release_date.desc", "vote_average.asc", "vote_average.desc", "vote_count.asc", "vote_count.desc"];
        const sortOptions = ["popularity.desc", "revenue.desc", "vote_count.desc"];

        const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
        queryParams.append("sort_by", randomSort);
    } else {
        queryParams.append("sort_by", APIRequestDefaultSortingMethod);
    }

    const concatenateParameters = (parameters: string[]) => {
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

    const addRegularQueryArgument = (positive: boolean, parameters: string[], urlParamType: string) => {
        const urlKey = positive ? `with_${urlParamType}` : `without_${urlParamType}`;
        // Always add with_{e.g. keywords} (using OR) for positive
        // 75% of the time, without_{e.g. keywords} will be there
        if (positive || Math.random() < 0.75) {
            const urlArgument = concatenateParameters(parameters);
            queryParams.append(urlKey, urlArgument);
        }
    }

    const handleGenreParameters = (parameter: APIRequestTypeParameter) => {
        addRegularQueryArgument(parameter.positive, parameter.parameters, "genres");
        // const positive = parameter.positive;
        // const genres = parameter.parameters;
        // const URLKey = positive ? "with_genres" : "without_genres";
        // let URLArgument = concatenateParameters(genres);
        // queryParams.append(URLKey, URLArgument);
    }

    const handleActorParameters = (parameter: APIRequestTypeParameter) => {
        addRegularQueryArgument(parameter.positive, parameter.parameters, "cast");
        // const positive = parameter.positive;
        // const actors = parameter.parameters;
        // const URLKey = positive ? "with_cast" : "without_cast";
        // let URLArgument = concatenateParameters(actors);
        // queryParams.append(URLKey, URLArgument);
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

    // const handleRevenueParameters = (parameter: APIRequestTypeParameter) => {
    //     const positive = parameter.positive;
    //     if (!positive) return;

    //     const URLKey = { lower: "primary_release_date.gte", upper: "primary_release_date.lte" };
    //     const dateRanges = parameter.parameters;

    //     const { min, max } = findMinMaxValuesInRange(dateRanges);

    //     const startDate = new Date(min, 0, 1, 0, 0, 0); // first time of a year
    //     const endDate = new Date(max, 11, 31, 23, 59, 59); // last time of a year

    //     queryParams.append(URLKey.lower, formatDate(startDate));
    //     queryParams.append(URLKey.upper, formatDate(endDate));
    // }

    const handleKeywordParameters = (parameter: APIRequestTypeParameter) => {
        addRegularQueryArgument(parameter.positive, parameter.parameters, "keywords");
        // const positive = parameter.positive;
        // const keywordIds = parameter.parameters;
        // const URLKey = positive ? "with_keywords" : "without_keywords";

        // // Always add with_keywords (using OR) for positive
        // // 75% of the time, without_keywords will be there
        // if (positive || Math.random() < 0.75) {
        //     let URLArgument;
        //     URLArgument = concatenateParameters(keywordIds);
        //     queryParams.append(URLKey, URLArgument);
        // }
        
    }

    parameters.forEach(parameter => {
        const type = parameter.type;

        switch (type) {
            case ParameterTypeName.Genre:
                handleGenreParameters(parameter);
                break;

            case ParameterTypeName.Actor:
                // Check if randomWithCast is set to false or not specified
                handleActorParameters(parameter);
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

            case ParameterTypeName.Keyword:
                // 90% of the time: include keywords the user likes
                if (Math.random() < 0.90) {
                    handleKeywordParameters(parameter);
                }

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

    return `${baseURL}?${queryParams.toString()}`;
}

export default getAPIRequestUrlFromParameters;