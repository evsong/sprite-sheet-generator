/**
 * Filename auto-tagging parser.
 *
 * Parses sprite filenames using a regex with named capture groups
 * (e.g. `(?<name>.+?)[-_](?<index>\d+)`) and returns a tag map.
 *
 * Common patterns:
 *   hero_idle_01.png  -> { name: "hero", action: "idle", index: "01" }
 *   hero-walk-03.png  -> { name: "hero", action: "walk", index: "03" }
 */

export interface ParsedFilename {
  /** Original filename without extension */
  raw: string;
  /** Extracted named groups (empty if pattern didn't match) */
  tags: Record<string, string>;
}

/**
 * Parse a single filename against a regex pattern with named capture groups.
 */
export function parseFilename(
  filename: string,
  pattern: string,
): ParsedFilename {
  // Strip extension
  const raw = filename.replace(/\.[^.]+$/, "");

  try {
    const regex = new RegExp(pattern);
    const match = regex.exec(raw);
    if (match?.groups) {
      // Filter out undefined values from optional groups
      const tags: Record<string, string> = {};
      for (const [k, v] of Object.entries(match.groups)) {
        if (v !== undefined) tags[k] = v;
      }
      return { raw, tags };
    }
  } catch {
    // Invalid regex -- return empty tags silently
  }

  return { raw, tags: {} };
}

/**
 * Group sprite IDs by a specific tag value.
 *
 * Returns a map of tagValue -> spriteId[].
 * Sprites without the specified tag key are grouped under `"_untagged"`.
 */
export function groupByTag(
  sprites: Array<{ id: string; tags?: Record<string, string> }>,
  tagKey: string,
): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  for (const sprite of sprites) {
    const value = sprite.tags?.[tagKey] ?? "_untagged";
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value)!.push(sprite.id);
  }

  return groups;
}

/**
 * Auto-group sprites by all detected tags.
 * Returns a nested map: tagKey -> tagValue -> spriteId[].
 */
export function groupByTags(
  sprites: Array<{ id: string; tags?: Record<string, string> }>,
): Map<string, Map<string, string[]>> {
  // Collect all tag keys
  const allKeys = new Set<string>();
  for (const sprite of sprites) {
    if (sprite.tags) {
      for (const key of Object.keys(sprite.tags)) {
        allKeys.add(key);
      }
    }
  }

  const result = new Map<string, Map<string, string[]>>();
  for (const key of allKeys) {
    result.set(key, groupByTag(sprites, key));
  }

  return result;
}

/** Built-in pattern presets */
export const FILENAME_PRESETS: { label: string; pattern: string }[] = [
  {
    label: "name_index (hero_idle_01)",
    pattern: "(?<name>[^_-]+)(?:[-_](?<action>[^_-]+))?[-_](?<index>\\d+)",
  },
  {
    label: "name-index (hero-01)",
    pattern: "(?<name>.+?)[-_](?<index>\\d+)",
  },
  {
    label: "action_index (idle_01)",
    pattern: "(?<action>.+?)[-_](?<index>\\d+)",
  },
  {
    label: "Custom regex",
    pattern: "",
  },
];
