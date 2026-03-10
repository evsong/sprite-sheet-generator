/**
 * Core Packing Types
 *
 * Shared interfaces extracted from editor-store for use in both
 * the browser editor and the CLI tool. These are the canonical
 * type definitions for the packing pipeline.
 */

export interface PivotPoint {
  x: number; // 0..1 normalized (0.5 = center)
  y: number;
}

export interface TrimRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SourceSize {
  w: number;
  h: number;
}

/** Minimal sprite descriptor for packing (no DOM dependencies) */
export interface CoreSpriteItem {
  id: string;
  name: string;
  width: number;
  height: number;
  trimmed: boolean;
  trimRect?: TrimRect;
  sourceSize?: SourceSize;
  pivot: PivotPoint;
  tags?: Record<string, string>;
  group?: string;
}

export interface CorePackedRect {
  spriteId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rot: boolean;
  binIndex: number;
}

export interface CorePackedBin {
  width: number;
  height: number;
  rects: CorePackedRect[];
}

export interface CorePackingConfig {
  maxWidth: number;
  maxHeight: number;
  padding: number;
  border: number;
  pot: boolean;
  allowRotation: boolean;
  trimTransparency: boolean;
  exportFormat: string;
  maxPages: number;
}

/** CLI project config schema (.spriteforge.json) */
export interface SpriteForgeConfig {
  /** Version of the config schema */
  version: 1;
  /** Input directory containing sprite images */
  input: string;
  /** Output directory for atlas files */
  output: string;
  /** Project name used for output filenames */
  name: string;
  /** Packing configuration */
  packing: CorePackingConfig;
  /** Normal map settings */
  normalMap?: {
    enabled: boolean;
    autoGenerate: boolean;
    strength: number;
  };
  /** Compression settings */
  compression?: {
    format: "png" | "webp" | "avif";
    quality: number;
    rgba4444: boolean;
    dithering: boolean;
  };
}
