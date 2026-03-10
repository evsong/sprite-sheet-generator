import { useEditorStore } from "@/stores/editor-store";
import { useRef, useEffect } from "react";

export function AnimationPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sprites = useEditorStore((s) => s.sprites);
  const animation = useEditorStore((s) => s.animation);
  const selectedSpriteId = useEditorStore((s) => s.selectedSpriteId);

  // When not playing and a sprite is selected, show it; otherwise show current animation frame
  const selectedSprite = selectedSpriteId ? sprites.find((s) => s.id === selectedSpriteId && s.mode !== "atlas") : null;
  const animSpriteId = animation.frames[animation.currentFrame];
  const currentSprite = (!animation.playing && selectedSprite) ? selectedSprite : sprites.find((s) => s.id === animSpriteId);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const cw = Math.floor(rect.width);
    const ch = Math.floor(rect.height);
    canvas.width = cw;
    canvas.height = ch;

    // Draw checkerboard background
    const sz = 12;
    for (let y = 0; y < ch; y += sz) {
      for (let x = 0; x < cw; x += sz) {
        ctx.fillStyle = (Math.floor(x / sz) + Math.floor(y / sz)) % 2 === 0 ? "#0A0A0A" : "#0F0F0F";
        ctx.fillRect(x, y, sz, sz);
      }
    }

    if (!currentSprite?.image) {
      // No frames hint
      ctx.fillStyle = "#333";
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("No animation frames", cw / 2, ch / 2 - 8);
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#555";
      ctx.fillText("Generate or import frames to preview", cw / 2, ch / 2 + 10);
      return;
    }

    // Calculate scale to fit sprite in container with padding
    const padding = 24;
    const maxW = cw - padding * 2;
    const maxH = ch - padding * 2;
    const scale = Math.min(maxW / currentSprite.width, maxH / currentSprite.height);
    const drawW = currentSprite.width * scale;
    const drawH = currentSprite.height * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    // Onion skin: draw previous and next frames as ghosts
    if (animation.onionSkin && !animation.playing && animation.frames.length > 1) {
      const cur = animation.currentFrame;
      const ghosts: { idx: number; alpha: number; tint: string }[] = [];
      if (cur > 0) ghosts.push({ idx: cur - 1, alpha: 0.25, tint: "rgba(59,130,246," });
      if (cur < animation.frames.length - 1) ghosts.push({ idx: cur + 1, alpha: 0.12, tint: "rgba(239,68,68," });
      for (const g of ghosts) {
        const gs = sprites.find((s) => s.id === animation.frames[g.idx]);
        if (!gs?.image) continue;
        ctx.save();
        ctx.globalAlpha = g.alpha;
        ctx.imageSmoothingEnabled = scale < 2;
        ctx.drawImage(gs.image, drawX, drawY, drawW, drawH);
        ctx.fillStyle = g.tint + (g.alpha * 0.5) + ")";
        ctx.fillRect(drawX, drawY, drawW, drawH);
        ctx.restore();
      }
    }

    // Draw current frame
    ctx.save();
    ctx.imageSmoothingEnabled = scale < 2;
    if (scale >= 2) ctx.imageSmoothingQuality = "low";
    ctx.drawImage(currentSprite.image, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Selection highlight
    ctx.strokeStyle = "rgba(6,182,212,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX, drawY, drawW, drawH);

  }, [currentSprite, animation, sprites, selectedSpriteId]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      style={{ borderRight: "1px solid var(--border)" }}
    >
      {/* Label */}
      <div
        className="absolute z-10"
        style={{
          top: 4, left: 8,
          fontFamily: "var(--font-mono)", fontSize: 8,
          color: "var(--text-muted)", textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Preview
        {!animation.playing && selectedSprite ? (
          <span style={{ color: "var(--cyan)", marginLeft: 6 }}>
            {selectedSprite.name}
          </span>
        ) : animation.frames.length > 0 ? (
          <span style={{ color: "var(--cyan)", marginLeft: 6 }}>
            {String(animation.currentFrame + 1).padStart(2, "0")}/{String(animation.frames.length).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
