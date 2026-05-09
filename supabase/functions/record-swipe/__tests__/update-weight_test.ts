import {
  assertAlmostEquals,
  assertEquals,
} from "https://deno.land/std@0.203.0/assert/mod.ts";
import { clampWeight, updateWeight } from "../update-weight.ts";

Deno.test("updateWeight moves liked and disliked weights in the expected direction", () => {
  assertAlmostEquals(updateWeight(0, { liked: true, learningRate: 0.1 }), 0.25);
  assertAlmostEquals(updateWeight(0, { liked: false, learningRate: 0.1 }), -0.04);
});

Deno.test("updateWeight changes less when the weight is close to the limit", () => {
  assertAlmostEquals(updateWeight(0.8, { liked: true, learningRate: 0.1 }), 0.85);
  assertAlmostEquals(updateWeight(-0.8, { liked: false, learningRate: 0.1 }), -0.808);
});

Deno.test("updateWeight can be made deterministic when randomness is enabled", () => {
  const originalRandom = Math.random;
  Math.random = () => 0.5;

  try {
    assertAlmostEquals(
      updateWeight(0, { liked: true, learningRate: 0.1, addRandomness: true }),
      0.25,
    );
  } finally {
    Math.random = originalRandom;
  }
});

Deno.test("clampWeight keeps weights inside the allowed range", () => {
  assertEquals(clampWeight(2), 1);
  assertEquals(clampWeight(-2), -1);
  assertEquals(clampWeight(0.4), 0.4);
});
