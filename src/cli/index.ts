#!/usr/bin/env node

/**
 * SpriteForge CLI
 *
 * Command-line tool for packing sprite sheets without the browser editor.
 * Reads configuration from .spriteforge.json or command-line flags.
 *
 * Usage:
 *   spriteforge pack                  # Use .spriteforge.json in CWD
 *   spriteforge pack -c config.json   # Use specified config file
 *   spriteforge pack -i ./sprites -o ./output
 *
 * This is a preparation skeleton. Full Node.js canvas integration
 * (via @napi-rs/canvas or similar) is required for production use.
 */

import type { SpriteForgeConfig, CorePackingConfig } from "@/lib/core-types";

// ── Default config ────────────────────────────────────────────────

const DEFAULT_PACKING: CorePackingConfig = {
  maxWidth: 2048,
  maxHeight: 2048,
  padding: 2,
  border: 0,
  pot: true,
  allowRotation: false,
  trimTransparency: true,
  exportFormat: "json",
  maxPages: 0,
};

export const DEFAULT_CONFIG: SpriteForgeConfig = {
  version: 1,
  input: "./sprites",
  output: "./output",
  name: "spritesheet",
  packing: DEFAULT_PACKING,
  normalMap: {
    enabled: false,
    autoGenerate: false,
    strength: 1.0,
  },
  compression: {
    format: "png",
    quality: 85,
    rgba4444: false,
    dithering: true,
  },
};

// ── Config validation ─────────────────────────────────────────────

export function validateConfig(config: unknown): config is SpriteForgeConfig {
  if (!config || typeof config !== "object") return false;
  const c = config as Record<string, unknown>;

  if (c.version !== 1) return false;
  if (typeof c.input !== "string") return false;
  if (typeof c.output !== "string") return false;
  if (typeof c.name !== "string") return false;
  if (!c.packing || typeof c.packing !== "object") return false;

  const p = c.packing as Record<string, unknown>;
  if (typeof p.maxWidth !== "number" || typeof p.maxHeight !== "number") return false;
  if (typeof p.padding !== "number") return false;

  return true;
}

// ── CLI entry point skeleton ──────────────────────────────────────

interface CliArgs {
  command: string;
  configPath?: string;
  input?: string;
  output?: string;
  name?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  const result: CliArgs = { command: args[0] || "help" };

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case "-c":
      case "--config":
        result.configPath = args[++i];
        break;
      case "-i":
      case "--input":
        result.input = args[++i];
        break;
      case "-o":
      case "--output":
        result.output = args[++i];
        break;
      case "-n":
      case "--name":
        result.name = args[++i];
        break;
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
SpriteForge CLI v0.1.0

Usage:
  spriteforge <command> [options]

Commands:
  pack        Pack sprites into atlas sheet(s)
  help        Show this help message

Options:
  -c, --config <path>   Path to .spriteforge.json config file
  -i, --input <dir>     Input directory containing sprite images
  -o, --output <dir>    Output directory for atlas files
  -n, --name <name>     Project name for output filenames

Examples:
  spriteforge pack
  spriteforge pack -c my-config.json
  spriteforge pack -i ./sprites -o ./dist -n atlas

Config file (.spriteforge.json):
  See .spriteforge.example.json for the full config schema.
`);
}

async function handlePack(args: CliArgs): Promise<void> {
  console.log("SpriteForge CLI - Pack");
  console.log("=====================");

  // Load config
  const configPath = args.configPath || ".spriteforge.json";
  console.log(`Config: ${configPath}`);

  // TODO: Implement Node.js-based packing pipeline
  // This requires a Node.js canvas implementation (e.g., @napi-rs/canvas)
  // for image loading and atlas rendering outside the browser.
  //
  // The packing algorithm (maxrects-packer) works in Node.js already.
  // What's needed:
  // 1. fs.readdir to scan input directory
  // 2. Canvas-based image loading (sharp or @napi-rs/canvas)
  // 3. Reuse packSprites() from src/lib/packer.ts
  // 4. Reuse compression pipeline from src/lib/compression.ts
  // 5. Write output files with fs.writeFile

  if (args.input) console.log(`Input: ${args.input}`);
  if (args.output) console.log(`Output: ${args.output}`);
  if (args.name) console.log(`Name: ${args.name}`);

  console.log("\nNote: CLI packing is not yet fully implemented.");
  console.log("Use the browser editor at https://spriteforge.online for now.");
}

// ── Main ──────────────────────────────────────────────────────────

export async function main(argv: string[]): Promise<void> {
  const args = parseArgs(argv);

  switch (args.command) {
    case "pack":
      await handlePack(args);
      break;
    case "help":
    case "--help":
    case "-h":
    default:
      printHelp();
      break;
  }
}

// Only run if executed directly (not imported)
if (typeof process !== "undefined" && process.argv) {
  // Check if this module is the entry point
  const isMain =
    typeof require !== "undefined" &&
    require.main === module;

  if (isMain) {
    main(process.argv).catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
  }
}
