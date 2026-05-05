import fetchMovieDetails from "./fetch-movie-details.ts";
import { ApiDetailsMovieAmount } from "../_shared/constants.ts";
import { DetailedMovie, GenericMovie, tmdbData } from "../_shared/properties.ts";
import { MovieDetailsResponse } from "./detail-properties.ts";

const getFinalRecommendations = async (tmdbData: tmdbData, genericMovies: GenericMovie[]) => {
    const results: DetailedMovie[] = [];




    // const getMovieDetails = async () => {
    //     const moviePromises: Promise<MovieDetailsResponse>[] = highestQualityMovies.map((movie) => {
    //         // console.log(`Fetching details for movie ${movie.id}`);
    //         // sort actors, e.g. top 5 by popularity
    //         // use keywords
    //         const details = fetchMovieDetails(tmdbData, movie.id);
    //         return details;
    //     });

    //     // Wait for all promises to resolve
    //     const highlyDetailedMovies = await Promise.all(moviePromises);

    //     // Extract only the needed properties (cast and runtime)
    //     return highlyDetailedMovies.map((movieDetail: MovieDetailsResponse) => ({
    //         id: movieDetail.id,
    //         title: movieDetail.title,
    //         runtime: movieDetail.runtime,
    //         cast: movieDetail.credits?.cast || [],  // if there are no cast (actors), initialize with an empty array
    //         keywords: movieDetail.keywords
    //     }));
    // };

    const movieDetails = await getMovieDetails();

    for (let index = 0; index < highestQualityMovies.length; index++) {
        const genericMovie = highestQualityMovies[index];
        const highlyDetailedMovie = movieDetails[index];

        if (genericMovie.id != highlyDetailedMovie.id) {
            throw new Error("Movie ids do not match");
        }

        const actorIds: number[] = [];
        const keywordIds: number[] = [];

        highlyDetailedMovie.cast.forEach(actor => {
            actorIds.push(actor.id);
        });

        highlyDetailedMovie.keywords.keywords.forEach(keywordObject => {
            keywordIds.push(keywordObject.id);
        });

        const detailedMovie: DetailedMovie = {
            ...genericMovie,
            actorIds: actorIds,
            runtime: highlyDetailedMovie.runtime ?? -1,
            keywordIds: keywordIds
        };

        results.push(detailedMovie);
    }

    const remainingMovies = sortedGenericMovies.slice(ApiDetailsMovieAmount);
    results.push(...remainingMovies);

    // console.log(`Final results: ${results.length}`);
    // console.log(`Final results example: ${results[0].title}`);

    return results;
};

export default getFinalRecommendations;