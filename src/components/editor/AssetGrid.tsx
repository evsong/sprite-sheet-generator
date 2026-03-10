import { useEditorStore } from "@/stores/editor-store";
import { removeBackground } from "@/lib/bg-removal";
import { useCallback, useState } from "react";

export function AssetGrid() {
  const sprites = useEditorStore((s) => s.sprites);
  const selectedSpriteId = useEditorStore((s) => s.selectedSpriteId);
  const selectSprite = useEditorStore((s) => s.selectSprite);
  const bins = useEditorStore((s) => s.bins);
  const setActiveBin = useEditorStore((s) => s.setActiveBin);
  const removeSprite = useEditorStore((s) => s.removeSprite);
  const updateSprite = useEditorStore((s) => s.updateSprite);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; spriteId: string } | null>(null);
  const [processingBg, setProcessingBg] = useState<string | null>(null);

  const atlasSprites = sprites.filter((s) => s.mode === "atlas");

  const handleRemoveBg = useCallback(async (spriteId: string) => {
    const sprite = sprites.find((s) => s.id === spriteId);
    if (!sprite?.image || processingBg) return;
    setProcessingBg(spriteId);
    try {
      const result = await removeBackground(sprite.image);
      updateSprite(spriteId, { image: result.image, width: result.image.naturalWidth, height: result.image.naturalHeight, file: new File([result.blob], `${sprite.name}-nobg.png`, { type: "image/png" }) });
    } catch (err) { console.error("Background removal failed:", err); }
    finally { setProcessingBg(null); }
  }, [sprites, processingBg, updateSprite]);

  const spriteToBase64 = useCallback((spriteId: string): string | null => {
    const sprite = sprites.find((s) => s.id === spriteId);
    if (!sprite?.image) return null;
    const c = document.createElement("canvas");
    c.width = sprite.width; c.height = sprite.height;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(sprite.image, 0, 0);
    return c.toDataURL("image/png");
  }, [sprites]);

  const handleAiAction = useCallback(async (spriteId: string, action: "variants" | "recolor" | "upscale") => {
    const sprite = sprites.find((s) => s.id === spriteId);
    if (!sprite) return;
    const b64 = spriteToBase64(spriteId);
    if (!b64) return;
    const { addSprites, setAiProgress } = useEditorStore.getState();
    const total = action === "variants" ? 3 : 1;
    const label = { variants: "Generating variants", recolor: "Recoloring", upscale: "Upscaling" }[action];
    setAiProgress({ active: true, total, completed: 0, prompt: label });
    try {
      const res = await fetch("/api/ai/transform", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, imageBase64: b64, count: total }) });
      const data = await res.json();
      if (!res.ok) { setAiProgress({ active: false, total, completed: 0, prompt: label, error: data.error }); return; }
      for (let i = 0; i < data.images.length; i++) {
        const img = new Image();
        await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = data.images[i]; });
        const suffix = action === "upscale" ? "-2x" : `-${action}-${i + 1}`;
        addSprites([{ id: crypto.randomUUID(), name: `${sprite.name}${suffix}`, file: null, image: img, normalMap: null, width: img.naturalWidth, height: img.naturalHeight, trimmed: false, isAi: true, mode: "atlas", pivot: { x: 0.5, y: 0.5 } }]);
        setAiProgress({ active: true, total, completed: i + 1, prompt: label });
      }
      setTimeout(() => setAiProgress(null), 2000);
    } catch { setAiProgress({ active: false, total, completed: 0, prompt: label, error: "Network error" }); }
  }, [sprites, spriteToBase64]);

  return (
    <div className="flex items-center gap-2" style={{
      gridColumn: "1 / -1",
      background: "var(--bg-panel)",
      borderTop: "1px solid var(--border)",
      padding: "0 8px",
    }}>
      {atlasSprites.length === 0 ? (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
          Generate or import assets to see them here
        </span>
      ) : (
        <div className="flex gap-1 overflow-x-auto flex-1 py-1 flex-wrap">
          {atlasSprites.map((sprite) => (
            <button key={sprite.id}
              onClick={() => { selectSprite(sprite.id); const bi = bins.findIndex((b) => b.rects.some((r) => r.spriteId === sprite.id)); if (bi >= 0) setActiveBin(bi); }}
              onContextMenu={(e) => { e.preventDefault(); selectSprite(sprite.id); setContextMenu({ x: e.clientX, y: e.clientY, spriteId: sprite.id }); }}
              className="shrink-0 flex items-center justify-center cursor-pointer transition-all"
              style={{
                width: 48, height: 48,
                border: `1px solid ${selectedSpriteId === sprite.id ? "var(--cyan)" : "var(--border)"}`,
                background: selectedSpriteId === sprite.id ? "rgba(6,182,212,0.1)" : "transparent",
                boxShadow: selectedSpriteId === sprite.id ? "0 0 4px rgba(6,182,212,0.4)" : "none",
              }}>
              {sprite.image && (
                <canvas ref={(canvas) => {
                  if (canvas && sprite.image) {
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      canvas.width = 40; canvas.height = 40;
                      const scale = Math.min(40 / sprite.width, 40 / sprite.height);
                      const w = sprite.width * scale, h = sprite.height * scale;
                      ctx.clearRect(0, 0, 40, 40);
                      ctx.drawImage(sprite.image, (40 - w) / 2, (40 - h) / 2, w, h);
                    }
                  }
                }} width={40} height={40} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[199]" onClick={() => setContextMenu(null)} />
          <div className="fixed z-[200] py-0.5" style={{ left: contextMenu.x, top: contextMenu.y, minWidth: 160, background: "var(--bg-panel)", border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.6)" }}>
            <CtxItem icon="del" label="Delete" danger onClick={() => { removeSprite(contextMenu.spriteId); setContextMenu(null); }} />
            <div style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
            <CtxItem icon="star" label="AI Variants" ai onClick={() => { handleAiAction(contextMenu.spriteId, "variants"); setContextMenu(null); }} />
            <CtxItem icon="recolor" label="AI Recolor" ai onClick={() => { handleAiAction(contextMenu.spriteId, "recolor"); setContextMenu(null); }} />
            <CtxItem icon="upscale" label="AI Upscale 2x" ai onClick={() => { handleAiAction(contextMenu.spriteId, "upscale"); setContextMenu(null); }} />
            <CtxItem icon="rmbg" label={processingBg ? "Removing BG..." : "AI Remove BG"} ai onClick={() => { handleRemoveBg(contextMenu.spriteId); setContextMenu(null); }} />
          </div>
        </>
      )}
    </div>
  );
}

function CtxItem({ label, ai, danger, icon, onClick }: { label: string; ai?: boolean; danger?: boolean; icon?: string; onClick: () => void }) {
  const color = ai ? "var(--amber)" : danger ? "#EF4444" : "var(--text-dim)";
  const hoverBg = ai ? "rgba(245,158,11,0.08)" : danger ? "rgba(239,68,68,0.08)" : "var(--bg-elevated)";
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 w-full transition-all duration-100"
      style={{ padding: "4px 10px", fontFamily: "var(--font-mono)", fontSize: 9, color }}
      onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = ai ? "#FBBF24" : danger ? "#EF4444" : "var(--text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = color; }}>
      {icon && <span style={{ width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CtxIcon type={icon} /></span>}
      <span>{label}</span>
    </button>
  );
}

function CtxIcon({ type }: { type: string }) {
  if (type === "del") return <svg viewBox="0 0 16 16" width="11" height="11"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5"/></svg>;
  if (type === "star") return <svg viewBox="0 0 16 16" width="11" height="11"><path d="M8 0l1.5 4.5L14 6l-4.5 1.5L8 12l-1.5-4.5L2 6l4.5-1.5z" fill="currentColor"/></svg>;
  if (type === "recolor") return <svg viewBox="0 0 16 16" width="11" height="11"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2.5" fill="currentColor"/></svg>;
  if (type === "upscale") return <svg viewBox="0 0 16 16" width="11" height="11"><path d="M3 13L13 3M13 3H7M13 3v6" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>;
  if (type === "rmbg") return <svg viewBox="0 0 16 16" width="11" height="11"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>;
  return null;
}
