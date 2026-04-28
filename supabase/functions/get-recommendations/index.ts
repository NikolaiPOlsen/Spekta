import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createUserClient } from "../_shared/supabase-create-client.ts";
import getAPIRequestWithParameters from "./get-api-request-with-parameters.ts";
import getFinalRecommendations from "./get-final-recommendations.ts";
import { APIRequestTypeParameter, getAPIRequestProperties, tmdbData, GenericMovieAPIFetch, GenericMovie, DetailedMovie } from "../_shared/properties.ts";

serve(async (req) => {
	try {
		const supabase = createUserClient(req);
		const { data: { user }, error: userError } = await supabase.auth.getUser();
		const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
		const tmdbBaseUrl = Deno.env.get("TMDB_BASE_URL");

		console.log("Test");

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

		const APIRequestOptions: getAPIRequestProperties = {
			tmdbData: tmdbData,
			supabaseClientInstance: supabase,
			userId: user.id,
			randomWeightOffset: false,
			randomizeURLParameters: false
		};

		let APIRequestURL;
		let response;

		try {
			console.log("Trying to build api request");
			APIRequestURL = await getAPIRequestWithParameters(APIRequestOptions);
			console.log("Built api request");

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

		return new Response(JSON.stringify({ recommendations }), {
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