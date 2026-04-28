import { RecordSwipeBody } from "../_shared/properties.ts";

/**
 * Validates the request body for the record-swipe Edge Function.
 *
 * Expected body:
 * {
 *   tmdb_id: string;
 *   liked: boolean;
 *   parameters: SwipeParameter[];
 * }
 *
 * @property body - Unknown request body parsed from JSON.
 *
 * @returns A validated RecordSwipeBody object.
 *
 * @throws Error if the body is missing required fields or has invalid types.
 */
export function validateRecordSwipeBody(body: unknown): RecordSwipeBody {
  const parsed = body as Partial<RecordSwipeBody>;

  if (!parsed.tmdb_id || typeof parsed.tmdb_id !== "string") {
    throw new Error("Invalid body: tmdb_id must be a string");
  }

  if (typeof parsed.liked !== "boolean") {
    throw new Error("Invalid body: liked must be a boolean");
  }

  if (!Array.isArray(parsed.parameters)) {
    throw new Error("Invalid body: parameters must be an array");
  }

  for (const parameter of parsed.parameters) {
    if (
      !parameter ||
      typeof parameter.parameter_type !== "string" ||
      typeof parameter.parameter_value !== "string"
    ) {
      throw new Error(
        "Invalid body: each parameter must have parameter_type and parameter_value",
      );
    }
  }

  return parsed as RecordSwipeBody;
}