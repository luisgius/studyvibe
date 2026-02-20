/**
 * Catalog query functions — typed wrappers around Supabase reads.
 *
 * All functions return empty arrays on error (never throw to UI).
 * Errors are logged to console for debugging.
 */
import { supabase } from "./supabase";
import type { Track, Background, AmbientSound, Preset } from "./validation";

export async function getAllTracks(): Promise<Track[]> {
  try {
    const { data, error } = await supabase.from("tracks").select("*");
    if (error) {
      console.error("Failed to fetch tracks:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("Unexpected error fetching tracks:", e);
    return [];
  }
}

export async function getAllBackgrounds(): Promise<Background[]> {
  try {
    const { data, error } = await supabase.from("backgrounds").select("*");
    if (error) {
      console.error("Failed to fetch backgrounds:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("Unexpected error fetching backgrounds:", e);
    return [];
  }
}

export async function getAllAmbientSounds(): Promise<AmbientSound[]> {
  try {
    const { data, error } = await supabase.from("ambient_sounds").select("*");
    if (error) {
      console.error("Failed to fetch ambient sounds:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("Unexpected error fetching ambient sounds:", e);
    return [];
  }
}

export async function getSystemPresets(): Promise<Preset[]> {
  try {
    const { data, error } = await supabase
      .from("presets")
      .select("*")
      .eq("is_system", true);
    if (error) {
      console.error("Failed to fetch system presets:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("Unexpected error fetching system presets:", e);
    return [];
  }
}
