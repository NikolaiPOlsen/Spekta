import { GenericMovie, tmdbData } from "../_shared/properties.ts";
import getDetailsAPIRequestURL from "./get-api-request-for-details.ts";

const getMovieDetails = async (tmdbData: tmdbData, movieId: number) => {
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

    const data = await response.json();

    // try {
    //     // console.log(data.keywords);
    //     // for (const [key, value] of data) {
    //     //     console.log(key);
    //     // }
    //     // // data.keywords.forEach((keyword: any) => {
    //     // //     console.log(`id: ${keyword.id} | name: ${keyword.name}`);
    //     // // });
    // } catch (error) {
    //     console.error(`Failed to log keywords: ${error}`);
    // }

    return data;
}

export default getMovieDetails;