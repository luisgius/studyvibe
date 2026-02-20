/**
 * Environment variable validation — runs at startup.
 * Throws descriptive errors if required variables are missing or invalid.
 *
 * Only validates NEXT_PUBLIC_* vars on the client side.
 * Server-side vars (SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY) are
 * validated in the API routes that need them.
 */

interface PublicEnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appUrl: string;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value === null) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env.local file. See .env.local.example for reference.`
    );
  }

  if (value.trim() === "") {
    throw new Error(
      `Environment variable ${name} is set but empty. ` +
        `It must have a non-empty value.`
    );
  }

  return value.trim();
}

export function validatePublicEnv(): PublicEnvConfig {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!isValidUrl(supabaseUrl)) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must be a valid URL. ` +
        `Got: "${supabaseUrl}". Expected format: https://your-project.supabase.co`
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    appUrl,
  };
}

/**
 * Validates server-side environment variables.
 * Call this only in API routes or server components.
 */
export function validateServerEnv(): {
  serviceRoleKey: string;
  anthropicApiKey: string;
} {
  return {
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    anthropicApiKey: requireEnv("ANTHROPIC_API_KEY"),
  };
}
