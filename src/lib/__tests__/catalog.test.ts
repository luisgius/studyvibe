import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase module before importing catalog
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();

vi.mock("../supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => {
      mockFrom(...args);
      return {
        select: (...selectArgs: unknown[]) => {
          mockSelect(...selectArgs);
          // Return an object that also has .eq() for chaining
          const result = mockSelect.getMockImplementation()?.(...selectArgs);
          if (result && typeof result === "object" && "then" in result) {
            // Direct promise result (no eq chaining needed)
            return result;
          }
          return {
            ...result,
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return mockEq.getMockImplementation()?.(...eqArgs);
            },
          };
        },
      };
    },
  },
}));

// Also mock env so supabase.ts doesn't throw
vi.mock("../env", () => ({
  validatePublicEnv: () => ({
    supabaseUrl: "https://test.supabase.co",
    supabaseAnonKey: "test-anon-key",
    appUrl: "http://localhost:3000",
  }),
}));

import {
  getAllTracks,
  getAllBackgrounds,
  getAllAmbientSounds,
  getSystemPresets,
} from "../catalog";

beforeEach(() => {
  vi.clearAllMocks();
  // Default: successful empty response
  mockSelect.mockReturnValue({ data: [], error: null });
  mockEq.mockReturnValue({ data: [], error: null });
});

describe("Catalog queries", () => {
  // T4.1
  it("T4.1: getAllTracks calls supabase.from('tracks').select('*')", async () => {
    await getAllTracks();
    expect(mockFrom).toHaveBeenCalledWith("tracks");
    expect(mockSelect).toHaveBeenCalledWith("*");
  });

  // T4.2
  it("T4.2: getAllBackgrounds calls supabase.from('backgrounds').select('*')", async () => {
    await getAllBackgrounds();
    expect(mockFrom).toHaveBeenCalledWith("backgrounds");
    expect(mockSelect).toHaveBeenCalledWith("*");
  });

  // T4.3
  it("T4.3: getAllAmbientSounds calls supabase.from('ambient_sounds').select('*')", async () => {
    await getAllAmbientSounds();
    expect(mockFrom).toHaveBeenCalledWith("ambient_sounds");
    expect(mockSelect).toHaveBeenCalledWith("*");
  });

  // T4.4
  it("T4.4: getSystemPresets calls supabase.from('presets').select('*').eq('is_system', true)", async () => {
    await getSystemPresets();
    expect(mockFrom).toHaveBeenCalledWith("presets");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("is_system", true);
  });

  // T4.5
  it("T4.5: successful response returns typed array", async () => {
    const mockTracks = [
      { id: "1", title: "Track 1", filename: "t1.mp3", duration_seconds: 180, tags: ["focus"], energy: 0.5, instruments: ["piano"], mood: ["calm"], genre: "classical" },
      { id: "2", title: "Track 2", filename: "t2.mp3", duration_seconds: 240, tags: ["relax"], energy: 0.3, instruments: ["guitar"], mood: ["peaceful"], genre: "ambient" },
    ];
    mockSelect.mockReturnValue({ data: mockTracks, error: null });
    const result = await getAllTracks();
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Track 1");
    expect(result[1].title).toBe("Track 2");
  });

  // T4.6
  it("T4.6: Supabase error returns empty array", async () => {
    mockSelect.mockReturnValue({
      data: null,
      error: { message: "network timeout" },
    });
    const result = await getAllTracks();
    expect(result).toEqual([]);
  });

  // T4.7
  it("T4.7: Supabase error logs to console.error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSelect.mockReturnValue({
      data: null,
      error: { message: "network timeout" },
    });
    await getAllBackgrounds();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch backgrounds:",
      "network timeout",
    );
    consoleSpy.mockRestore();
  });

  // T4.8
  it("T4.8: Supabase returns null data with no error → returns empty array", async () => {
    mockSelect.mockReturnValue({ data: null, error: null });
    const result = await getAllAmbientSounds();
    expect(result).toEqual([]);
  });

  // T4.9
  it("T4.9: Supabase returns empty array → returns empty array", async () => {
    mockSelect.mockReturnValue({ data: [], error: null });
    const result = await getAllTracks();
    expect(result).toEqual([]);
  });

  // T4.10
  it("T4.10: exception thrown during fetch → caught, returns empty array, logs error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSelect.mockImplementation(() => {
      throw new Error("unexpected network failure");
    });
    const result = await getAllTracks();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected error fetching tracks:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  // T4.11 — cover ambient_sounds error path
  it("T4.11: getAllAmbientSounds with Supabase error returns empty array and logs", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSelect.mockReturnValue({
      data: null,
      error: { message: "connection refused" },
    });
    const result = await getAllAmbientSounds();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch ambient sounds:",
      "connection refused",
    );
    consoleSpy.mockRestore();
  });

  // T4.12 — cover getSystemPresets error path
  it("T4.12: getSystemPresets with Supabase error returns empty array and logs", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockEq.mockReturnValue({
      data: null,
      error: { message: "timeout" },
    });
    const result = await getSystemPresets();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch system presets:",
      "timeout",
    );
    consoleSpy.mockRestore();
  });

  // T4.13 — cover getSystemPresets exception path
  it("T4.13: getSystemPresets exception → caught, returns empty array", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSelect.mockImplementation(() => {
      throw new Error("crash");
    });
    const result = await getSystemPresets();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected error fetching system presets:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
