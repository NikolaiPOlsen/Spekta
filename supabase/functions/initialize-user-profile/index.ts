import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleInitializeUserProfile } from "./handler.ts";

serve((req) => handleInitializeUserProfile(req));
