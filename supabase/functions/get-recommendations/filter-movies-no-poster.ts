import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GenericMovie } from "../_shared/properties.ts";

const filterMoviesWithoutPosterPath = (genericMovies: GenericMovie[]) => {
    const genericMoviesWithPosterPath: GenericMovie[] = [];

    genericMovies.forEach(movie => {
        // posterPath is either a string or null
        if (movie.posterPath) {
            genericMoviesWithPosterPath.push(movie);
        }
        // console.log(`title: ${movie.title} | poster: ${movie.posterPath}`);
    });

	return genericMoviesWithPosterPath;
}

export default filterMoviesWithoutPosterPath;