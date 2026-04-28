import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { tmdbData, GenericMovie } from "../_shared/properties.ts";

const getDetailsAPIRequestURL = async (tmdbData: tmdbData, movieId: number) => {
    const detailsBaseURL = "https://api.themoviedb.org/3/movie";
    const queryParams = new URLSearchParams({ api_key: encodeURIComponent(tmdbData.APIKey) });
    queryParams.append("movie_id", String(movieId));
    return `${detailsBaseURL}?${queryParams.toString()}`;
}

export default getDetailsAPIRequestURL;