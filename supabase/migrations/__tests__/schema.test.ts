import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const migrationsDir = join(__dirname, "..");

function readMigration(filename: string): string {
  return readFileSync(join(migrationsDir, filename), "utf-8");
}

const createTablesSql = readMigration("001_create_tables.sql");
const indexesTriggersSql = readMigration("002_indexes_triggers.sql");
const rlsPoliciesSql = readMigration("003_rls_policies.sql");
const storageSql = readMigration("004_storage.sql");
const allSql = [createTablesSql, indexesTriggersSql, rlsPoliciesSql, storageSql].join("\n");

describe("Schema migrations", () => {
  // T2.1: Each SQL file contains valid SQL syntax (basic check)
  it("T2.1: all SQL files are non-empty and contain SQL keywords", () => {
    for (const sql of [createTablesSql, indexesTriggersSql, rlsPoliciesSql, storageSql]) {
      expect(sql.length).toBeGreaterThan(0);
      // Must contain at least one SQL statement keyword
      expect(sql).toMatch(/CREATE|ALTER|INSERT|DROP/i);
    }
  });

  // T2.2: All 5 table names present
  it("T2.2: all 5 tables are defined in migration files", () => {
    const tables = ["tracks", "backgrounds", "ambient_sounds", "presets", "session_history"];
    for (const table of tables) {
      expect(createTablesSql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  // T2.3: All columns from Architecture.md Sections 4.1-4.5
  it("T2.3: tracks table has all required columns", () => {
    const columns = [
      "id UUID PRIMARY KEY",
      "title TEXT NOT NULL",
      "filename TEXT NOT NULL",
      "duration_seconds INTEGER NOT NULL",
      "tags TEXT[]",
      "energy FLOAT NOT NULL",
      "instruments TEXT[]",
      "mood TEXT[]",
      "bpm_estimate INTEGER",
      "hz_base INTEGER",
      "best_for TEXT[]",
      "genre TEXT",
      "created_at TIMESTAMPTZ",
      "updated_at TIMESTAMPTZ",
    ];
    for (const col of columns) {
      expect(createTablesSql).toContain(col);
    }
  });

  it("T2.3: backgrounds table has all required columns", () => {
    const columns = [
      "title TEXT NOT NULL",
      "filename TEXT NOT NULL",
      "style TEXT NOT NULL",
      "scene_type TEXT NOT NULL",
      "time_of_day TEXT",
      "mood TEXT[]",
      "color_palette TEXT[]",
      "compatible_animations TEXT[]",
      "width INTEGER NOT NULL",
      "height INTEGER NOT NULL",
    ];
    for (const col of columns) {
      expect(createTablesSql).toContain(col);
    }
  });

  it("T2.3: ambient_sounds table has all required columns", () => {
    const columns = [
      "name TEXT NOT NULL",
      "category TEXT NOT NULL",
      "filename TEXT NOT NULL",
      "duration_seconds INTEGER NOT NULL",
      "is_loopable BOOLEAN",
      "tags TEXT[]",
      "icon TEXT",
    ];
    for (const col of columns) {
      expect(createTablesSql).toContain(col);
    }
  });

  it("T2.3: presets table has all required columns", () => {
    const columns = [
      "name TEXT NOT NULL",
      "description TEXT",
      "is_system BOOLEAN",
      "user_id UUID",
      "config JSONB NOT NULL",
      "thumbnail_url TEXT",
      "usage_count INTEGER",
    ];
    for (const col of columns) {
      expect(createTablesSql).toContain(col);
    }
  });

  it("T2.3: session_history table has all required columns", () => {
    const columns = [
      "user_id UUID",
      "config JSONB NOT NULL",
      "prompt_used TEXT",
      "duration_seconds INTEGER",
      "pomodoro_cycles_completed INTEGER",
      "started_at TIMESTAMPTZ",
      "ended_at TIMESTAMPTZ",
    ];
    for (const col of columns) {
      expect(createTablesSql).toContain(col);
    }
  });

  // T2.4: All GIN indexes defined
  it("T2.4: all GIN indexes from Architecture Section 4.6 are defined", () => {
    const ginIndexes = [
      "idx_tracks_tags",
      "idx_tracks_instruments",
      "idx_tracks_mood",
      "idx_tracks_best_for",
      "idx_backgrounds_mood",
      "idx_backgrounds_compatible_animations",
      "idx_ambient_sounds_tags",
      "idx_presets_config",
    ];
    for (const idx of ginIndexes) {
      expect(indexesTriggersSql).toContain(idx);
      expect(indexesTriggersSql).toContain("USING GIN");
    }
  });

  // T2.5: All B-tree indexes defined
  it("T2.5: all B-tree indexes from Architecture Section 4.6 are defined", () => {
    const btreeIndexes = [
      "idx_tracks_genre",
      "idx_tracks_energy",
      "idx_backgrounds_scene_type",
      "idx_backgrounds_time_of_day",
      "idx_ambient_sounds_category",
      "idx_presets_user_id",
      "idx_presets_is_system",
      "idx_session_history_user_id",
    ];
    for (const idx of btreeIndexes) {
      expect(indexesTriggersSql).toContain(idx);
    }
  });

  // T2.6: Unique constraints on filename columns
  it("T2.6: unique constraints exist on filename columns", () => {
    expect(indexesTriggersSql).toContain("uq_tracks_filename");
    expect(indexesTriggersSql).toContain("uq_backgrounds_filename");
    expect(indexesTriggersSql).toContain("uq_ambient_sounds_filename");
  });

  // T2.7: RLS enabled on all 5 tables
  it("T2.7: RLS is enabled on all 5 tables", () => {
    const tables = ["tracks", "backgrounds", "ambient_sounds", "presets", "session_history"];
    for (const table of tables) {
      expect(rlsPoliciesSql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
  });

  // T2.8: Catalog tables have SELECT-only policies for anon
  it("T2.8: catalog tables have SELECT policies for anon", () => {
    expect(rlsPoliciesSql).toContain('"tracks_select_all"');
    expect(rlsPoliciesSql).toContain('"backgrounds_select_all"');
    expect(rlsPoliciesSql).toContain('"ambient_sounds_select_all"');

    // Verify these are FOR SELECT with anon access
    for (const table of ["tracks", "backgrounds", "ambient_sounds"]) {
      const pattern = new RegExp(
        `CREATE POLICY "${table}_select_all"[\\s\\S]*?FOR SELECT[\\s\\S]*?TO anon, authenticated`,
      );
      expect(rlsPoliciesSql).toMatch(pattern);
    }
  });

  // T2.9: Presets have user-scoped write policies
  it("T2.9: presets table has user-scoped write policies", () => {
    expect(rlsPoliciesSql).toContain('"presets_insert"');
    expect(rlsPoliciesSql).toContain('"presets_update"');
    expect(rlsPoliciesSql).toContain('"presets_delete"');

    // All presets write policies reference auth.uid()
    const presetsSection = rlsPoliciesSql.slice(
      rlsPoliciesSql.indexOf("presets: read system"),
    );
    expect(presetsSection).toContain("auth.uid()");
  });

  // T2.10: Session history has user-scoped read/write policies
  it("T2.10: session_history has user-scoped policies", () => {
    expect(rlsPoliciesSql).toContain('"session_history_select"');
    expect(rlsPoliciesSql).toContain('"session_history_insert"');
    expect(rlsPoliciesSql).toContain('"session_history_update"');

    // All session_history policies reference auth.uid()
    const sessionSection = rlsPoliciesSql.slice(
      rlsPoliciesSql.indexOf("session_history: read/write"),
    );
    expect(sessionSection).toContain("auth.uid()");
  });

  // T2.11: Trigger function defined
  it("T2.11: update_updated_at_column() trigger function is defined", () => {
    expect(indexesTriggersSql).toContain("CREATE OR REPLACE FUNCTION update_updated_at_column()");
    expect(indexesTriggersSql).toContain("RETURNS TRIGGER");
    expect(indexesTriggersSql).toContain("NEW.updated_at = now()");
  });

  // T2.12: Triggers attached to tracks and presets
  it("T2.12: triggers are attached to tracks and presets tables", () => {
    expect(indexesTriggersSql).toContain("trg_tracks_updated_at");
    expect(indexesTriggersSql).toContain("ON tracks FOR EACH ROW");
    expect(indexesTriggersSql).toContain("trg_presets_updated_at");
    expect(indexesTriggersSql).toContain("ON presets FOR EACH ROW");
  });
});
