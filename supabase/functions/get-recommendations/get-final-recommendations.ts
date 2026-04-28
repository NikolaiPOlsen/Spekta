import getMovieDetails from "./get-movie-details.ts";
import { APIDetailsMovieAmount } from "../_shared/constants.ts";
import { DetailedMovie, GenericMovie, tmdbData } from "../_shared/properties.ts";
import { MovieDetailsResponse } from "./detail-properties.ts";

const getFinalRecommendations = async (tmdbData: tmdbData, genericMovies: GenericMovie[]) => {
    const results: DetailedMovie[] = [];

    const sortedGenericMovies = genericMovies.sort((movieA, movieB) => {
        const estimatedQualityA = (movieA.voteAverage * movieA.voteCount * movieA.popularity) / 100;
        const estimatedQualityB = (movieB.voteAverage * movieB.voteCount * movieB.popularity) / 100;

        return estimatedQualityB - estimatedQualityA;
    });

    const highestQualityMovies = sortedGenericMovies.slice(0, APIDetailsMovieAmount);

    const fetchMovieDetails = async () => {
        const moviePromises: Promise<MovieDetailsResponse>[] = highestQualityMovies.map((movie) => {
            console.log(`Fetching details for movie ${movie.id}`);
            return getMovieDetails(tmdbData, movie.id);
        });

        // Wait for all promises to resolve
        const highlyDetailedMovies = await Promise.all(moviePromises);
        // Extract only the needed properties (cast and runtime)
        return highlyDetailedMovies.map((movieDetail: MovieDetailsResponse) => ({
            id: movieDetail.id,
            title: movieDetail.title,
            runtime: movieDetail.runtime,
            cast: movieDetail.credits?.cast || []  // If there are no cast members, we provide an empty array
        }));
    };

    const movieDetails = await fetchMovieDetails();

    for (let index = 0; index < highestQualityMovies.length; index++) {
        const genericMovie = highestQualityMovies[index];
        const highlyDetailedMovie = movieDetails[index];

        if (genericMovie.id != highlyDetailedMovie.id) {
            throw new Error("Movie ids do not match");
        }

        const actorIds: number[] = [];

        highlyDetailedMovie.cast.forEach(actor => {
            actorIds.push(actor.id);
        });

        const detailedMovie: DetailedMovie = {
            ...genericMovie,
            actorIds: actorIds,
            runtime: highlyDetailedMovie.runtime ?? -1
        };

        results.push(detailedMovie);
    }

    const remainingMovies = sortedGenericMovies.slice(APIDetailsMovieAmount);
    results.push(...remainingMovies);

    console.log(`Final results: ${results.length}`);
    console.log(`Final results example: ${results[0].title}`);

    return results;
};

export default getFinalRecommendations;