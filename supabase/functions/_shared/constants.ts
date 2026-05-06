/**
 * The number of values to be specified in a URL parameter.
 * 
 * This constant defines how many values will be included in a URL parameter for requests in get-recommendations. For example,
 * if `APIRequestParameterAmount` is set to 3, the URL would look like:
 * `/?with_items=5|3|9`
 * 
 * **Note:** This determines how many weights will be used to specify movies from the API
 * 
 * @constant {number} APIRequestParameterAmount
 * @default 5
 */
export const APIRequestParameterAmount = 5;

/**
 * The min page number to fetch from API.
 * 
 * @constant {number} APIRequestRandomPageMin
 * @default 1
 */
export const APIRequestRandomPageMin = 1;

/**
 * The max page number to fetch from API. TMDB valid range [1, 500]
 * 
 * @constant {number} APIRequestRandomPageMax
 * @default 1
 */
export const APIRequestRandomPageMax = 100;

/**
 * Default sorting. Results in the most popular results on page 1.
 * 
 * @constant {string} APIRequestDefaultSortingMethod
 * @default "popularity.desc"
 */
export const APIRequestDefaultSortingMethod = "popularity.desc";

/**
 * Defines how many movies of the array of 20 movies (from /details) that should have extra details fetched
 * 
 * @constant {number} ApiDetailsMovieAmount
 * @default 5
 */
export const ApiDetailsMovieAmount = 5;

/**
 * Url query parameter for /details
 * 
 * @constant {number} ApiDetailsVoteCountMinimum
 * @default 10
 */
export const ApiDetailsVoteCountMinimum = 10;