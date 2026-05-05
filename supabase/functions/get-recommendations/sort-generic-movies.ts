import { GenericMovie } from "../_shared/properties.ts";

const sortGenericMovies = (genericMovies: GenericMovie[]) => {
    const sortedGenericMovies = genericMovies.sort((movieA, movieB) => {
        const estimatedQualityA = (movieA.voteAverage * movieA.voteCount * movieA.popularity);
        const estimatedQualityB = (movieB.voteAverage * movieB.voteCount * movieB.popularity);

        return estimatedQualityB - estimatedQualityA;
    });

    return sortedGenericMovies;
}

export default sortGenericMovies;