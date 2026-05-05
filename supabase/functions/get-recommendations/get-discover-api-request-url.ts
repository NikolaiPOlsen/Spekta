import { ApiRequestTypeParameter, GetDiscoverApiRequestFunctionParameters } from "../_shared/properties.ts";
import { APIRequestDefaultSortingMethod, APIRequestParameterAmount, APIRequestRandomPageMax, APIRequestRandomPageMin } from "../_shared/constants.ts";
import { ParameterTypeName } from "../_shared/parameter-type-names.ts";
import { exponent, getRegularQueryParameters, findMinMaxValuesInRange, formatDate } from "./parameter-utilities.ts";

const getDiscoverApiRequestUrlFromParameters = ({ tmdbData, parameters, includeAdult, languagePreference, randomPage, randomSorting }: GetDiscoverApiRequestFunctionParameters) => {
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
            const exp = 4;
            const randomValue = Math.random();
            
            // page = Math.floor(Math.random() * (max - min + 1)) + min;
            
            // more likely to be a page with a lower value
            page = Math.floor((exponent(randomValue, exp)) * max) + min;
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


    const handleGenreParameters = (parameter: ApiRequestTypeParameter) => {
        const paramData = getRegularQueryParameters(parameter.positive, parameter.parameters, "genres");
        if (paramData) queryParams.append(paramData.key, paramData.param);
    }

    const handleKeywordParameters = (parameter: ApiRequestTypeParameter) => {
        const paramData = getRegularQueryParameters(parameter.positive, parameter.parameters, "kaywords");
        if (paramData) queryParams.append(paramData.key, paramData.param);
    }

    const handleRuntimeParameters = (parameter: ApiRequestTypeParameter) => {
        const positive = parameter.positive;
        if (!positive) return;

        const URLKey = { lower: "with_runtime.gte", upper: "with_runtime.lte" };
        const runtimes = parameter.parameters;

        const { min, max } = findMinMaxValuesInRange(runtimes);

        queryParams.append(URLKey.lower, String(min));
        queryParams.append(URLKey.upper, String(max));

    }

    const handleReleaseDateParameters = (parameter: ApiRequestTypeParameter) => {
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
                handleGenreParameters(parameter);
                break;

            case ParameterTypeName.Keyword:
                // ~90% of the time: include keywords the user likes
                if (Math.random() < 0.90) {
                    handleKeywordParameters(parameter);
                }

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

    return `${baseURL}?${queryParams.toString()}`;
}

export default getDiscoverApiRequestUrlFromParameters;