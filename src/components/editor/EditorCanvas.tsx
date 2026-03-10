import { useEditorStore } from "@/stores/editor-store";
import { BinPageTabs } from "./BinPageTabs";
import { PivotOverlay } from "./PivotOverlay";
import { useRef, useEffect, useCallback, useMemo } from "react";

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sprites = useEditorStore((s) => s.sprites);
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const selectedSpriteId = useEditorStore((s) => s.selectedSpriteId);
  const selectSprite = useEditorStore((s) => s.selectSprite);
  const addSprites = useEditorStore((s) => s.addSprites);
  const animation = useEditorStore((s) => s.animation);
  const activeTab = useEditorStore((s) => s.activeTab);
  const pivotEditMode = useEditorStore((s) => s.pivotEditMode);
  const fitZoomApplied = useRef(false);

  // Reset auto-fit when tab changes so zoom recalculates for new content
  useEffect(() => {
    fitZoomApplied.current = false;
  }, [activeTab]);

  // Auto-fit zoom when bin changes or on first load
  useEffect(() => {
    const bin = bins[activeBin];
    const container = containerRef.current;
    if (!bin || !container) { fitZoomApplied.current = false; return; }
    // Only auto-fit on first pack or when bin size changes
    if (fitZoomApplied.current) return;
    fitZoomApplied.current = true;
    const rect = container.getBoundingClientRect();
    const padding = 32;
    const fitW = (rect.width - padding) / bin.width;
    const fitH = (rect.height - padding) / bin.height;
    const fit = Math.min(fitW, fitH, 1); // never zoom above 1:1
    setZoom(Math.round(fit * 100) / 100);
  }, [bins, activeBin, setZoom]);

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

    // Draw pivot crosshairs for all sprites (dimmed) and highlighted for selected
    if (pivotEditMode) {
      bin.rects.forEach((rect) => {
        const sprite = sprites.find((s) => s.id === rect.spriteId);
        if (!sprite) return;
        const rw = rect.rot ? rect.height : rect.width;
        const rh = rect.rot ? rect.width : rect.height;
        const px = rect.x + sprite.pivot.x * rw;
        const py = rect.y + sprite.pivot.y * rh;
        const isSelected = sprite.id === selectedSpriteId;
        const color = isSelected ? "#06B6D4" : "rgba(6,182,212,0.3)";
        const size = isSelected ? 6 : 3;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1;
        // Crosshair lines
        ctx.beginPath();
        ctx.moveTo(px - size, py); ctx.lineTo(px + size, py);
        ctx.moveTo(px, py - size); ctx.lineTo(px, py + size);
        ctx.stroke();
        // Center dot
        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 1.5 : 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }, [bins, activeBin, sprites, selectedSpriteId, animation, pivotEditMode]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const { scanDataTransfer, detectSequenceGroups } = await import("@/lib/folder-scanner");
    const scanned = await scanDataTransfer(e.dataTransfer);
    if (scanned.length === 0) return;

    const currentTab = useEditorStore.getState().activeTab;
    const importMode = currentTab === "assets" ? "atlas" as const : "sequence" as const;
    const sequenceGroups = detectSequenceGroups(scanned);
    const { setAnimationFrames, addSprites: add } = useEditorStore.getState();

    const newSprites: typeof sprites = [];
    let loaded = 0;
    const total = scanned.length;

    for (const item of scanned) {
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => {
          newSprites.push({
            id: crypto.randomUUID(),
            name: item.file.name.replace(/\.[^.]+$/, ""),
            file: item.file,
            image: img,
            normalMap: null,
            width: img.naturalWidth,
            height: img.naturalHeight,
            trimmed: false,
            isAi: false,
            mode: importMode,
            group: item.group || undefined,
            pivot: { x: 0.5, y: 0.5 },
          });
          loaded++;
          resolve();
        };
        img.onerror = () => { loaded++; resolve(); };
        img.src = URL.createObjectURL(item.file);
      });
    }

    if (newSprites.length > 0) {
      add(newSprites);

      // Auto-create animation sequences from folder groups
      if (importMode === "sequence" && sequenceGroups.size > 0) {
        // Build a map from filename to sprite id
        const nameToId = new Map(newSprites.map((s) => [s.name, s.id]));
        const allFrameIds: string[] = [];
        for (const [, groupFiles] of sequenceGroups) {
          for (const f of groupFiles) {
            const name = f.file.name.replace(/\.[^.]+$/, "");
            const id = nameToId.get(name);
            if (id) allFrameIds.push(id);
          }
        }
        if (allFrameIds.length > 0) {
          const existing = useEditorStore.getState().animation.frames;
          setAnimationFrames([...existing, ...allFrameIds]);
        }
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden flex flex-col flex-1"
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
      {/* Multi-atlas page tabs */}
      <BinPageTabs />
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

      {/* Pivot overlay */}
      <PivotOverlay />

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
