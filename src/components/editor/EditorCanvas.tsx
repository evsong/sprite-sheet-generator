import { useEditorStore } from "@/stores/editor-store";
import { useRef, useEffect, useCallback, useMemo } from "react";

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

  const stats = useMemo(() => {
    const bin = bins[activeBin];
    if (!bin) return null;
    const used = bin.rects.reduce((s, r) => s + r.width * r.height, 0);
    const total = bin.width * bin.height;
    const density = total > 0 ? (used / total) * 100 : 0;
    const vram = total * 4;
    const isPot = (bin.width & (bin.width - 1)) === 0 && (bin.height & (bin.height - 1)) === 0;
    return { w: bin.width, h: bin.height, density, vram: vram < 1048576 ? `${(vram/1024).toFixed(1)} KB` : `${(vram/1048576).toFixed(1)} MB`, pot: isPot };
  }, [bins, activeBin]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const bin = bins[activeBin];
    if (!canvas || !bin) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    for (let i = bin.rects.length - 1; i >= 0; i--) {
      const r = bin.rects[i];
      const rw = r.rot ? r.height : r.width;
      const rh = r.rot ? r.width : r.height;
      if (x >= r.x && x <= r.x + rw && y >= r.y && y <= r.y + rh) { selectSprite(r.spriteId); return; }
    }
    selectSprite(null);
  }, [bins, activeBin, zoom, selectSprite]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bin = bins[activeBin];
    if (!bin) {
      canvas.width = 512; canvas.height = 512;
      ctx.clearRect(0, 0, 512, 512);
      const sz = 16;
      for (let y = 0; y < 512; y += sz) for (let x = 0; x < 512; x += sz) {
        ctx.fillStyle = (x / sz + y / sz) % 2 === 0 ? "#0A0A0A" : "#0F0F0F";
        ctx.fillRect(x, y, sz, sz);
      }
      if (sprites.length === 0) {
        ctx.fillStyle = "#333"; ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.textAlign = "center"; ctx.fillText("Drop sprites here to begin", 256, 256);
      }
      return;
    }
    canvas.width = bin.width; canvas.height = bin.height;
    ctx.clearRect(0, 0, bin.width, bin.height);
    const sz = 16;
    for (let y = 0; y < bin.height; y += sz) for (let x = 0; x < bin.width; x += sz) {
      ctx.fillStyle = (x / sz + y / sz) % 2 === 0 ? "#0A0A0A" : "#0F0F0F";
      ctx.fillRect(x, y, sz, sz);
    }
    bin.rects.forEach((rect) => {
      const sprite = sprites.find((s) => s.id === rect.spriteId);
      if (!sprite?.image) return;
      ctx.save();
      if (rect.rot) { ctx.translate(rect.x + rect.height, rect.y); ctx.rotate(Math.PI / 2); }
      if (sprite.trimmed && sprite.trimRect) {
        const tr = sprite.trimRect;
        ctx.drawImage(sprite.image, tr.x, tr.y, tr.w, tr.h, rect.rot ? 0 : rect.x, rect.rot ? 0 : rect.y, rect.width, rect.height);
      } else {
        ctx.drawImage(sprite.image, rect.rot ? 0 : rect.x, rect.rot ? 0 : rect.y, rect.width, rect.height);
      }
      ctx.restore();
      if (sprite.id === selectedSpriteId) {
        ctx.strokeStyle = "#06B6D4"; ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.rot ? rect.height : rect.width, rect.rot ? rect.width : rect.height);
        ctx.fillStyle = "rgba(6,182,212,0.08)";
        ctx.fillRect(rect.x, rect.y, rect.rot ? rect.height : rect.width, rect.rot ? rect.width : rect.height);
      }
    });
    if (animation.onionSkin && !animation.playing && animation.frames.length > 1) {
      const cur = animation.currentFrame;
      const ghosts: { idx: number; alpha: number; tint: string }[] = [];
      if (cur > 0) ghosts.push({ idx: cur - 1, alpha: 0.3, tint: "rgba(59,130,246," });
      if (cur < animation.frames.length - 1) ghosts.push({ idx: cur + 1, alpha: 0.15, tint: "rgba(239,68,68," });
      for (const g of ghosts) {
        const gs = sprites.find((s) => s.id === animation.frames[g.idx]);
        const cs = sprites.find((s) => s.id === animation.frames[cur]);
        if (!gs?.image || !cs) continue;
        const cr = bin.rects.find((r) => r.spriteId === cs.id);
        if (!cr) continue;
        ctx.save(); ctx.globalAlpha = g.alpha;
        ctx.drawImage(gs.image, cr.x, cr.y, cr.width, cr.height);
        ctx.fillStyle = g.tint + g.alpha * 0.5 + ")";
        ctx.fillRect(cr.x, cr.y, cr.width, cr.height);
        ctx.restore();
      }
    }
  }, [bins, activeBin, sprites, selectedSpriteId, animation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const newSprites: typeof sprites = [];
    let loaded = 0;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const img = new Image();
      img.onload = () => {
        newSprites.push({ id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ""), file, image: img, width: img.naturalWidth, height: img.naturalHeight, trimmed: false, isAi: false });
        loaded++;
        if (loaded === files.length) addSprites(newSprites);
      };
      img.src = URL.createObjectURL(file);
    });
  }, [addSprites]);

  return (
    <div ref={containerRef} className="relative overflow-hidden flex flex-col"
      style={{ background: "var(--bg)" }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={handleDrop}>
      {/* Usage bar above canvas */}
      {stats && (
        <div className="flex items-center gap-1 shrink-0" style={{ padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: 8, zIndex: 2 }}>
          <span style={{ color: "var(--text-muted)" }}>PACK</span>
          <div style={{ width: 48, height: 4, background: "var(--bg-elevated)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${stats.density}%`, background: "#22C55E" }} />
          </div>
          <span style={{ color: "#22C55E", fontWeight: 600 }}>{stats.density.toFixed(1)}%</span>
        </div>
      )}
      {/* Checkerboard */}
      <div className="absolute inset-0" style={{
        backgroundSize: "16px 16px",
        backgroundImage: "linear-gradient(45deg, #0D0D0F 25%, transparent 25%), linear-gradient(-45deg, #0D0D0F 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0D0D0F 75%), linear-gradient(-45deg, transparent 75%, #0D0D0F 75%)",
        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
      }} />

      {/* Canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
          <canvas ref={canvasRef} onClick={handleCanvasClick} className="cursor-crosshair"
            style={{ outline: "1px solid rgba(6,182,212,0.2)", imageRendering: zoom >= 2 ? "pixelated" : "auto" }} />
        </div>
      </div>

      {/* Canvas info bar */}
      <div className="absolute flex gap-2" style={{
        bottom: 6, right: 8, fontFamily: "var(--font-mono)", fontSize: 8,
        color: "var(--text-muted)", background: "rgba(0,0,0,0.8)", padding: "2px 6px",
      }}>
        {stats ? (
          <>
            <span>{stats.w} × {stats.h}</span>
            <span>RGBA8888</span>
            <span>{stats.pot ? "POT" : "NPOT"}</span>
            <span style={{ color: "#22C55E" }}>{stats.density.toFixed(1)}% packed</span>
            <span>~{stats.vram} VRAM</span>
          </>
        ) : <span>No sprites loaded</span>}
      </div>
    </div>
  );
}
