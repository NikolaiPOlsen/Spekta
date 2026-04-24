import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async () => {
	try {
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
		//       `${tmdbBaseUrl}/movie/popular?api_key=${encodeURIComponent(tmdbApiKey)}&language=en-US&page=1`,
		const response = await fetch(
			`https://api.themoviedb.org/3/discover/movie?api_key=${encodeURIComponent(tmdbApiKey)}&language=en-US&page=1&sort_by=popularity.desc&with_cast=297`,
			{
				headers: {
					accept: "application/json",
				},
			}
		);

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

		return new Response(JSON.stringify({ movies }), {
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