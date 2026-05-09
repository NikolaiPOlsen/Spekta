import { ApiRequestTypeParameter, GetDiscoverApiRequestFunctionParameters, TmdbData } from "../../_shared/properties.ts";
import getDiscoverApiRequestUrlFromParameters from "../get-discover-api-request-url.ts";
import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { exponent } from "../parameter-utilities.ts";
import { ApiDetailsVoteCountMinimum, APIRequestRandomPageMax, APIRequestRandomPageMin } from "../../_shared/constants.ts";
import { ParameterTypeName } from "../../_shared/parameter-type-names.ts";

Deno.test("getDiscoverApiRequestUrlFromParameters correctly takes in parameters and produces an api request url from them", () => {

	// stub Math.random so test is deterministic
	const originalRandom = Math.random;
	Math.random = () => 0.4;

	const testDataParameters: ApiRequestTypeParameter[] = [
		{
			positive: true,
			type: "release_date",
			parameters: ["1960-1969", "2020-2029", "1980-1989", "1940-1949", "1970-1979"]
		},
		{
			positive: true,
			type: "runtime",
			parameters: ["60-89", "0-29", "90-119", "180-209", "210-239"]
		},
		{
			positive: true,
			type: "genre",
			parameters: ["47595", "72447", "64739", "39801", "34094"]
		},
		{
			positive: false,
			type: "genre",
			parameters: ["66095", "74904", "21750", "87986", "65640"]
		},
		{
			positive: false,
			type: "keyword",
			parameters: ["43003"]
		}
	];

	// test tmdb data
	const testTmdbData: TmdbData = {
		APIKey: "API_KEY",
		baseURL: "https://tmdb_base_url.test"
	};

	const getDiscoverApiRequestUrlOptions: GetDiscoverApiRequestFunctionParameters = {
		tmdbData: testTmdbData,
		parameters: testDataParameters,
		includeAdult: false,
		randomPage: true,
		randomSorting: true
	};

	// normally, user preferred language is used. here, we will test with language set to "LANGUAGE".
	getDiscoverApiRequestUrlOptions.languagePreference = "LANGUAGE";

	const expectedPreferredLanguage = getDiscoverApiRequestUrlOptions.languagePreference ?? "";
	const expectedIncludeAdult = String(getDiscoverApiRequestUrlOptions.includeAdult) ?? "false";

	const expectedPage = String(Math.floor((exponent(Math.random(), 2)) * APIRequestRandomPageMax) + APIRequestRandomPageMin);
	const expectedVoteCount = String(ApiDetailsVoteCountMinimum);

	const sortOptions = ["popularity.desc", "revenue.desc", "vote_count.desc", "primary_release_date.desc", "vote_average.desc"];
	const expectedSortingMethod = sortOptions[Math.floor(Math.random() * sortOptions.length)];

	// ["1960-1969", "2020-2029", "1980-1989", "1940-1949", "1970-1979"

	// smallest and largest year within the testing data
	const expectedReleaseDate = {
		greaterThanOrEqual: "1940",
		lessThanOrEqual: "2026" // for this test: not including movies that have not been released yet
	};

	// smallest and largest runtime (in minutes) within the testing data
	const expectedRuntime = {
		greaterThanOrEqual: "0",
		lessThanOrEqual: "239"
	};

	// const expectedUrl = `${testTmdbData.baseURL}?api_key=${testTmdbData.APIKey}&language=${getDiscoverApiRequestUrlOptions.languagePreference}&include_adult=${getDiscoverApiRequestUrlOptions.includeAdult}&page=${expectedPage}&vote_count.gte=${expectedVoteCount}&sort_by=vote_count.desc&primary_release_date.gte=1939-12-30&primary_release_date.lte=2026-05-08&with_runtime.gte=0&with_runtime.lte=239&with_genres=59369%7C61650%7C47595%7C66095%7C87986&with_genres=33156%7C68623%7C72447%7C21750%7C65640&with_keywords=64774`;

	try {
		const urlString: string = getDiscoverApiRequestUrlFromParameters(getDiscoverApiRequestUrlOptions);
		console.log(urlString);

		// use URLSearchParams to get the url parameters back out of the url string
		const url = new URL(urlString);
		const baseURL = url.hostname;
		const urlParameters = new URLSearchParams(url.search);

		// check if baseurl is used
		assertEquals(baseURL, new URL(testTmdbData.baseURL).host);

		for (const [key, value] of urlParameters.entries()) {
			// console.log(`${key} = ${value}`);

			switch (key) {
				case "api_key":
					assertEquals(value, testTmdbData.APIKey);
					break;

				case "language":
					assertEquals(value, expectedPreferredLanguage);
					break;

				case "include_adult":
					assertEquals(value, expectedIncludeAdult);
					break;

				case "page":
					assertEquals(value, expectedPage);
					break;

				case "vote_count.gte":
					assertEquals(value, expectedVoteCount);
					break;

				case "sort_by":
					assertEquals(value, expectedSortingMethod);
					break;

				case "primary_release_date.gte":
					// Check if release date is approximately as expected (same week, at this scale the exact day does not matter as much)
					const weekInMs = 1E3 * 3600 * 24 * 7;
					const valueUnixTimeWeek = Math.floor(new Date(value).getTime() / weekInMs);
					const expectedUnixTimeWeek = Math.floor(new Date(expectedReleaseDate.greaterThanOrEqual).getTime() / weekInMs);
					assertEquals(valueUnixTimeWeek, expectedUnixTimeWeek);
					break;

				case "primary_release_date.lte":
					// just check year (first part of date string: year-month-day)
					assertEquals(value.split("-")[0], expectedReleaseDate.lessThanOrEqual);
					break;

				case "with_runtime.gte":
					assertEquals(value, expectedRuntime.greaterThanOrEqual);
					break;

				case "with_runtime.lte":
					assertEquals(value, expectedRuntime.lessThanOrEqual);
					break;

				case "with_genres":
					// check if the positive genres are included
					const withGenres = testDataParameters.find(paramData => paramData.type == ParameterTypeName.Genre && paramData.positive);
					if (!withGenres) throw new Error("withGenres is undefined");
					const expectedwithGenres = withGenres.parameters;
					const actualwithGenres = value.split("|"); // separator is | (tmdb OR)

					expectedwithGenres.forEach(withGenre => {
						const matchingGenreInActualData = actualwithGenres.find(item => item === withGenre);
						assertEquals(matchingGenreInActualData, withGenre);
					});

					break;

				case "without_genres":
					const withoutGenres = testDataParameters.find(paramData => paramData.type == ParameterTypeName.Genre && !paramData.positive); // important: !paramData.positive for not positive parameter
					if (!withoutGenres) throw new Error("withoutGenres is undefined");
					const expectedwithoutGenres = withoutGenres.parameters;
					const actualwithoutGenres = value.split("|"); // separator is | (tmdb OR)

					expectedwithoutGenres.forEach(withoutGenre => {
						const matchingGenreInActualData = actualwithoutGenres.find(item => item === withoutGenre);
						assertEquals(matchingGenreInActualData, withoutGenre);
					});
					// check if the not positive genres are included
					break;

			}
		}


		assertEquals(true, true);

	} finally {

		// "finally" always runs, no matter if try worked or produced an error
		Math.random = originalRandom;
		console.log(`random value: ${Math.random()}`);
	}
});