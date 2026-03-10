/**
 * Normal Map Generation & Auto-Pairing
 *
 * Provides Sobel-based normal map generation from diffuse textures
 * and auto-pairing logic to detect _n/_normal/_nrm suffix patterns
 * for pre-existing normal map assets.
 */

// ── Suffix patterns for normal map detection ──────────────────────

const NORMAL_SUFFIXES = ["_n", "_normal", "_nrm", "-n", "-normal", "-nrm"];

/**
 * Strip file extension from a filename.
 */
function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

/**
 * Detect if a filename looks like a normal map by checking for known suffixes.
 */
export function isNormalMapFilename(filename: string): boolean {
  const base = stripExt(filename).toLowerCase();
  return NORMAL_SUFFIXES.some((s) => base.endsWith(s));
}

/**
 * Given a diffuse filename, find its matching normal map filename from
 * a list of available filenames.
 *
 * E.g., "hero_idle.png" will match "hero_idle_n.png" or "hero_idle_normal.png".
 */
export function findNormalMapPair(
  diffuseFilename: string,
  allFilenames: string[],
): string | null {
  const diffuseBase = stripExt(diffuseFilename).toLowerCase();
  const diffuseExt = diffuseFilename.slice(diffuseFilename.lastIndexOf("."));

  for (const suffix of NORMAL_SUFFIXES) {
    const candidate = `${diffuseBase}${suffix}${diffuseExt}`.toLowerCase();
    const match = allFilenames.find((f) => f.toLowerCase() === candidate);
    if (match) return match;
  }

  return null;
}

/**
 * Given a normal map filename, derive the diffuse filename.
 *
 * E.g., "hero_idle_n.png" -> "hero_idle.png"
 */
export function deriveDiffuseFilename(normalFilename: string): string | null {
  const base = stripExt(normalFilename);
  const ext = normalFilename.slice(normalFilename.lastIndexOf("."));
  const baseLower = base.toLowerCase();

  for (const suffix of NORMAL_SUFFIXES) {
    if (baseLower.endsWith(suffix)) {
      return base.slice(0, -suffix.length) + ext;
    }
  }

  return null;
}

// ── Sobel-based normal map generation ─────────────────────────────

/**
 * Generate a normal map from a diffuse image using Sobel edge detection.
 *
 * The algorithm:
 * 1. Convert to grayscale (luminance)
 * 2. Apply Sobel operator in X and Y directions
 * 3. Compute normal vector from gradients
 * 4. Encode normal as RGB (0..255 maps to -1..1)
 *
 * @param image - Source diffuse image
 * @param strength - Normal map intensity (0.5 - 5.0, default 1.0)
 * @returns A new HTMLImageElement containing the normal map
 */
export async function generateNormalMap(
  image: HTMLImageElement,
  strength = 1.0,
): Promise<HTMLImageElement> {
  const w = image.naturalWidth;
  const h = image.naturalHeight;

  // Draw source to canvas for pixel access
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(image, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, w, h);

  // Convert to grayscale luminance buffer
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = srcData.data[i * 4];
    const g = srcData.data[i * 4 + 1];
    const b = srcData.data[i * 4 + 2];
    // Standard luminance weights
    gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // Sample grayscale with clamped coords
  const sample = (x: number, y: number): number => {
    const cx = Math.max(0, Math.min(w - 1, x));
    const cy = Math.max(0, Math.min(h - 1, y));
    return gray[cy * w + cx];
  };

  // Output canvas
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext("2d")!;
  const outData = outCtx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Sobel kernels
      // Gx = right - left weighted
      const gx =
        (-1 * sample(x - 1, y - 1) + 1 * sample(x + 1, y - 1) +
         -2 * sample(x - 1, y)     + 2 * sample(x + 1, y) +
         -1 * sample(x - 1, y + 1) + 1 * sample(x + 1, y + 1)) * strength;

      // Gy = bottom - top weighted
      const gy =
        (-1 * sample(x - 1, y - 1) - 2 * sample(x, y - 1) - 1 * sample(x + 1, y - 1) +
          1 * sample(x - 1, y + 1) + 2 * sample(x, y + 1) + 1 * sample(x + 1, y + 1)) * strength;

      // Normal vector (pointing up in tangent space)
      const len = Math.sqrt(gx * gx + gy * gy + 1);
      const nx = (-gx / len) * 0.5 + 0.5;
      const ny = (-gy / len) * 0.5 + 0.5;
      const nz = (1 / len) * 0.5 + 0.5;

      const idx = (y * w + x) * 4;
      outData.data[idx] = Math.round(nx * 255);
      outData.data[idx + 1] = Math.round(ny * 255);
      outData.data[idx + 2] = Math.round(nz * 255);
      // Preserve alpha from source
      outData.data[idx + 3] = srcData.data[idx + 3];
    }
  }

  outCtx.putImageData(outData, 0, 0);

  // Convert canvas to HTMLImageElement
  const blob = await new Promise<Blob>((resolve) =>
    outCanvas.toBlob((b) => resolve(b!), "image/png"),
  );

  const img = new Image();
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.src = URL.createObjectURL(blob);
  });

  return img;
}

/**
 * Render a normal map atlas using the same layout as the diffuse atlas.
 * Each sprite's normal map is drawn at the same position/rotation as its
 * diffuse counterpart, ensuring pixel-perfect alignment.
 */
export function renderNormalMapBin(
  bin: import("@/stores/editor-store").PackedBin,
  sprites: import("@/stores/editor-store").SpriteItem[],
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = bin.width;
  canvas.height = bin.height;
  const ctx = canvas.getContext("2d")!;

  // Fill with default flat normal (128, 128, 255) = (0, 0, 1)
  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bin.rects.forEach((rect) => {
    const sprite = sprites.find((s) => s.id === rect.spriteId);
    if (!sprite?.normalMap) return;

    ctx.save();
    if (rect.rot) {
      ctx.translate(rect.x + rect.height, rect.y);
      ctx.rotate(Math.PI / 2);
    }

    if (sprite.trimmed && sprite.trimRect) {
      const tr = sprite.trimRect;
      ctx.drawImage(
        sprite.normalMap,
        tr.x, tr.y, tr.w, tr.h,
        rect.rot ? 0 : rect.x, rect.rot ? 0 : rect.y,
        rect.width, rect.height,
      );
    } else {
      ctx.drawImage(
        sprite.normalMap,
        rect.rot ? 0 : rect.x, rect.rot ? 0 : rect.y,
        rect.width, rect.height,
      );
    }
    ctx.restore();
  });

  return canvas;
}
