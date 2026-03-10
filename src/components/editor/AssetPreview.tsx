import { useEditorStore } from "@/stores/editor-store";
import { useRef, useEffect } from "react";

export function AssetPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sprites = useEditorStore((s) => s.sprites);
  const selectedSpriteId = useEditorStore((s) => s.selectedSpriteId);

  const selectedSprite = sprites.find(
    (s) => s.id === selectedSpriteId && s.mode === "atlas"
  );

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

    // Checkerboard background
    const sz = 12;
    for (let y = 0; y < ch; y += sz) {
      for (let x = 0; x < cw; x += sz) {
        ctx.fillStyle =
          (Math.floor(x / sz) + Math.floor(y / sz)) % 2 === 0
            ? "#0A0A0A"
            : "#0F0F0F";
        ctx.fillRect(x, y, sz, sz);
      }
    }

    if (!selectedSprite?.image) {
      ctx.fillStyle = "#333";
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("No asset selected", cw / 2, ch / 2 - 8);
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#555";
      ctx.fillText("Click an asset to preview", cw / 2, ch / 2 + 10);
      return;
    }

    // Scale to fit
    const padding = 24;
    const maxW = cw - padding * 2;
    const maxH = ch - padding * 2;
    const scale = Math.min(
      maxW / selectedSprite.width,
      maxH / selectedSprite.height
    );
    const drawW = selectedSprite.width * scale;
    const drawH = selectedSprite.height * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.save();
    ctx.imageSmoothingEnabled = scale < 2;
    if (scale >= 2) ctx.imageSmoothingQuality = "low";
    ctx.drawImage(selectedSprite.image, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Selection highlight
    ctx.strokeStyle = "rgba(6,182,212,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX, drawY, drawW, drawH);
  }, [selectedSprite, sprites]);

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
          top: 4,
          left: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 8,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Preview
        {selectedSprite && (
          <span style={{ color: "var(--cyan)", marginLeft: 6 }}>
            {selectedSprite.name}
          </span>
        )}
      </div>

      {/* Size info */}
      {selectedSprite && (
        <div
          className="absolute z-10"
          style={{
            bottom: 4,
            left: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            color: "var(--text-muted)",
          }}
        >
          {selectedSprite.width}×{selectedSprite.height}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
