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