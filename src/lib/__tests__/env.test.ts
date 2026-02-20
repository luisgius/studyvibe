import { describe, it, expect, vi, beforeEach } from "vitest";
import { validatePublicEnv, validateServerEnv } from "../env";

describe("validatePublicEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // T1.1: Missing NEXT_PUBLIC_SUPABASE_URL throws with descriptive message
  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    expect(() => validatePublicEnv()).toThrow("NEXT_PUBLIC_SUPABASE_URL");
    expect(() => validatePublicEnv()).toThrow("Missing required environment variable");
  });

  // T1.2: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY throws with descriptive message
  it("throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => validatePublicEnv()).toThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(() => validatePublicEnv()).toThrow("Missing required environment variable");
  });

  // T1.3: Both present → returns valid config object
  it("returns validated config when all vars are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key-12345";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    const config = validatePublicEnv();

    expect(config).toEqual({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "test-anon-key-12345",
      appUrl: "http://localhost:3000",
    });
  });

  // T1.4: Invalid URL format throws with helpful message
  it("throws when NEXT_PUBLIC_SUPABASE_URL is not a valid URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    expect(() => validatePublicEnv()).toThrow("must be a valid URL");
    expect(() => validatePublicEnv()).toThrow("not-a-url");
  });

  // T1.5: Empty string values throw
  it("throws when values are empty strings", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

    expect(() => validatePublicEnv()).toThrow("empty");
  });

  it("throws when anon key is empty string", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "   ";

    expect(() => validatePublicEnv()).toThrow("empty");
  });

  it("uses default app URL when NEXT_PUBLIC_APP_URL is not set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    delete process.env.NEXT_PUBLIC_APP_URL;

    const config = validatePublicEnv();
    expect(config.appUrl).toBe("http://localhost:3000");
  });
});

describe("validateServerEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns server config when all vars present", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";

    const config = validateServerEnv();
    expect(config.serviceRoleKey).toBe("service-role-key");
    expect(config.anthropicApiKey).toBe("sk-ant-test");
  });

  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";

    expect(() => validateServerEnv()).toThrow("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("throws when ANTHROPIC_API_KEY is missing", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    delete process.env.ANTHROPIC_API_KEY;

    expect(() => validateServerEnv()).toThrow("ANTHROPIC_API_KEY");
  });
});
