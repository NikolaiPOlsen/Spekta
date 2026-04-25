export type UpdateWeightOptions = {
  liked: boolean;
  learningRate?: number;
  addRandomness?: boolean;
};

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

export function clampWeight(weight: number) {
  return Math.max(-1, Math.min(1, weight));
}