import getMovieDetails from "./get-movie-details.ts";
import { APIDetailsMovieAmount } from "../_shared/constants.ts";
import { DetailedMovie, GenericMovie, tmdbData } from "../_shared/properties.ts";

const getFinalRecommendations = (tmdbData: tmdbData, genericMovies: GenericMovie[]) => {
    const results: DetailedMovie[] = [];

    const sortedGenericMovies = genericMovies.sort((movieA, movieB) => {
        const estimatedQualityA = (movieA.voteAverage * movieA.voteCount * movieA.popularity) / 100;
        const estimatedQualityB = (movieB.voteAverage * movieB.voteCount * movieB.popularity) / 100;

        return estimatedQualityB - estimatedQualityA;
    });

    const highestQualityMovies = sortedGenericMovies.splice(0, APIDetailsMovieAmount);

    const fetchMovieDetails = async () => {
        const moviePromises: Promise<DetailedMovie>[] = [];

        highestQualityMovies.forEach((movie) => {
            const promise = getMovieDetails(tmdbData, movie.id);
            moviePromises.push(promise);
        });

        const movieDetails = await Promise.all(moviePromises);
        results.push(...movieDetails);
    };

    fetchMovieDetails();

    highestQualityMovies.forEach(movie => {
        // const notDetailedMovie: DetailedMovie = {
        //     ...movie
        // };

        results.push(movie);
    });

    return results;
}