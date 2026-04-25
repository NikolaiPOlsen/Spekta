import getUserWeights from "../_shared/get-weights-from-db.ts";
import { getAPIRequestProperties, UserParameterWeight, APIRequestTypeParameter, BuildAPIRequestURLSpecification } from "../_shared/properties.ts";
import { APIRequestDefaultSortingMethod, APIRequestParameterAmount, APIRequestRandomPageMax, APIRequestRandomPageMin } from "../_shared/constants.js";
import { ParameterTypeName } from "./parameter-type-names.js";

const buildAPIRequestURLFromParameters = ({ tmdbData, includeAdult, parameters, languagePreference, randomPage, randomSorting, randomWithGenres, randomWithCast, randomWithoutGenres, randomWithoutCast, userGenres, userCast }: BuildAPIRequestURLSpecification) => {
    if ((randomWithGenres || randomWithoutGenres) && (!userGenres || userGenres.length < APIRequestParameterAmount)) {
        throw new Error("userGenres must be present and length > APIRequestParameterAmount if `randomWithGenres` or `randomWithoutGenres` are set");
    }

    if ((randomWithCast || randomWithoutCast) && (!userCast || userCast.length < APIRequestParameterAmount)) {
        throw new Error("userCast must be present and length > APIRequestParameterAmount if `randomWithCast` or `randomWithoutCast` are set");
    }

    const tmdbAPIKey = tmdbData.APIKey;
    const tmdbBaseURL = tmdbData.baseURL;

    const baseURL = tmdbBaseURL ? tmdbBaseURL : "https://api.themoviedb.org/3/discover/movie";
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

    parameters.forEach(parameter => {
        const type = parameter.type;

        switch (type) {
            case ParameterTypeName.Genre:
                handleGenreParameters(parameter);
                
            case ParameterTypeName.Actor:
                handleActorParameters(parameter);

            case ParameterTypeName.Runtime:

            case ParameterTypeName.ReleaseDate:

            case ParameterTypeName.Revenue:

        }
    });

    // custom params
    parameters.forEach((paramGroup) => {
        const { positive, type, parameters } = paramGroup;

        if (!parameters.length) return;

        const tmdbKey = positive ? `with_${type}` : `without_${type}`;
        queryParams.append(tmdbKey, parameters.join(","));
    });

    // randomized params
    const appendRandomParam = (
        key: string,
        value: boolean | number | undefined
    ) => {
        if (!value) return;

        let count: number;

        if (typeof value === "boolean") {
            count = APIRequestParameterAmount;
        } else {
            count = value;
        }

        // collect matching parameters from existing list
        const pool: string[] = [];

        parameters.forEach((group) => {
            if (group.type === key.replace("with_", "").replace("without_", "")) {
                pool.push(...group.parameters);
            }
        });

        if (!pool.length) return;

        const shuffled = pool.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);

        if (!selected.length) return;
        queryParams.append(key, selected.join(","));
    };



    appendRandomParam("with_genres", randomWithGenres);
    appendRandomParam("with_cast", randomWithCast);
    appendRandomParam("without_genres", randomWithoutGenres);
    appendRandomParam("without_cast", randomWithoutCast);

    return `${baseURL}?${queryParams.toString()}`;
}

const getAPIRequestWithParameters = async ({ tmdbData, supabaseClientInstance, userId, addRandomness = false }: getAPIRequestProperties) => {
    const withRandomness = addRandomness ? true : false;

    const parameters: UserParameterWeight[][] = await getUserWeights(supabaseClientInstance, userId);
    // const parameterAmount = parameters.length;
    const resultParams: APIRequestTypeParameter[] = [];

    parameters.forEach(parameterWeights => {
        if (withRandomness) {
            // loop through and add randomness to weights
        }

        const parameterWeightsLength = parameterWeights.length;
        const sortedWeights = parameterWeights.sort((a, b) => b.weight - a.weight);
        // const reverseSortedWeights = [...sortedWeights].reverse();
        const topParameterWeights = sortedWeights.slice(0, APIRequestParameterAmount);

        // Build data structure of parameters that will be specified in API request
        const paramType = parameterWeights[0].parameter_type;
        const resultParametersPositive: APIRequestTypeParameter = {
            positive: true, // for top 5 (positive weight)
            type: paramType,
            parameters: []
        };

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
}

export default getAPIRequestWithParameters;