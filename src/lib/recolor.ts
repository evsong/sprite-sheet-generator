/**
 * Client-side sprite recoloring via Canvas pixel manipulation.
 * Extracts palette, applies color mapping, or auto-generates hue-shifted variants.
 */

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Extract unique colors from a sprite image, sorted by frequency (most common first).
 * Only counts non-transparent pixels (alpha > 0).
 */
export function extractPalette(image: HTMLImageElement, maxColors = 32): string[] {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const freq = new Map<string, number>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // skip transparent
    const hex = toHex(data[i], data[i + 1], data[i + 2]);
    freq.set(hex, (freq.get(hex) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors)
    .map(([hex]) => hex);
}

/**
 * Apply a color mapping to a sprite image (pixel-level replacement).
 * colorMap: Map<sourceHex, targetHex> e.g. Map("#ff0000" => "#00ff00")
 */
export async function applyRecolor(
  image: HTMLImageElement,
  colorMap: Map<string, string>,
): Promise<{ image: HTMLImageElement; blob: Blob }> {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  // Pre-parse color map to RGB for fast lookup
  const rgbMap = new Map<string, [number, number, number]>();
  for (const [src, dst] of colorMap) {
    const r = parseInt(dst.slice(1, 3), 16);
    const g = parseInt(dst.slice(3, 5), 16);
    const b = parseInt(dst.slice(5, 7), 16);
    rgbMap.set(src.toLowerCase(), [r, g, b]);
  }

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const hex = toHex(data[i], data[i + 1], data[i + 2]).toLowerCase();
    const replacement = rgbMap.get(hex);
    if (replacement) {
      data[i] = replacement[0];
      data[i + 1] = replacement[1];
      data[i + 2] = replacement[2];
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Synchronous blob via toDataURL (sprites are tiny, this is fast)
  const dataUrl = canvas.toDataURL("image/png");
  const binary = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "image/png" });

  const newImg = new Image();
  await new Promise<void>((resolve) => { newImg.onload = () => resolve(); newImg.src = dataUrl; });
  return { image: newImg, blob };
}

/**
 * Auto-recolor: shift all palette colors by a random hue offset.
 * Produces a visually distinct but stylistically consistent variant.
 */
export async function autoRecolor(image: HTMLImageElement): Promise<{ image: HTMLImageElement; blob: Blob }> {
  const palette = extractPalette(image);
  const hueShift = 0.15 + Math.random() * 0.7; // 15-85% hue rotation

  const colorMap = new Map<string, string>();
  for (const hex of palette) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const [h, s, l] = rgbToHsl(r, g, b);
    const [nr, ng, nb] = hslToRgb((h + hueShift) % 1, s, l);
    colorMap.set(hex, toHex(nr, ng, nb));
  }

  return applyRecolor(image, colorMap);
}
