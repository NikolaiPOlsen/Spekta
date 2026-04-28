import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createUserClient } from "../_shared/supabase-create-client.ts";
import getAPIRequestWithParameters from "./get-api-request-with-parameters.ts";
import { APIRequestTypeParameter, getAPIRequestProperties, tmdbData } from "../_shared/properties.ts";

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

		const movies = (data.results ?? []).map((movie: any) => ({
			tmdb_id: movie.id,
			genre_ids: movie.genre_ids,
			release_date: movie.release_date ?? null,
			popularity: movie.popularity,
			vote_average: movie.vote_average,
			vote_count: movie.vote_count,
			adult: movie.adult,
			name: movie.title,
			poster_path: movie.poster_path,
			overview: movie.overview
		}));

		return new Response(JSON.stringify({ apiRequest: APIRequestURL.replace(tmdbData.APIKey, "{APIKEY}"), movies }), {
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