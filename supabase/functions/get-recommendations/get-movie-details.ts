import { DetailedMovie, GenericMovie, TmdbData } from "../_shared/properties.ts";
import { ExtraMovieDetails, MovieDetailsResponse } from "./detail-properties.ts";
import fetchMovieDetails from "./fetch-movie-details.ts";

const getMovieDetails = async (tmdbData: TmdbData, selectedGenericMovies: GenericMovie[]) => {
	const moviePromises: Promise<MovieDetailsResponse>[] = selectedGenericMovies.map((movie) => {
		const details = fetchMovieDetails(tmdbData, movie.id);
		return details;
	});

	// Wait for all promises to resolve
	const highlyDetailedMovies = await Promise.all(moviePromises);

	// only store the details needed
	const detailedMovies: ExtraMovieDetails[] = highlyDetailedMovies.map((highlyDetailedMovie: MovieDetailsResponse) => {
		console.log(`runtime: ${highlyDetailedMovie.runtime}, keywords: ${highlyDetailedMovie.keywords}`);
		return {
			id: highlyDetailedMovie.id,
			runtime: highlyDetailedMovie.runtime,
			keywords: highlyDetailedMovie.keywords
		}
	});

	return detailedMovies;

	// // Extract only the needed properties (cast and runtime)
	// return highlyDetailedMovies.map((movieDetail: MovieDetailsResponse) => ({
	// 	id: movieDetail.id,
	// 	runtime: movieDetail.runtime,
	// 	cast: movieDetail.credits?.cast || [],  // if there are no cast (actors), initialize with an empty array
	// 	keywords: movieDetail.keywords
	// }));
};

export default getMovieDetails;