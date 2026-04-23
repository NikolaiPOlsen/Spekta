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

    const response = await fetch(
      `${tmdbBaseUrl}/movie/popular?api_key=${encodeURIComponent(tmdbApiKey)}&language=en-US&page=1`,
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
      media_type: "movie",
      name: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      first_air_or_release_date: movie.release_date ?? null,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
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