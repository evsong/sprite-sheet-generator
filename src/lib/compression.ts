/**
 * Advanced Compression Pipeline
 *
 * Provides RGBA4444 conversion with optional Floyd-Steinberg dithering,
 * WebP/AVIF export, and file size estimation for atlas textures.
 */

// ── Types ─────────────────────────────────────────────────────────

export type ImageFormat = "png" | "webp" | "avif";

export interface CompressionConfig {
  /** Output image format */
  format: ImageFormat;
  /** Quality 0-100 (only applies to webp/avif lossy) */
  quality: number;
  /** Apply RGBA4444 color reduction */
  rgba4444: boolean;
  /** Apply Floyd-Steinberg dithering when using RGBA4444 */
  dithering: boolean;
}

export interface CompressionResult {
  blob: Blob;
  /** Original PNG size in bytes */
  originalSize: number;
  /** Compressed size in bytes */
  compressedSize: number;
  /** Compression ratio as percentage (0-100) */
  ratio: number;
}

export const DEFAULT_COMPRESSION: CompressionConfig = {
  format: "png",
  quality: 85,
  rgba4444: false,
  dithering: true,
};

// ── MIME types ─────────────────────────────────────────────────────

const FORMAT_MIME: Record<ImageFormat, string> = {
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export function getFormatExtension(format: ImageFormat): string {
  return format;
}

// ── RGBA4444 conversion ───────────────────────────────────────────

/**
 * Convert RGBA8888 pixel data to RGBA4444 (4 bits per channel).
 * Each channel value is shifted: val >> 4 then << 4 to snap to 16 levels.
 * Modifies the ImageData in place.
 */
export function convertToRGBA4444(imageData: ImageData): void {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (data[i] >> 4) << 4;       // R
    data[i + 1] = (data[i + 1] >> 4) << 4; // G
    data[i + 2] = (data[i + 2] >> 4) << 4; // B
    data[i + 3] = (data[i + 3] >> 4) << 4; // A
  }
}

// ── Floyd-Steinberg error diffusion for RGBA ──────────────────────

/**
 * Apply Floyd-Steinberg dithering while quantizing to RGBA4444.
 * Distributes quantization error to neighboring pixels:
 *
 *        *   7/16
 *  3/16  5/16  1/16
 *
 * Adapted from the classic algorithm to handle all 4 RGBA channels.
 * Modifies the ImageData in place.
 */
export function ditherFloydSteinberg(imageData: ImageData): void {
  const { data, width, height } = imageData;

  // Work with floating-point errors to avoid accumulation issues
  const errors = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    errors[i] = data[i];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 4; c++) {
        const oldVal = errors[idx + c];
        // Quantize to 4-bit (16 levels)
        const newVal = Math.round(oldVal / 17) * 17;
        const clamped = Math.max(0, Math.min(255, newVal));
        data[idx + c] = clamped;
        const err = oldVal - clamped;

        // Distribute error to neighbors
        if (x + 1 < width) {
          errors[idx + 4 + c] += err * (7 / 16);
        }
        if (y + 1 < height) {
          if (x > 0) {
            errors[idx + (width - 1) * 4 + c] += err * (3 / 16);
          }
          errors[idx + width * 4 + c] += err * (5 / 16);
          if (x + 1 < width) {
            errors[idx + (width + 1) * 4 + c] += err * (1 / 16);
          }
        }
      }
    }
  }
}

// ── Canvas to compressed blob ─────────────────────────────────────

/**
 * Apply compression config to a canvas and return a compressed blob.
 */
export async function compressCanvas(
  canvas: HTMLCanvasElement,
  config: CompressionConfig,
): Promise<CompressionResult> {
  // Get original PNG size for comparison
  const originalBlob = await canvasToBlob(canvas, "image/png");
  const originalSize = originalBlob.size;

  // Apply RGBA4444 reduction if requested
  if (config.rgba4444) {
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (config.dithering) {
      ditherFloydSteinberg(imageData);
    } else {
      convertToRGBA4444(imageData);
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Export in target format
  const mime = FORMAT_MIME[config.format];
  // Quality: 0-1 for webp/avif, ignored for png
  const quality = config.format === "png" ? undefined : config.quality / 100;
  const compressedBlob = await canvasToBlob(canvas, mime, quality);

  return {
    blob: compressedBlob,
    originalSize,
    compressedSize: compressedBlob.size,
    ratio: originalSize > 0 ? Math.round((1 - compressedBlob.size / originalSize) * 100) : 0,
  };
}

/**
 * Estimate compressed file size without actually compressing.
 * Uses a fast heuristic based on format and quality settings.
 */
export async function estimateCompressedSize(
  canvas: HTMLCanvasElement,
  config: CompressionConfig,
): Promise<{ originalSize: number; estimatedSize: number }> {
  const originalBlob = await canvasToBlob(canvas, "image/png");
  const originalSize = originalBlob.size;

  // For PNG, RGBA4444 typically reduces size by 30-50%
  let multiplier = 1.0;
  if (config.rgba4444) {
    multiplier *= 0.6;
  }

  // WebP is typically 25-35% smaller than PNG
  if (config.format === "webp") {
    multiplier *= 0.4 + 0.35 * (config.quality / 100);
  }
  // AVIF is typically 30-50% smaller than PNG
  else if (config.format === "avif") {
    multiplier *= 0.3 + 0.35 * (config.quality / 100);
  }

  return {
    originalSize,
    estimatedSize: Math.round(originalSize * multiplier),
  };
}

// ── Format support detection ──────────────────────────────────────

/**
 * Check if the browser supports encoding to a given format.
 */
export async function isFormatSupported(format: ImageFormat): Promise<boolean> {
  if (format === "png") return true;

  try {
    const testCanvas = document.createElement("canvas");
    testCanvas.width = 1;
    testCanvas.height = 1;
    const blob = await canvasToBlob(testCanvas, FORMAT_MIME[format], 0.5);
    // If the browser doesn't support the format, it falls back to PNG
    return blob.type === FORMAT_MIME[format];
  } catch {
    return false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), type, quality);
  });
}

/**
 * Format bytes into human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
