import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { tmdbData, GenericMovie } from "../_shared/properties.ts";

const getDetailsAPIRequestURL = async (tmdbData: tmdbData, movieId: number) => {
    const detailsBaseURL = `https://api.themoviedb.org/3/movie/${movieId}`;
    const queryParams = new URLSearchParams({ api_key: encodeURIComponent(tmdbData.APIKey) });
    queryParams.append("append_to_response", "keywords");
    // queryParams.append("append_to_response", "keyword");

    const detailsURL = `${detailsBaseURL}?${queryParams.toString()}`;
    return detailsURL;
}

export default getDetailsAPIRequestURL;