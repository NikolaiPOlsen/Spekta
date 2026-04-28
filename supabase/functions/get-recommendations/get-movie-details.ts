import { GenericMovie, tmdbData } from "../_shared/properties.ts";
import getDetailsAPIRequestURL from "./get-api-request-for-details.ts";

const getMovieDetails = async (tmdbData: tmdbData, movieId: number) => {
    const detailsURL = getDetailsAPIRequestURL(tmdbData, movieId);


}

export default getMovieDetails;