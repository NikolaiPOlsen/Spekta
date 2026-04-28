export type UpdateWeightOptions = {
  liked: boolean;
  learningRate?: number;
  addRandomness?: boolean;
};

/**
 * Updates a parameter weight after a user swipe.
 *
 * Likes move the weight closer to 1.
 * Dislikes move the weight closer to -1.
 * The closer the weight already is to either limit, the smaller the change becomes.
 *
 * @property currentWeight - Current stored user weight for the parameter.
 * @property liked - Whether the user liked the movie.
 * @property learningRate - Controls how strongly each swipe affects the weight.
 * @property addRandomness - If true, slightly randomizes the update strength.
 *
 * @returns The updated weight before clamping.
 */
export function updateWeight(
  currentWeight: number,
  {
    liked,
    learningRate = 0.1,
    addRandomness = false,
  }: UpdateWeightOptions,
) {
  const direction = liked ? 1 : -1;

  const distanceToLimit = liked
    ? 1 - currentWeight
    : 1 + currentWeight;

  const randomnessMultiplier = addRandomness
    ? 0.85 + Math.random() * 0.3
    : 1;

  const change =
    direction * learningRate * distanceToLimit * randomnessMultiplier;

  return currentWeight + change;
}

/**
 * Keeps a parameter weight inside the allowed recommendation range.
 *
 * @property weight - Weight value to clamp.
 *
 * @returns A value between -1 and 1.
 */
export function clampWeight(weight: number) {
  return Math.max(-1, Math.min(1, weight));
}