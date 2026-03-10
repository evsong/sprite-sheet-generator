/**
 * CLI Config Export
 *
 * Generates a .spriteforge.json config file from the current editor settings.
 * This config can be used with the SpriteForge CLI tool.
 */

import type { PackingConfig } from "@/stores/editor-store";
import type { CompressionConfig } from "@/lib/compression";
import type { SpriteForgeConfig } from "@/lib/core-types";

interface ConfigExportParams {
  packingConfig: PackingConfig;
  normalMapEnabled: boolean;
  normalMapAutoGenerate: boolean;
  normalMapStrength: number;
  compressionConfig: CompressionConfig;
  projectName?: string;
}

export function generateCliConfig(params: ConfigExportParams): SpriteForgeConfig {
  const {
    packingConfig,
    normalMapEnabled,
    normalMapAutoGenerate,
    normalMapStrength,
    compressionConfig,
    projectName = "spritesheet",
  } = params;

  return {
    version: 1,
    input: "./sprites",
    output: "./output",
    name: projectName,
    packing: {
      maxWidth: packingConfig.maxWidth,
      maxHeight: packingConfig.maxHeight,
      padding: packingConfig.padding,
      border: packingConfig.border,
      pot: packingConfig.pot,
      allowRotation: packingConfig.allowRotation,
      trimTransparency: packingConfig.trimTransparency,
      exportFormat: packingConfig.exportFormat,
      maxPages: packingConfig.maxPages,
    },
    normalMap: {
      enabled: normalMapEnabled,
      autoGenerate: normalMapAutoGenerate,
      strength: normalMapStrength,
    },
    compression: {
      format: compressionConfig.format as "png" | "webp" | "avif",
      quality: compressionConfig.quality,
      rgba4444: compressionConfig.rgba4444,
      dithering: compressionConfig.dithering,
    },
  };
}

export function downloadCliConfig(config: SpriteForgeConfig): void {
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = ".spriteforge.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
