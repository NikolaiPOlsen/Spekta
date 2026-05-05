import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createUserClient } from "../_shared/supabase-create-client.ts";
import getAPIRequestWithParameters from "./get-discover-api-request-url.ts";
import getUserWeights from "../_shared/get-weights-from-db.ts";
import getDiscoverApiRequestUrlParametersFromWeights from "./get-discover-url-parameters.ts";
import { getUserSettingsFromDb } from "../_shared/get-user-settings.ts";
import getDiscoverApiRequestUrlFromParameters from "./get-discover-api-request-url.ts";
import filterMoviesWithoutPosterPath from "./filter-movies-no-poster.ts";
import sortGenericMovies from "./sort-generic-movies.ts";
import { ApiDetailsMovieAmount } from "../_shared/constants.ts";
import getMovieDetails from "./get-movie-details.ts";
import combineExtraDetailsWithGenericMovies from "./combine-extra-details-with-generic-movies.ts";
import convertDiscoverResponseToGenericMovie from "./convert-discover-response-to-generic-movie.ts";

// types
import {
	ApiRequestTypeParameter, GetParametersFromWeightsParameters, TmdbData, GenericMovieAPIFetch, GenericMovie,
	DetailedMovie, UserParameterWeight, GetDiscoverApiRequestFunctionParameters
} from "../_shared/properties.ts";
import { ExtraMovieDetails } from "./detail-properties.ts";

serve(async (req) => {
	try {
		const supabase = createUserClient(req);
		const { data: { user }, error: userError } = await supabase.auth.getUser();
		const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
		const tmdbBaseUrl = Deno.env.get("TMDB_BASE_URL");



		// =====================================================================
		// step 0: load supabase secrets and/or environment variables
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

		// initialize object of type for easier api variable handling
		const tmdbData: TmdbData = {
			APIKey: tmdbApiKey,
			baseURL: tmdbBaseUrl
		};

		console.log("finish step 0");



		// =====================================================================
		// step 1: get user weights from database
		console.log("Reading user weights from database");
		const userParameterWeights: UserParameterWeight[][] = await getUserWeights(supabase, user.id);
		console.log("finish step 1");



		// =====================================================================
		// step 2: use the weights to filter which parameters to use in the /discover api request url
		// options
		const getUrlParametersOptions: GetParametersFromWeightsParameters = {
			userParameterWeights: userParameterWeights, // use the weights from step 1
			randomWeightOffset: true,
			randomizeURLParameters: false
		};

		const discoverUrlParameters: ApiRequestTypeParameter[] = getDiscoverApiRequestUrlParametersFromWeights(getUrlParametersOptions);
		console.log("finish step 2");



		// =====================================================================
		// step 3: read user preferences from database, these are also used in the /discover api request url
		const userPreferences = await getUserSettingsFromDb(supabase, user.id);
		const preferredLanguage = userPreferences.preferred_language;
		console.log("finish step 3");



		// =====================================================================
		// step 4: using parameters and user preferences, define the options for building the /discover api request url

		const getDiscoverApiRequestUrlOptions: GetDiscoverApiRequestFunctionParameters = {
			tmdbData: tmdbData,
			parameters: discoverUrlParameters,
			includeAdult: userPreferences.include_adult,
			randomPage: true,
			randomSorting: true
		};

		// If user has specified a preferred language, the url will specify that as a parameter
		if (preferredLanguage != null) {
			getDiscoverApiRequestUrlOptions.languagePreference = preferredLanguage;
		}
		console.log("finish step 4");



		// =====================================================================
		// step 5: take those options and build the /discover api request url
		const discoverApiRequestUrl = getDiscoverApiRequestUrlFromParameters(getDiscoverApiRequestUrlOptions);
		console.log("finish step 5");



		// step 6: fetch from the /discover endpoint
		let response;

		try {
			response = await fetch(discoverApiRequestUrl, { headers: { accept: "application/json" } });
			console.log("Finished fetching from /discover");

		} catch (error) {
			console.error(`Error whilst fetching from /discover: ${error}`);

			return new Response(
				JSON.stringify({ error: "Fetching from /discover failed", details: error }), { status: 500, headers: { "Content-Type": "application/json" } });
		}



		if (!response.ok) {
			return new Response(
				JSON.stringify({
					error: `TMDb request failed: ${response.status}`,
					details: await response.json(),
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Deserialize from JSON to JS object
		console.log("before deserializing from json");
		const discoverResponse = await response.json();
		console.log("after deserializing from json");
		
		console.log("before accessing discoverResponse.result");
		console.log(`discoverResponse keys: ${Object.keys(discoverResponse)}`);


		const discoverResponseMovies: GenericMovieAPIFetch[] = discoverResponse.results;

		// convert to local type GenericMovie[]
		console.log("before step 6");
		const genericMovies: GenericMovie[] = convertDiscoverResponseToGenericMovie(discoverResponseMovies);
		console.log("finish step 6");
		
		
		// =====================================================================
		// step 7: filter out the generic movies without poster path
		const filteredGenericMovies: GenericMovie[] = filterMoviesWithoutPosterPath(genericMovies);
		console.log("finish step 7");
		
		
		
		// =====================================================================
		// step 8: sort the 20 GenericMovie[] movies by something (call sort movies function)
		const sortedGenericMovies: GenericMovie[] = sortGenericMovies(filteredGenericMovies);
		console.log("finish step 8");
		
		
		
		// =====================================================================
		// step 9: fetch extra details for the top 5 or so movies (actors (cast), runtime, keywords)
		// get the first generic movies of the sorted generic movies
		const firstSortedGenericMovies = sortedGenericMovies.slice(0, ApiDetailsMovieAmount)
		const extraDetailsForMovies: ExtraMovieDetails[] = await getMovieDetails(tmdbData, firstSortedGenericMovies);
		console.log("finish step 9");
		
		
		
		// =====================================================================
		// step 10: combine the extra details with the GenericMovie[]
		const recommendations: DetailedMovie[] = combineExtraDetailsWithGenericMovies(firstSortedGenericMovies, extraDetailsForMovies);
		console.log("finish step 10");
		
		
		// =====================================================================
		// step 11: return the movie recommendations to frontend
		return new Response(JSON.stringify({ discoverApiRequestUrl: discoverApiRequestUrl.replace(tmdbData.APIKey, "APIKEY"), recommendations }), {
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