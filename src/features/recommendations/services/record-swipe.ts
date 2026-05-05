import { supabase } from '@/lib/supabase';

import type { RecommendationMovie, SwipeParameter } from '../types';

type RecordSwipePayload = {
	tmdb_id: string;
	liked: boolean;
	parameters: SwipeParameter[];
};

function buildParameterArray(type: string, ids: number[]) {
	const parameterArray: SwipeParameter[] = [];

	ids.forEach(id => {
		parameterArray.push(
			{
				parameter_type: type,
				parameter_value: String(id)
			}
		);
	});

	return parameterArray;
}

function buildSwipeParameters(movie: RecommendationMovie): SwipeParameter[] {
	const genreIds: number[] = movie.genreIds;
	// const actorIds: number[] | undefined = movie.actorIds;
	const keywordIds: number[] = movie.genreIds;
	const releaseDate: string | null = movie.releaseDate;
	const runtime: number | undefined = movie.runtime;

	const swipeParameters: SwipeParameter[] = [];

	// genre parameter
	if (genreIds) {
		// this takes the array returned from buildParameterArray and copies it into swipeParameters (shallow copy)
		swipeParameters.push(...buildParameterArray("genre", genreIds));
	}

	// actors, does not run if movie.actorIds is undefined
	// if (actorIds) {
	// 	swipeParameters.push(...buildParameterArray("actor", actorIds));
	// }

	// keywords
	if (keywordIds) {
		swipeParameters.push(...buildParameterArray("keyword", keywordIds));
	}

	if (releaseDate) {

	}

	if (runtime) {

	}

	return swipeParameters;
}

export async function recordSwipe(movie: RecommendationMovie, liked: boolean): Promise<void> {
	const swipeParameters = buildSwipeParameters(movie);

	const payload: RecordSwipePayload = {
		tmdb_id: String(movie.id),
		liked,
		parameters: swipeParameters
	};

	const { error } = await supabase.functions.invoke('record-swipe', {
		body: payload,
	});

	if (error) {
		throw new Error(error.message || 'Failed to record swipe');
	}
}
