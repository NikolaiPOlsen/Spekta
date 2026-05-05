import { GenericMovie, GenericMovieAPIFetch } from "../_shared/properties.ts";

const convertDiscoverResponseToGenericMovie = (discoverResponse: GenericMovieAPIFetch[]) => {
	// use the GenericMovie type to handle data easier
	const genericMovies: GenericMovie[] = [];

	discoverResponse.forEach((movie: GenericMovieAPIFetch) => {
		const genericMovie: GenericMovie = {
			adult: movie.adult,
			backdropPath: movie.backdrop_path,
			genreIds: movie.genre_ids,
			id: movie.id,
			title: movie.title,
			originalLanguage: movie.original_language,
			originalTitle: movie.original_title,
			overview: movie.overview,
			popularity: movie.popularity,
			posterPath: movie.poster_path,
			releaseDate: movie.release_date,
			video: movie.video,
			voteAverage: movie.vote_average,
			voteCount: movie.vote_count
		}

		genericMovies.push(genericMovie);
	});

	return genericMovies;
}

export default convertDiscoverResponseToGenericMovie;