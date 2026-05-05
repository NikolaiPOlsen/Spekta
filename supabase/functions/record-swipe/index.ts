import { serve } from "https://deno.land/std@0.224.0/http/server.js";
import { createUserClient } from "../_shared/supabase-create-client.ts";
import { validateRecordSwipeBody } from "./validate-body.ts";
import { saveSeenMedia } from "./save-seen-media.ts";
import { ensureParameters } from "./ensure-parameters.ts";
import { ensureUserWeights } from "./ensure-user-weights.ts";
import { updateUserWeights } from "./update-user-weights.ts";

serve(async (req) => {
  try {
    const supabase = createUserClient(req);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = validateRecordSwipeBody(await req.json());
    const tmdbId = Number(body.tmdb_id);

    if (!Number.isInteger(tmdbId)) {
      return new Response(
        JSON.stringify({ error: "tmdb_id must be a valid integer" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    await saveSeenMedia({
      supabase,
      userId: user.id,
      tmdbId,
    });

    const matchingParameters = await ensureParameters({
      supabase,
      requestedParameters: body.parameters,
    });

    const parameterIds = matchingParameters.map((parameter) => parameter.id);

    await ensureUserWeights({
      supabase,
      userId: user.id,
      parameterIds,
    });

    const updatedWeights = await updateUserWeights({
      supabase,
      userId: user.id,
      parameterIds,
      liked: body.liked,
    });

    return new Response(
      JSON.stringify({
        message: "Swipe recorded",
        tmdb_id: tmdbId,
        liked: body.liked,
        matched_parameters: matchingParameters.length,
        updated_parameters: updatedWeights.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    const status =
      message.startsWith("Invalid body") ? 400 : 500;

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});