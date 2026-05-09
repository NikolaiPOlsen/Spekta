import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.203.0/assert/mod.ts";
import { validateRecordSwipeBody } from "../validate-body.ts";

Deno.test("validateRecordSwipeBody accepts a valid record swipe body", () => {
  const body = {
    tmdb_id: "123",
    liked: true,
    parameters: [
      { parameter_type: "genre", parameter_value: "28" },
      { parameter_type: "runtime", parameter_value: "90-119" },
    ],
  };

  const result = validateRecordSwipeBody(body);

  assertEquals(result, body);
});

Deno.test("validateRecordSwipeBody rejects invalid top-level fields", () => {
  assertThrows(
    () => validateRecordSwipeBody({ liked: true, parameters: [] }),
    Error,
    "tmdb_id must be a string",
  );

  assertThrows(
    () => validateRecordSwipeBody({ tmdb_id: "123", liked: "true", parameters: [] }),
    Error,
    "liked must be a boolean",
  );

  assertThrows(
    () => validateRecordSwipeBody({ tmdb_id: "123", liked: true }),
    Error,
    "parameters must be an array",
  );
});

Deno.test("validateRecordSwipeBody rejects invalid swipe parameters", () => {
  assertThrows(
    () =>
      validateRecordSwipeBody({
        tmdb_id: "123",
        liked: false,
        parameters: [{ parameter_type: "genre" }],
      }),
    Error,
    "each parameter must have parameter_type and parameter_value",
  );
});
