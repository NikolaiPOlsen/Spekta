import getMovieDetails from "./get-movie-details.ts";
import { APIDetailsMovieAmount } from "../_shared/constants.ts";
import { DetailedMovie, GenericMovie, tmdbData } from "../_shared/properties.ts";
import { MovieDetailsResponse } from "./detail-properties.ts";

const getFinalRecommendations = async (tmdbData: tmdbData, genericMovies: GenericMovie[]) => {
    const results: DetailedMovie[] = [];

    const genericMoviesWithPosterPath: GenericMovie[] = [];

    genericMovies.forEach(movie => {
        // posterPath is either a string or null
        if (movie.posterPath) {
            genericMoviesWithPosterPath.push(movie);
        }
        // console.log(`title: ${movie.title} | poster: ${movie.posterPath}`);
    });

    const sortedGenericMovies = genericMoviesWithPosterPath.sort((movieA, movieB) => {
        const estimatedQualityA = (movieA.voteAverage * movieA.voteCount * movieA.popularity) / 100;
        const estimatedQualityB = (movieB.voteAverage * movieB.voteCount * movieB.popularity) / 100;

        return estimatedQualityB - estimatedQualityA;
    });

    const highestQualityMovies = sortedGenericMovies.slice(0, APIDetailsMovieAmount);

    const fetchMovieDetails = async () => {
        const moviePromises: Promise<MovieDetailsResponse>[] = highestQualityMovies.map((movie) => {
            // console.log(`Fetching details for movie ${movie.id}`);
            // sort actors, e.g. top 5 by popularity
            // use keywords
            const details = getMovieDetails(tmdbData, movie.id);
            return details;
        });

        // Wait for all promises to resolve
        const highlyDetailedMovies = await Promise.all(moviePromises);

        // Extract only the needed properties (cast and runtime)
        return highlyDetailedMovies.map((movieDetail: MovieDetailsResponse) => ({
            id: movieDetail.id,
            title: movieDetail.title,
            runtime: movieDetail.runtime,
            cast: movieDetail.credits?.cast || [],  // If there are no cast members, we provide an empty array
            keywords: movieDetail.keywords
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

    const remainingMovies = sortedGenericMovies.slice(APIDetailsMovieAmount);
    results.push(...remainingMovies);

    // console.log(`Final results: ${results.length}`);
    // console.log(`Final results example: ${results[0].title}`);

    return results;
};

export default getFinalRecommendations;