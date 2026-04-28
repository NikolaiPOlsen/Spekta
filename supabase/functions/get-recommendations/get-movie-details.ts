import { GenericMovie, tmdbData } from "../_shared/properties.ts";
import getDetailsAPIRequestURL from "./get-api-request-for-details.ts";

const getMovieDetails = async (tmdbData: tmdbData, movieId: number) => {
    const detailsURL = await getDetailsAPIRequestURL(tmdbData, movieId);

    let response;

    try {
        response = await fetch(detailsURL, { headers: { accept: "application/json" } });
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
    return data;
}

export default getMovieDetails;