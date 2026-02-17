import { MaxRectsPacker, Rectangle } from "maxrects-packer";
import type { SpriteItem, PackedBin, PackingConfig } from "@/stores/editor-store";

export function packSprites(
  sprites: SpriteItem[],
  config: PackingConfig
): PackedBin[] {
  if (sprites.length === 0) return [];

  const packer = new MaxRectsPacker(config.maxWidth, config.maxHeight, config.padding, {
    smart: true,
    pot: config.pot,
    square: false,
    allowRotation: config.allowRotation,
    border: config.border,
  });

  const rects: Rectangle[] = sprites.map((sprite) => {
    const w = sprite.trimmed && sprite.trimRect ? sprite.trimRect.w : sprite.width;
    const h = sprite.trimmed && sprite.trimRect ? sprite.trimRect.h : sprite.height;
    const rect = new Rectangle(w, h);
    (rect as Rectangle & { data: string }).data = sprite.id;
    return rect;
  });

  packer.addArray(rects);

  return packer.bins.map((bin) => ({
    width: bin.width,
    height: bin.height,
    rects: bin.rects.map((r) => ({
      spriteId: (r as Rectangle & { data: string }).data,
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      rot: r.rot ?? false,
    })),
  }));
}

export function trimTransparency(
  image: HTMLImageElement
): { trimRect: { x: number; y: number; w: number; h: number }; sourceSize: { w: number; h: number } } | null {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  let top = height, bottom = 0, left = width, right = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  if (top > bottom || left > right) return null; // fully transparent

  return {
    trimRect: { x: left, y: top, w: right - left + 1, h: bottom - top + 1 },
    sourceSize: { w: width, h: height },
  };
}
