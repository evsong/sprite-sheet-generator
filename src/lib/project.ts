import type { SpriteItem, PackingConfig, AnimationState } from "@/stores/editor-store";

interface SpriteForgeProject {
  version: 1;
  name: string;
  packingConfig: PackingConfig;
  animation: { frames: string[]; fps: number; mode: "loop" | "pingpong" };
  sprites: {
    id: string;
    name: string;
    width: number;
    height: number;
    isAi: boolean;
    dataUrl: string; // base64 PNG
  }[];
}

function spriteToDataUrl(sprite: SpriteItem): string {
  if (!sprite.image) return "";
  const canvas = document.createElement("canvas");
  canvas.width = sprite.width;
  canvas.height = sprite.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(sprite.image, 0, 0);
  return canvas.toDataURL("image/png");
}

export function exportProject(
  sprites: SpriteItem[],
  packingConfig: PackingConfig,
  animation: AnimationState,
  name = "untitled"
): void {
  const project: SpriteForgeProject = {
    version: 1,
    name,
    packingConfig,
    animation: {
      frames: animation.frames,
      fps: animation.fps,
      mode: animation.mode,
    },
    sprites: sprites.map((s) => ({
      id: s.id,
      name: s.name,
      width: s.width,
      height: s.height,
      isAi: s.isAi,
      dataUrl: spriteToDataUrl(s),
    })),
  };

  const json = JSON.stringify(project);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.spriteforge`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importProject(file: File): Promise<{
  sprites: SpriteItem[];
  packingConfig: PackingConfig;
  animation: Partial<AnimationState>;
}> {
  const text = await file.text();
  const project: SpriteForgeProject = JSON.parse(text);

  if (project.version !== 1) {
    throw new Error("Unsupported project version");
  }

  const sprites: SpriteItem[] = await Promise.all(
    project.sprites.map(async (s) => {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load sprite: ${s.name}`));
        img.src = s.dataUrl;
      });

      return {
        id: s.id,
        name: s.name,
        file: null,
        image: img,
        width: s.width,
        height: s.height,
        trimmed: false,
        isAi: s.isAi,
      };
    })
  );

  return {
    sprites,
    packingConfig: project.packingConfig,
    animation: {
      frames: project.animation.frames,
      fps: project.animation.fps,
      mode: project.animation.mode,
    },
  };
}
