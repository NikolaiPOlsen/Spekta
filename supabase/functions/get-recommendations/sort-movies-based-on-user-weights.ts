import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GenericMovie } from "../_shared/properties.ts";

interface sortMoviesParameters {
    supabaseClientInstance: SupabaseClient
    userId: string;
    movies: GenericMovie;
}

const sortMoviesByUserWeights = async () => {

}