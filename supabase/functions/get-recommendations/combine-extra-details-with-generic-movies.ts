import { DetailedMovie, GenericMovie } from "../_shared/properties.ts";
import { ExtraMovieDetails } from "./detail-properties.ts";

const combineExtraDetailsWithGenericMovies = (genericMovies: GenericMovie[], extraMovieDetailsArray: ExtraMovieDetails[]) => {
    const detailedMovies: DetailedMovie[] = [];

    // could be optimized by only looping for ApiDetailsMovieAmount (default: 5) iterations
    genericMovies.forEach(genericMovie => {
        const extraMovieDetails = extraMovieDetailsArray.find(movie => movie.id == genericMovie.id);

        if (extraMovieDetails) {
            if (genericMovie.id != extraMovieDetails.id) {
                throw new Error("Movie ids between generic movie and extra details do not match");
            }

            const actorIds: number[] = [];
            const keywordIds: number[] = [];

            // get the actor ids (!_ popularity?)
            extraMovieDetails.cast.forEach(actor => {
                actorIds.push(actor.id);
            });

            // get the keyword ids
            extraMovieDetails.keywords.keywords.forEach(keywordObject => {
                keywordIds.push(keywordObject.id);
            });

            const detailedMovie: DetailedMovie = {
                ...genericMovie,
                runtime: extraMovieDetails.runtime ?? -1, // placeholder -1 if no runtime
                actorIds: actorIds,
                keywordIds: keywordIds
            }

            // first few movies have extra details
            detailedMovies.push(detailedMovie);
        }

        // only first few movies have extra details, so just add the generic movie
        detailedMovies.push(genericMovie);
    });

    return detailedMovies;
}

export default combineExtraDetailsWithGenericMovies;