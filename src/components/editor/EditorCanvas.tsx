import { useEditorStore } from "@/stores/editor-store";
import { useRef, useEffect, useCallback } from "react";

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sprites = useEditorStore((s) => s.sprites);
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const zoom = useEditorStore((s) => s.zoom);
  const selectedSpriteId = useEditorStore((s) => s.selectedSpriteId);
  const selectSprite = useEditorStore((s) => s.selectSprite);
  const addSprites = useEditorStore((s) => s.addSprites);
  const animation = useEditorStore((s) => s.animation);

  // Click on canvas to select sprite
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const bin = bins[activeBin];
      if (!canvas || !bin) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      // Find clicked rect (reverse order so topmost wins)
      for (let i = bin.rects.length - 1; i >= 0; i--) {
        const r = bin.rects[i];
        const rw = r.rot ? r.height : r.width;
        const rh = r.rot ? r.width : r.height;
        if (x >= r.x && x <= r.x + rw && y >= r.y && y <= r.y + rh) {
          selectSprite(r.spriteId);
          return;
        }
      }
      selectSprite(null);
    },
    [bins, activeBin, zoom, selectSprite]
  );

  // Draw packed sprites on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bin = bins[activeBin];
    if (!bin) {
      canvas.width = 512;
      canvas.height = 512;
      ctx.clearRect(0, 0, 512, 512);

      // Draw checkerboard
      const size = 16;
      for (let y = 0; y < 512; y += size) {
        for (let x = 0; x < 512; x += size) {
          ctx.fillStyle = (x / size + y / size) % 2 === 0 ? "#0A0A0A" : "#0F0F0F";
          ctx.fillRect(x, y, size, size);
        }
      }

      if (sprites.length === 0) {
        ctx.fillStyle = "#333";
        ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("Drop sprites here to begin", 256, 256);
      }
      return;
    }

    canvas.width = bin.width;
    canvas.height = bin.height;
    ctx.clearRect(0, 0, bin.width, bin.height);

    // Checkerboard background
    const size = 16;
    for (let y = 0; y < bin.height; y += size) {
      for (let x = 0; x < bin.width; x += size) {
        ctx.fillStyle = (x / size + y / size) % 2 === 0 ? "#0A0A0A" : "#0F0F0F";
        ctx.fillRect(x, y, size, size);
      }
    }

    // Draw each packed rect
    bin.rects.forEach((rect) => {
      const sprite = sprites.find((s) => s.id === rect.spriteId);
      if (!sprite?.image) return;

      ctx.save();
      if (rect.rot) {
        ctx.translate(rect.x + rect.height, rect.y);
        ctx.rotate(Math.PI / 2);
      }

      // Draw trimmed region if applicable
      if (sprite.trimmed && sprite.trimRect) {
        const tr = sprite.trimRect;
        ctx.drawImage(
          sprite.image,
          tr.x, tr.y, tr.w, tr.h,
          rect.rot ? 0 : rect.x, rect.rot ? 0 : rect.y,
          rect.width, rect.height
        );
      } else {
        ctx.drawImage(
          sprite.image,
          rect.rot ? 0 : rect.x, rect.rot ? 0 : rect.y,
          rect.width, rect.height
        );
      }
      ctx.restore();

      // Selection highlight
      if (sprite.id === selectedSpriteId) {
        ctx.strokeStyle = "#06B6D4";
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.rot ? rect.height : rect.width, rect.rot ? rect.width : rect.height);
        ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
        ctx.fillRect(rect.x, rect.y, rect.rot ? rect.height : rect.width, rect.rot ? rect.width : rect.height);
      }
    });
    // Onion skin: draw ghost frames from animation
    if (animation.onionSkin && !animation.playing && animation.frames.length > 1) {
      const cur = animation.currentFrame;
      const ghostFrames: { idx: number; alpha: number; tint: string }[] = [];
      if (cur > 0) ghostFrames.push({ idx: cur - 1, alpha: 0.3, tint: "rgba(59,130,246," }); // blue prev
      if (cur < animation.frames.length - 1) ghostFrames.push({ idx: cur + 1, alpha: 0.15, tint: "rgba(239,68,68," }); // red next

      for (const ghost of ghostFrames) {
        const ghostSprite = sprites.find((s) => s.id === animation.frames[ghost.idx]);
        const currentSprite = sprites.find((s) => s.id === animation.frames[cur]);
        if (!ghostSprite?.image || !currentSprite) continue;

        // Find where the current frame sprite is packed
        const currentRect = bin.rects.find((r) => r.spriteId === currentSprite.id);
        if (!currentRect) continue;

        ctx.save();
        ctx.globalAlpha = ghost.alpha;
        // Draw ghost at same position as current frame
        ctx.drawImage(
          ghostSprite.image,
          currentRect.x, currentRect.y,
          currentRect.width, currentRect.height
        );
        // Tint overlay
        ctx.fillStyle = ghost.tint + ghost.alpha * 0.5 + ")";
        ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
        ctx.restore();
      }
    }
  }, [bins, activeBin, sprites, selectedSpriteId, animation]);

  // Drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (!files.length) return;

      const newSprites: typeof sprites = [];
      let loaded = 0;
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const img = new Image();
        img.onload = () => {
          newSprites.push({
            id: crypto.randomUUID(),
            name: file.name.replace(/\.[^.]+$/, ""),
            file,
            image: img,
            width: img.naturalWidth,
            height: img.naturalHeight,
            trimmed: false,
            isAi: false,
          });
          loaded++;
          if (loaded === files.length) addSprites(newSprites);
        };
        img.src = URL.createObjectURL(file);
      });
    },
    [addSprites]
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#080808] overflow-auto relative"
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={handleDrop}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#666 1px, transparent 1px), linear-gradient(90deg, #666 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Canvas */}
      <div
        className="relative inline-block m-8"
        style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="border border-[#1E1E1E] rounded cursor-crosshair"
          style={{ imageRendering: zoom >= 2 ? "pixelated" : "auto" }}
        />

        {/* Bin size label */}
        {bins[activeBin] && (
          <div className="absolute -bottom-5 left-0 font-[family-name:var(--font-mono)] text-[9px] text-[#666]">
            {bins[activeBin].width} × {bins[activeBin].height}
          </div>
        )}
      </div>
    </div>
  );
}
