import { ApiRequestTypeParameter, GetDiscoverApiRequestFunctionParameters } from "../_shared/properties.ts";
import { ApiDetailsVoteCountMinimum, APIRequestDefaultSortingMethod, APIRequestParameterAmount, APIRequestRandomPageMax, APIRequestRandomPageMin } from "../_shared/constants.ts";
import { ParameterTypeName } from "../_shared/parameter-type-names.ts";
import { exponent, getRegularQueryParameters, findMinMaxValuesInRange, formatDate } from "./parameter-utilities.ts";

const getDiscoverApiRequestUrlFromParameters = ({ tmdbData, parameters, includeAdult, includeUnreleasedMovies, languagePreference, randomPage, randomSorting }: GetDiscoverApiRequestFunctionParameters) => {
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

    const avoidUnreleasedMovies = !includeUnreleasedMovies;

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
            const exp = 5;
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
        const sortOptions = ["popularity.desc", "revenue.desc", "vote_count.desc", "primary_release_date.desc", "revenue.asc", "vote_average.asc", "vote_average.desc"];
        const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];

        if (randomSort != "primary_release_date.desc" && randomSort != "revenue.asc" && randomSort != "vote_average.asc") {
            // minimum vote count
            queryParams.append("vote_count.gte", String(ApiDetailsVoteCountMinimum));
        }

        queryParams.append("sort_by", randomSort);
    } else {
        queryParams.append("sort_by", APIRequestDefaultSortingMethod);
    }


    const handleGenreParameters = (parameter: ApiRequestTypeParameter) => {
        // console.log("started handling genre parameters");
        const paramData = getRegularQueryParameters(parameter.positive, parameter.parameters, "genres");
        if (paramData) queryParams.append(paramData.key, paramData.param);
        // console.log("finished handling genre parameters");
    }

    const handleKeywordParameters = (parameter: ApiRequestTypeParameter) => {
        // console.log("started handling keyword parameters");
        const paramData = getRegularQueryParameters(parameter.positive, parameter.parameters, "keywords");
        if (paramData) queryParams.append(paramData.key, paramData.param);
        // console.log("finished handling keyword parameters");
    }

    const handleRuntimeParameters = (parameter: ApiRequestTypeParameter) => {
        // console.log("started handling runtime parameters");

        const positive = parameter.positive;
        if (!positive) return;

        const runtimes = parameter.parameters;
        if (runtimes.length < 1) return;

        const URLKey = { lower: "with_runtime.gte", upper: "with_runtime.lte" };
        console.log(`runtimes (${runtimes.length}): ${runtimes}`);

        const { min, max } = findMinMaxValuesInRange(runtimes);

        queryParams.append(URLKey.lower, String(min));
        queryParams.append(URLKey.upper, String(max));

        // console.log("finished handling runtime parameters");
    }

    const handleReleaseDateParameters = (parameter: ApiRequestTypeParameter) => {
        // console.log("started handling releasedate parameters");

        const positive = parameter.positive;
        if (!positive) return;

        const dateRanges = parameter.parameters;
        if (dateRanges.length < 1) return;

        const URLKey = { lower: "primary_release_date.gte", upper: "primary_release_date.lte" };
        console.log(`dateranges (${dateRanges.length}): ${dateRanges}`);

        const { min, max } = findMinMaxValuesInRange(dateRanges);

        const currentUnixTime = Date.now();

        // ~Half the time: release_date.gte/lte parameters added to url
        // gte: greater than or equal
        // lte: less than or equal
        if (Math.random() < 0.50) {
            const startDate = new Date(min, 0, 0, 0, 0, 0); // first time of a year
            const endDate = new Date(max, 11, 31, 23, 59, 59); // last time of a year

            queryParams.append(URLKey.lower, formatDate(startDate));

            if (endDate.getTime() <= currentUnixTime && !avoidUnreleasedMovies) {
                queryParams.append(URLKey.upper, formatDate(endDate));
            }
            // else if (!avoidUnreleasedMovies) {
            //     upperDateRangeBoundAdded = true;
            //     queryParams.append(URLKey.upper, formatDate(endDate));
            // }
        }

        if (avoidUnreleasedMovies) {
            // Avoid movies that have not been released yet
            queryParams.append(URLKey.upper, formatDate(new Date(currentUnixTime)));
        }

        // console.log("finished handling releasedate parameters");
    }

    for (let index = 0; index < parameters.length; index++) {
        const parameter = parameters[index];
        const type = parameter.type;
        // console.log(`adding url parameters for type: ${type}`);

        if (type == ParameterTypeName.Genre) {
            // console.log("ms:", (new Date(Date.now())).getMilliseconds(), "case Genre");
            handleGenreParameters(parameter);
        }

        if (type == ParameterTypeName.Keyword) {
            // console.log("ms:", (new Date(Date.now())).getMilliseconds(), "case Keyword");
            // ~90% of the time: include keywords the user likes
            handleKeywordParameters(parameter);
        }

        if (type == ParameterTypeName.Runtime) {
            // console.log("ms:", (new Date(Date.now())).getMilliseconds(), "case Runtime");
            // ~Half the time: no runtime parameters added to URL
            handleRuntimeParameters(parameter);
        }

        if (type == ParameterTypeName.ReleaseDate) {
            // console.log("ms:", (new Date(Date.now())).getMilliseconds(), "case ReleaseDate");
            handleReleaseDateParameters(parameter);
        }
    }

    // parameters.forEach(parameter => {
    //     const type = parameter.type;
    //     console.log(`adding url parameters for type: ${type}`);

    //     switch (type) {
    //         case ParameterTypeName.Genre:

    //             break;

    //         case ParameterTypeName.Keyword:


    //         case 

    //         case ParameterTypeName.ReleaseDate:

    //             break;

    //         default:
    //             break;
    //     }
    // });

    return `${baseURL}?${queryParams.toString()}`;
}

export default getDiscoverApiRequestUrlFromParameters;