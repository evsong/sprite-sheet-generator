import { getOptimalGrid } from "./prompt-templates";

export interface SplitResult {
  frames: HTMLImageElement[];
  gridCols: number;
  gridRows: number;
  cellWidth: number;
  cellHeight: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

function isBackgroundPixel(data: Uint8ClampedArray, idx: number): boolean {
  const r = data[idx], g = data[idx + 1], b = data[idx + 2];
  // Checkerboard: light gray (~204) or white (~255)
  return (r > 180 && g > 180 && b > 180 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15);
}

function scanLine(
  imageData: ImageData,
  isVertical: boolean,
  pos: number,
  start: number,
  end: number
): number {
  const { data, width } = imageData;
  let bgCount = 0;
  const total = end - start;
  for (let i = start; i < end; i++) {
    const x = isVertical ? pos : i;
    const y = isVertical ? i : pos;
    const idx = (y * width + x) * 4;
    if (isBackgroundPixel(data, idx)) bgCount++;
  }
  return bgCount / total;
}

function findBestSplit(
  imageData: ImageData,
  isVertical: boolean,
  expected: number,
  start: number,
  end: number,
  range = 10
): number {
  let best = expected;
  let bestScore = scanLine(imageData, isVertical, expected, start, end);

  for (let offset = 1; offset <= range; offset++) {
    for (const pos of [expected - offset, expected + offset]) {
      if (pos < 0 || pos >= (isVertical ? imageData.width : imageData.height)) continue;
      const score = scanLine(imageData, isVertical, pos, start, end);
      if (score > bestScore) {
        bestScore = score;
        best = pos;
      }
    }
  }

  return bestScore > 0.7 ? best : -1;
}

function detectGrid(
  imageData: ImageData,
  rows: number,
  cols: number
): { xs: number[]; ys: number[] } | null {
  const { width, height } = imageData;
  const cellW = width / cols;
  const cellH = height / rows;

  // Find vertical split lines
  const xs = [0];
  for (let c = 1; c < cols; c++) {
    const expected = Math.round(c * cellW);
    const pos = findBestSplit(imageData, true, expected, 0, height);
    if (pos === -1) return null;
    xs.push(pos);
  }
  xs.push(width);

  // Find horizontal split lines
  const ys = [0];
  for (let r = 1; r < rows; r++) {
    const expected = Math.round(r * cellH);
    const pos = findBestSplit(imageData, false, expected, 0, width);
    if (pos === -1) return null;
    ys.push(pos);
  }
  ys.push(height);

  return { xs, ys };
}

function equalGrid(
  width: number,
  height: number,
  rows: number,
  cols: number
): { xs: number[]; ys: number[] } {
  const xs = Array.from({ length: cols + 1 }, (_, i) => Math.round(i * width / cols));
  const ys = Array.from({ length: rows + 1 }, (_, i) => Math.round(i * height / rows));
  return { xs, ys };
}

function extractFrame(
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
): Promise<HTMLImageElement> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
  return loadImage(canvas.toDataURL("image/png"));
}

export async function splitSpriteSheet(
  src: string,
  frameCount: number,
  gridRows?: number,
  gridCols?: number
): Promise<SplitResult> {
  const img = await loadImage(src);
  const { rows, cols } = gridRows && gridCols
    ? { rows: gridRows, cols: gridCols }
    : getOptimalGrid(frameCount);

  const imageData = getImageData(img);

  // Try smart detection, fallback to equal split
  const grid = detectGrid(imageData, rows, cols)
    ?? equalGrid(img.width, img.height, rows, cols);

  const frames: HTMLImageElement[] = [];
  for (let r = 0; r < rows && frames.length < frameCount; r++) {
    for (let c = 0; c < cols && frames.length < frameCount; c++) {
      const x = grid.xs[c];
      const y = grid.ys[r];
      const w = grid.xs[c + 1] - x;
      const h = grid.ys[r + 1] - y;
      frames.push(await extractFrame(img, x, y, w, h));
    }
  }

  const cellWidth = Math.round(img.width / cols);
  const cellHeight = Math.round(img.height / rows);

  return { frames, gridCols: cols, gridRows: rows, cellWidth, cellHeight };
}
