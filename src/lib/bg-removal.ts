import { pipeline, env, type RawImage } from "@huggingface/transformers";

// Use CDN for WASM/ONNX backends in browser
env.allowLocalModels = false;

// --- Checkerboard detection & removal ---

interface CheckerResult {
  detected: boolean;
  color1?: [number, number, number];
  color2?: [number, number, number];
}

function sampleCorner(data: Uint8ClampedArray, width: number, height: number, cx: number, cy: number, size: number): Map<string, number> {
  const counts = new Map<string, number>();
  for (let y = cy; y < cy + size && y < height; y++) {
    for (let x = cx; x < cx + size && x < width; x++) {
      const idx = (y * width + x) * 4;
      // Quantize to reduce noise
      const key = `${Math.round(data[idx] / 8) * 8},${Math.round(data[idx + 1] / 8) * 8},${Math.round(data[idx + 2] / 8) * 8}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return counts;
}

export function detectCheckerboard(imageData: ImageData): CheckerResult {
  const { data, width, height } = imageData;
  const size = 8;
  const corners = [
    [0, 0], [width - size, 0],
    [0, height - size], [width - size, height - size],
  ];

  // Merge color counts from all 4 corners
  const merged = new Map<string, number>();
  for (const [cx, cy] of corners) {
    const counts = sampleCorner(data, width, height, cx, cy, size);
    for (const [k, v] of counts) merged.set(k, (merged.get(k) || 0) + v);
  }

  // Get top 2 colors
  const sorted = [...merged.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length < 2) return { detected: false };

  const total = sorted.reduce((s, [, v]) => s + v, 0);
  const top2Ratio = (sorted[0][1] + sorted[1][1]) / total;

  // Top 2 colors should dominate (>70%) and both be light-ish (gray/white)
  if (top2Ratio < 0.7) return { detected: false };

  const parse = (s: string) => s.split(",").map(Number) as [number, number, number];
  const c1 = parse(sorted[0][0]);
  const c2 = parse(sorted[1][0]);

  // Both colors should be light (>150 brightness)
  const bright1 = (c1[0] + c1[1] + c1[2]) / 3;
  const bright2 = (c2[0] + c2[1] + c2[2]) / 3;
  if (bright1 < 150 || bright2 < 150) return { detected: false };

  // Colors should be different enough
  const diff = Math.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2);
  if (diff < 15) return { detected: false };

  return { detected: true, color1: c1, color2: c2 };
}

function colorDist(data: Uint8ClampedArray, idx: number, color: [number, number, number]): number {
  return Math.sqrt(
    (data[idx] - color[0]) ** 2 +
    (data[idx + 1] - color[1]) ** 2 +
    (data[idx + 2] - color[2]) ** 2
  );
}

export function removeCheckerboard(imageData: ImageData, c1: [number, number, number], c2: [number, number, number]): ImageData {
  const { data, width, height } = imageData;
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const d = out.data;
  const tolerance = 30;

  for (let i = 0; i < d.length; i += 4) {
    const d1 = colorDist(d, i, c1);
    const d2 = colorDist(d, i, c2);
    const minDist = Math.min(d1, d2);

    if (minDist <= tolerance) {
      // Anti-alias: fade alpha near the edge of tolerance
      const alpha = minDist < tolerance * 0.6 ? 0 : Math.round(255 * (minDist - tolerance * 0.6) / (tolerance * 0.4));
      d[i + 3] = alpha;
    }
  }

  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenter: any = null;
let loading = false;

type ProgressCallback = (progress: { status: string; progress?: number }) => void;

async function getSegmenter(onProgress?: ProgressCallback) {
  if (segmenter) return segmenter;
  if (loading) {
    // Wait for in-flight load
    while (loading) await new Promise((r) => setTimeout(r, 100));
    return segmenter!;
  }
  loading = true;
  onProgress?.({ status: "loading", progress: 0 });
  segmenter = await pipeline("image-segmentation", "briaai/RMBG-1.4", {
    progress_callback: (p: { status: string; progress?: number }) => {
      onProgress?.(p);
    },
  });
  loading = false;
  onProgress?.({ status: "ready", progress: 100 });
  return segmenter;
}

export async function removeBackground(
  image: HTMLImageElement,
  onProgress?: ProgressCallback
): Promise<{ image: HTMLImageElement; blob: Blob }> {
  const seg = await getSegmenter(onProgress);
  onProgress?.({ status: "processing" });

  const results = (await seg(image.src)) as Array<{ mask: RawImage; label: string }>;
  const mask = results[0]?.mask;
  if (!mask) throw new Error("No mask returned from segmentation model");

  // Draw original + apply mask as alpha
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const maskData = mask.data as Uint8Array;

  // Resize mask to match image if needed
  if (maskData.length === imageData.data.length / 4) {
    for (let i = 0; i < maskData.length; i++) {
      imageData.data[i * 4 + 3] = maskData[i];
    }
  } else {
    // Mask is different size — scale it
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = mask.width;
    maskCanvas.height = mask.height;
    const maskCtx = maskCanvas.getContext("2d")!;
    const maskImgData = maskCtx.createImageData(mask.width, mask.height);
    for (let i = 0; i < maskData.length; i++) {
      maskImgData.data[i * 4] = maskData[i];
      maskImgData.data[i * 4 + 1] = maskData[i];
      maskImgData.data[i * 4 + 2] = maskData[i];
      maskImgData.data[i * 4 + 3] = 255;
    }
    maskCtx.putImageData(maskImgData, 0, 0);

    // Scale mask to image size
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = canvas.width;
    scaledCanvas.height = canvas.height;
    const scaledCtx = scaledCanvas.getContext("2d")!;
    scaledCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
    const scaledData = scaledCtx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length / 4; i++) {
      imageData.data[i * 4 + 3] = scaledData.data[i * 4]; // R channel = mask value
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png")
  );

  const newImg = new Image();
  await new Promise<void>((resolve) => {
    newImg.onload = () => resolve();
    newImg.src = URL.createObjectURL(blob);
  });

  onProgress?.({ status: "done", progress: 100 });
  return { image: newImg, blob };
}

// --- Batch processing with checkerboard primary, RMBG fallback ---

export async function processFrames(
  frames: HTMLImageElement[],
  onProgress?: (completed: number, total: number) => void
): Promise<HTMLImageElement[]> {
  const results: HTMLImageElement[] = [];

  // Check first frame for checkerboard
  const canvas = document.createElement("canvas");
  const firstFrame = frames[0];
  canvas.width = firstFrame.naturalWidth;
  canvas.height = firstFrame.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(firstFrame, 0, 0);
  const firstData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const checker = detectCheckerboard(firstData);

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const c = document.createElement("canvas");
    c.width = frame.naturalWidth;
    c.height = frame.naturalHeight;
    const fCtx = c.getContext("2d")!;
    fCtx.drawImage(frame, 0, 0);

    if (checker.detected && checker.color1 && checker.color2) {
      const imgData = fCtx.getImageData(0, 0, c.width, c.height);
      const processed = removeCheckerboard(imgData, checker.color1, checker.color2);
      fCtx.putImageData(processed, 0, 0);
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = c.toDataURL("image/png");
      });
      results.push(img);
    } else {
      // Fallback to RMBG-1.4
      const { image: processed } = await removeBackground(frame);
      results.push(processed);
    }

    onProgress?.(i + 1, frames.length);
  }

  return results;
}
