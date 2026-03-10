import { splitSpriteSheet } from "./sprite-sheet-splitter";
import { processFrames } from "./bg-removal";
import type { SpriteItem, AiProgress } from "@/stores/editor-store";
import type { GenerationMode } from "./prompt-templates";

export interface GenerateOptions {
  prompt: string;
  style: string;
  frameCount: number;
  targetSize: number;
  mode?: GenerationMode;
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
  const { prompt, style, frameCount, targetSize, mode = "sequence", onProgress } = opts;

  // Stage 1: API call
  onProgress({ active: true, stage: "generating", stageLabel: "Generating sprite sheet...", completed: 0, total: frameCount, prompt, startedAt: Date.now() });

  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style, count: frameCount, mode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Generation failed" }));
    throw new Error(err.error || `API error ${res.status}`);
  }

  const { spriteSheet, gridRows, gridCols } = await res.json();

  // Stage 2: Split
  onProgress({ stage: "splitting", stageLabel: "Splitting into frames..." });
  const { frames } = await splitSpriteSheet(spriteSheet, frameCount, gridRows, gridCols);

  // Stage 3: Background removal
  onProgress({ stage: "removing-bg", stageLabel: `Removing background... (0/${frameCount})` });
  const cleanFrames = await processFrames(frames, (done, total) => {
    onProgress({ stage: "removing-bg", stageLabel: `Removing background... (${done}/${total})`, completed: done, total });
  });

  // Stage 4: Resize + build sprites
  const sprites: SpriteItem[] = [];
  for (let i = 0; i < cleanFrames.length; i++) {
    const resized = targetSize > 0 ? await resizeFrame(cleanFrames[i], targetSize) : cleanFrames[i];
    sprites.push({
      id: `ai-${Date.now()}-${i}`,
      name: `${mode === "atlas" ? "item" : "frame"}-${i + 1}`,
      file: null,
      image: resized,
      normalMap: null,
      width: resized.naturalWidth,
      height: resized.naturalHeight,
      trimmed: false,
      isAi: true,
      mode,
      pivot: { x: 0.5, y: 0.5 },
    });
  }

  onProgress({ stage: "done", stageLabel: "Complete", completed: frameCount, total: frameCount });
  return sprites;
}
