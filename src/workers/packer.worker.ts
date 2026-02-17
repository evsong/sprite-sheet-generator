import { MaxRectsPacker, Rectangle } from "maxrects-packer";

interface PackerInput {
  sprites: Array<{
    id: string;
    width: number;
    height: number;
    trimmed: boolean;
    trimRect?: { x: number; y: number; w: number; h: number };
  }>;
  config: {
    maxWidth: number;
    maxHeight: number;
    padding: number;
    border: number;
    pot: boolean;
    allowRotation: boolean;
  };
}

self.onmessage = (e: MessageEvent<PackerInput>) => {
  const { sprites, config } = e.data;

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

  const bins = packer.bins.map((bin) => ({
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

  self.postMessage(bins);
};
