/**
 * Supabase browser client — singleton.
 *
 * Uses validated environment variables from env.ts.
 * This module should be the ONLY place that calls createClient().
 */
import { createClient } from "@supabase/supabase-js";
import { validatePublicEnv } from "./env";

const env = validatePublicEnv();

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
