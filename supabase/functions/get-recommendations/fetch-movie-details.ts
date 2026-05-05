import { GenericMovie, tmdbData } from "../_shared/properties.ts";
import getDetailsAPIRequestURL from "./get-api-request-for-details.ts";

const fetchMovieDetails = async (tmdbData: tmdbData, movieId: number) => {
    const detailsURL = await getDetailsAPIRequestURL(tmdbData, movieId);

    let response;

    try {
        response = await fetch(detailsURL, { headers: { accept: "application/json" } });
    } catch (error) {
        console.error(`Fetching movie details failed: ${error}`);

        return new Response(
            JSON.stringify({
                error: `Fetching movie details failed`,
                details: error,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    const movieDetails = await response.json();
    return movieDetails;
}

export default fetchMovieDetails;