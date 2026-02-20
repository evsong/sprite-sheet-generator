import { splitSpriteSheet } from "./sprite-sheet-splitter";
import { processFrames } from "./bg-removal";
import type { SpriteItem, AiProgress } from "@/stores/editor-store";

export interface GenerateOptions {
  prompt: string;
  style: string;
  frameCount: number;
  targetSize: number;
  onProgress: (progress: Partial<AiProgress>) => void;
}

function resizeFrame(img: HTMLImageElement, size: number): Promise<HTMLImageElement> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = size > img.naturalWidth;
  ctx.drawImage(img, 0, 0, size, size);
  return new Promise((resolve) => {
    const out = new Image();
    out.onload = () => resolve(out);
    out.src = canvas.toDataURL("image/png");
  });
}

export async function generateSpriteSheet(opts: GenerateOptions): Promise<SpriteItem[]> {
  const { prompt, style, frameCount, targetSize, onProgress } = opts;

  // Stage 1: API call
  onProgress({ active: true, stage: "generating", stageLabel: "生成中...", completed: 0, total: frameCount, prompt });

  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style, count: frameCount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Generation failed" }));
    throw new Error(err.error || `API error ${res.status}`);
  }

  const { spriteSheet, gridRows, gridCols } = await res.json();

  // Stage 2: Split
  onProgress({ stage: "splitting", stageLabel: "切割中..." });
  const { frames } = await splitSpriteSheet(spriteSheet, frameCount, gridRows, gridCols);

  // Stage 3: Background removal
  onProgress({ stage: "removing-bg", stageLabel: "去背景中... (0/" + frameCount + ")" });
  const cleanFrames = await processFrames(frames, (done, total) => {
    onProgress({ stage: "removing-bg", stageLabel: `去背景中... (${done}/${total})`, completed: done, total });
  });

  // Stage 4: Resize + build sprites
  const sprites: SpriteItem[] = [];
  for (let i = 0; i < cleanFrames.length; i++) {
    const resized = targetSize > 0 ? await resizeFrame(cleanFrames[i], targetSize) : cleanFrames[i];
    sprites.push({
      id: `ai-${Date.now()}-${i}`,
      name: `frame-${i + 1}`,
      file: null,
      image: resized,
      width: resized.naturalWidth,
      height: resized.naturalHeight,
      trimmed: false,
      isAi: true,
    });
  }

  onProgress({ stage: "done", stageLabel: "完成 ✓", completed: frameCount, total: frameCount });
  return sprites;
}
