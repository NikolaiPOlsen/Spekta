import { serve } from "https://deno.land/std@0.224.0/http/server.js";
import { createUserClient } from "../_shared/supabase-create-client.ts";
import getAPIRequestWithParameters from "./get-discover-api-request-url.ts";
import getFinalRecommendations from "./get-final-recommendations.ts";
import getUserWeights from "../_shared/get-weights-from-db.ts";
import getDiscoverApiRequestUrlParametersFromWeights from "./get-discover-url-parameters.js";
import { getUserSettingsFromDb } from "../_shared/get-user-settings.js";
import getDiscoverApiRequestUrlFromParameters from "./get-discover-api-request-url.ts";

// types
import {
	ApiRequestTypeParameter, GetParametersFromWeightsParameters, tmdbData, GenericMovieAPIFetch, GenericMovie,
	DetailedMovie, UserParameterWeight, GetDiscoverApiRequestFunctionParameters
} from "../_shared/properties.ts";

serve(async (req) => {
	try {
		const supabase = createUserClient(req);
		const { data: { user }, error: userError } = await supabase.auth.getUser();
		const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
		const tmdbBaseUrl = Deno.env.get("TMDB_BASE_URL");


		if (!tmdbApiKey) {
			return new Response(
				JSON.stringify({ error: "Missing TMDB_API_KEY" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		if (!tmdbBaseUrl) {
			return new Response(
				JSON.stringify({ error: "Missing TMDB_BASE_URL" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const tmdbData: tmdbData = {
			APIKey: tmdbApiKey,
			baseURL: tmdbBaseUrl
		};

		// =====================================================================
		// step 1: get user weights from database
		console.log("Reading user weights from database");
		const userParameterWeights: UserParameterWeight[][] = await getUserWeights(supabase, user.id);


		// =====================================================================
		// step 2: use the weights to filter which parameters to use in the /discover api request url
		// options
		const getUrlParametersOptions: GetParametersFromWeightsParameters = {
			userParameterWeights: userParameterWeights, // use the weights from step 1
			randomWeightOffset: true,
			randomizeURLParameters: false
		};

		const discoverUrlParameters: ApiRequestTypeParameter[] = getDiscoverApiRequestUrlParametersFromWeights(getUrlParametersOptions);


		// =====================================================================
		// step 3: read user preferences from database, these are also used in the /discover api request url
		const userPreferences = await getUserSettingsFromDb(supabase, user.id);
		const preferredLanguage = userPreferences.preferred_language;

		// =====================================================================
		// step 4: take those parameters and build the /discover api request url

		const getDiscoverApiRequestUrlOptions: GetDiscoverApiRequestFunctionParameters = {
			tmdbData: tmdbData,
			parameters: discoverUrlParameters,
			includeAdult: userPreferences.include_adult,
			randomPage: true,
			randomSorting: true
		};

		const APIRequestURL = getDiscoverApiRequestUrlFromParameters(getDiscoverApiRequestUrlOptions);
		// return APIRequestURL;



		// =====================================================================
		// step 5: take those parameters and build the /discover api request url




		// step 6: fetch from the /discover endpoint



		// step 7: sort the 20 GenericMovie[] movies by something (call sort movies function)



		// step 8: fetch extra details for the top 5 or so movies (actors (cast), runtime, keywords)



		// step 9: combine the DetailedMovie[] and GenericMovie[]



		// step 10: return the movie recommendations to frontend

		const discoverApiRequestOptions: GetDiscoverApiRequestFunctionParameters = {
			tmdbData: tmdbData,
			supabaseClientInstance: supabase,
			userId: user.id,
			randomWeightOffset: true,
			randomizeURLParameters: false
		};

		let APIRequestURL;
		let response;

		try {
			console.log("Before getUserWeights");
			const parameters: UserParameterWeight[][] = await getUserWeights(supabaseClientInstance, userId);
			console.log("After getUserWeights");

			// console.log("Trying to build api request");
			APIRequestURL = await getAPIRequestWithParameters(APIRequestOptions);
			// console.log("Built api request");

			response = await fetch(APIRequestURL, { headers: { accept: "application/json" } });
		} catch (error) {
			console.error(`Error whilst building API request: ${error}`);

			return new Response(
				JSON.stringify({
					error: `Building API request failed`,
					details: error,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const data = await response.json();

		if (!response.ok) {
			return new Response(
				JSON.stringify({
					error: `TMDb request failed: ${response.status}`,
					details: data,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const movies: GenericMovie[] = [];

		data.results.forEach((movie: GenericMovieAPIFetch) => {
			const genericMovie: GenericMovie = {
				adult: movie.adult,
				backdropPath: movie.backdrop_path,
				genreIds: movie.genre_ids,
				id: movie.id,
				title: movie.title,
				originalLanguage: movie.original_language,
				originalTitle: movie.original_title,
				overview: movie.overview,
				popularity: movie.popularity,
				posterPath: movie.poster_path,
				releaseDate: movie.release_date,
				video: movie.video,
				voteAverage: movie.vote_average,
				voteCount: movie.vote_count
			}

			movies.push(genericMovie);
		});

		// Sort and get details for first movies
		const recommendations = await getFinalRecommendations(tmdbData, movies);

		return new Response(JSON.stringify({ apiRequest: APIRequestURL.replace(tmdbData.APIKey, "APIKEY"), recommendations }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
});