export interface MovieDetailsResponse {
    adult: boolean;
    backdrop_path: string | null;
    belongs_to_collection: BelongsToCollection | null;
    budget: number;
    genres: Genre[];
    homepage: string | null;
    id: number;
    imdb_id: string | null;
    original_language: string;
    original_title: string;
    overview: string | null;
    popularity: number;
    poster_path: string | null;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    release_date: string;
    revenue: number;
    runtime: number | null;
    spoken_languages: SpokenLanguage[];
    status: string;
    tagline: string | null;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    keywords: { keywords: Keyword[] };
    credits: Credits;
}

export interface BelongsToCollection {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
}

export interface Genre {
    id: number;
    name: string;
}

export interface ProductionCompany {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

export interface SpokenLanguage {
    iso_639_1: string;
    name: string;
}

export interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
}

export interface Keyword {
    id: number;
    name: string;
}

export interface CastMember {
    cast_id: number;
    character: string;
    credit_id: string;
    id: number;
    name: string;
    order: number;
    profile_path: string | null;
}

export interface CrewMember {
    credit_id: string;
    department: string;
    gender: number | null;
    id: number;
    job: string;
    name: string;
    profile_path: string | null;
}

export interface ExtraMovieDetails {
    id: number;
    runtime: number | null;
    cast: CastMember[];
    keywords: {
        keywords: Keyword[];
    };
}