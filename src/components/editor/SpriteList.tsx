import { useEditorStore, SpriteItem } from "@/stores/editor-store";
import { removeBackground } from "@/lib/bg-removal";
import { useCallback, useRef, useState } from "react";

function CtxIcon({ d, type }: { d: string; type?: string }) {
  if (type === "dup") return <svg viewBox="0 0 16 16" width="11" height="11"><rect x="1" y="1" width="6" height="6" fill="currentColor" opacity="0.6"/><rect x="9" y="1" width="6" height="6" fill="currentColor" opacity="0.4"/><rect x="1" y="9" width="6" height="6" fill="currentColor" opacity="0.3"/></svg>;
  if (type === "rename") return <svg viewBox="0 0 16 16" width="11" height="11"><path d="M2 2h12v12H2z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5"/></svg>;
  if (type === "del") return <svg viewBox="0 0 16 16" width="11" height="11"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5"/></svg>;
  if (type === "star") return <svg viewBox="0 0 16 16" width="11" height="11"><path d="M8 0l1.5 4.5L14 6l-4.5 1.5L8 12l-1.5-4.5L2 6l4.5-1.5z" fill="currentColor"/></svg>;
  if (type === "recolor") return <svg viewBox="0 0 16 16" width="11" height="11"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2.5" fill="currentColor"/></svg>;
  if (type === "upscale") return <svg viewBox="0 0 16 16" width="11" height="11"><path d="M3 13L13 3M13 3H7M13 3v6" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>;
  if (type === "rmbg") return <svg viewBox="0 0 16 16" width="11" height="11"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>;
  if (type === "extend") return <svg viewBox="0 0 16 16" width="11" height="11"><rect x="1" y="4" width="5" height="8" fill="currentColor" opacity="0.7"/><rect x="7" y="2" width="5" height="12" fill="currentColor" opacity="0.5"/><path d="M14 6l-2 2 2 2" stroke="currentColor" strokeWidth="1" fill="none"/></svg>;
  if (type === "anim") return <svg viewBox="0 0 16 16" width="11" height="11"><rect x="2" y="2" width="5" height="12" fill="currentColor" opacity="0.6"/><rect x="9" y="2" width="5" height="12" fill="currentColor" opacity="0.3"/></svg>;
  return null;
}

function CtxItem({ label, shortcut, ai, danger, icon, onClick }: { label: string; shortcut?: string; ai?: boolean; danger?: boolean; icon?: string; onClick: () => void }) {
  const color = ai ? "var(--amber)" : danger ? "#EF4444" : "var(--text-dim)";
  const hoverBg = ai ? "rgba(245,158,11,0.08)" : danger ? "rgba(239,68,68,0.08)" : "var(--bg-elevated)";
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 w-full transition-all duration-100"
      style={{ padding: "4px 10px", fontFamily: "var(--font-mono)", fontSize: 9, color }}
      onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = ai ? "#FBBF24" : danger ? "#EF4444" : "var(--text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = color; }}>
      {icon && <span style={{ width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CtxIcon d="" type={icon} /></span>}
      <span>{label}</span>
      {shortcut && <span className="ml-auto" style={{ fontSize: 7, color: "var(--text-muted)" }}>{shortcut}</span>}
    </button>
  );
}

export function SpriteList() {
  const sprites = useEditorStore((s) => s.sprites);
  const selectedSpriteId = useEditorStore((s) => s.selectedSpriteId);
  const selectSprite = useEditorStore((s) => s.selectSprite);
  const removeSprite = useEditorStore((s) => s.removeSprite);
  const addSprites = useEditorStore((s) => s.addSprites);
  const reorderSprites = useEditorStore((s) => s.reorderSprites);
  const addToAnimation = useEditorStore((s) => s.addToAnimation);
  const setAnimationFrames = useEditorStore((s) => s.setAnimationFrames);
  const updateSprite = useEditorStore((s) => s.updateSprite);
  const setAiModalOpen = useEditorStore((s) => s.setAiModalOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; spriteId: string } | null>(null);
  const [processingBg, setProcessingBg] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFileUpload = useCallback((files: FileList) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    const newSprites: SpriteItem[] = [];
    let loaded = 0;
    imageFiles.forEach((file) => {
      const img = new Image();
      img.onload = () => {
        newSprites.push({ id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ""), file, image: img, width: img.naturalWidth, height: img.naturalHeight, trimmed: false, isAi: false });
        loaded++;
        if (loaded === imageFiles.length) addSprites(newSprites);
      };
      img.src = URL.createObjectURL(file);
    });
  }, [addSprites]);

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

  const spriteToBase64 = useCallback((sprite: SpriteItem): string | null => {
    if (!sprite.image) return null;
    const c = document.createElement("canvas");
    c.width = sprite.width; c.height = sprite.height;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(sprite.image, 0, 0);
    return c.toDataURL("image/png");
  }, []);

  const handleAiAction = useCallback(async (spriteId: string, action: "variants" | "recolor" | "upscale" | "extend-frames") => {
    const sprite = sprites.find((s) => s.id === spriteId);
    if (!sprite) return;
    const b64 = spriteToBase64(sprite);
    if (!b64) return;
    const { addSprites: add, setAiProgress } = useEditorStore.getState();
    const total = action === "variants" ? 3 : action === "extend-frames" ? 4 : 1;
    const label = { variants: "Generating variants", recolor: "Recoloring", upscale: "Upscaling", "extend-frames": "Extending frames" }[action];
    setAiProgress({ active: true, total, completed: 0, prompt: label });
    try {
      const res = await fetch("/api/ai/transform", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, imageBase64: b64, count: total }) });
      const data = await res.json();
      if (!res.ok) { setAiProgress({ active: false, total, completed: 0, prompt: label, error: data.error }); return; }
      for (let i = 0; i < data.images.length; i++) {
        const img = new Image();
        await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = data.images[i]; });
        const suffix = action === "upscale" ? "-2x" : `-${action}-${i + 1}`;
        add([{ id: crypto.randomUUID(), name: `${sprite.name}${suffix}`, file: null, image: img, width: img.naturalWidth, height: img.naturalHeight, trimmed: false, isAi: true }]);
        setAiProgress({ active: true, total, completed: i + 1, prompt: label });
      }
      setTimeout(() => setAiProgress(null), 2000);
    } catch { setAiProgress({ active: false, total, completed: 0, prompt: label, error: "Network error" }); }
  }, [sprites, spriteToBase64]);

  return (
    <div className="flex flex-col overflow-y-auto" style={{ background: "var(--bg-panel)", borderRight: "1px solid var(--border)" }}>
      {/* Import section */}
      <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Import</h4>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files); }}
          className="cursor-pointer hover:border-[var(--cyan)] transition-colors"
          style={{ border: "1px dashed var(--border)", padding: "10px 6px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}
        >
          Drop PNG / JPG frames<br />or click to browse
        </div>
        <input ref={fileInputRef} type="file" multiple accept="image/png,image/webp,image/gif,image/jpeg" className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
      </div>
      {/* AI Generate section */}
      <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>AI Generate</h4>
        <div className="flex flex-col gap-1">
          <textarea placeholder="Pixel knight, 8 frames, walk cycle..." className="focus:outline-none focus:border-[var(--amber)] focus:shadow-[0_0_0_1px_rgba(245,158,11,0.3),0_0_12px_rgba(245,158,11,0.1)]"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 9, padding: "4px 6px", resize: "none", height: 38 }} />
          <button onClick={() => setAiModalOpen(true)} className="hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all duration-200"
            style={{ height: 20, background: "linear-gradient(135deg, #F59E0B, #F97316)", color: "#000", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <svg viewBox="0 0 16 16" width="10" height="10" style={{ verticalAlign: "-1px", marginRight: 3 }}>
              <path d="M8 0l1.5 4.5L14 6l-4.5 1.5L8 12l-1.5-4.5L2 6l4.5-1.5z" fill="#000" opacity="0.7" />
              <path d="M13 10l.75 2.25L16 13l-2.25.75L13 16l-.75-2.25L10 13l2.25-.75z" fill="#000" opacity="0.5" />
            </svg>
            + Generate New...
          </button>
        </div>
      </div>
      {/* Sprites list */}
      <div style={{ padding: "6px 8px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
          Sprites ({sprites.length})
        </h4>
        <div className="flex flex-col gap-px flex-1 overflow-y-auto">
          {sprites.map((sprite, index) => (
            <div key={sprite.id} draggable
              onDragStart={(e) => { setDragIndex(index); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", ""); }}
              onDragOver={(e) => { if (dragIndex === null) return; e.preventDefault(); setDragOverIndex(index); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (dragIndex !== null && dragIndex !== index) reorderSprites(dragIndex, index); setDragIndex(null); setDragOverIndex(null); }}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              onClick={() => selectSprite(sprite.id)}
              onContextMenu={(e) => { e.preventDefault(); selectSprite(sprite.id); setContextMenu({ x: e.clientX, y: e.clientY, spriteId: sprite.id }); }}
              className={`flex items-center gap-1 cursor-pointer transition-all duration-100 ${
                selectedSpriteId === sprite.id ? "bg-[var(--bg-elevated)] text-[var(--cyan)]" : "text-[var(--text-dim)] hover:bg-[var(--bg-surface)] hover:text-[var(--text)]"
              } ${dragOverIndex === index && dragIndex !== index ? "border-t border-t-[var(--cyan)]" : ""} ${dragIndex === index ? "opacity-40" : ""}`}
              style={{ padding: "2px 4px", fontFamily: "var(--font-mono)", fontSize: 9 }}>
              <div className="shrink-0 overflow-hidden" style={{ width: 20, height: 20, border: `1px solid ${selectedSpriteId === sprite.id ? "var(--cyan)" : "var(--border)"}`, background: "#0A0A0C", boxShadow: selectedSpriteId === sprite.id ? "0 0 4px rgba(6,182,212,0.4)" : "none", transition: "border-color 0.12s" }}>
                {sprite.image && <canvas ref={(canvas) => {
                  if (canvas && sprite.image) { const ctx = canvas.getContext("2d"); if (ctx) { canvas.width = 18; canvas.height = 18; const scale = Math.min(18 / sprite.width, 18 / sprite.height); const w = sprite.width * scale, h = sprite.height * scale; ctx.clearRect(0, 0, 18, 18); ctx.drawImage(sprite.image, (18 - w) / 2, (18 - h) / 2, w, h); } }
                }} width={18} height={18} />}
              </div>
              <span className="truncate">{sprite.name}.png</span>
              {sprite.isAi && <span style={{ fontFamily: "var(--font-mono)", fontSize: 6, color: "var(--amber)", background: "rgba(245,158,11,0.12)", padding: "0 3px", lineHeight: "1.5", letterSpacing: "0.05em", flexShrink: 0 }}>AI</span>}
              <span className="ml-auto shrink-0" style={{ color: "var(--text-muted)", fontSize: 8 }}>{sprite.width}×{sprite.height}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[199]" onClick={() => setContextMenu(null)} />
          <div className="fixed z-[200] py-0.5" style={{ left: contextMenu.x, top: contextMenu.y, minWidth: 160, background: "var(--bg-panel)", border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.6)" }}>
            <CtxItem icon="dup" label="Duplicate" shortcut="⌘D" onClick={() => setContextMenu(null)} />
            <CtxItem icon="rename" label="Rename" shortcut="F2" onClick={() => setContextMenu(null)} />
            <CtxItem icon="del" label="Delete" shortcut="⌫" danger onClick={() => { removeSprite(contextMenu.spriteId); setContextMenu(null); }} />
            <div style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
            <CtxItem icon="star" label="AI Variants" shortcut="⌘⇧V" ai onClick={() => { handleAiAction(contextMenu.spriteId, "variants"); setContextMenu(null); }} />
            <CtxItem icon="recolor" label="AI Recolor" shortcut="⌘⇧C" ai onClick={() => { handleAiAction(contextMenu.spriteId, "recolor"); setContextMenu(null); }} />
            <CtxItem icon="upscale" label="AI Upscale 2×" shortcut="⌘⇧U" ai onClick={() => { handleAiAction(contextMenu.spriteId, "upscale"); setContextMenu(null); }} />
            <CtxItem icon="rmbg" label={processingBg ? "Removing BG..." : "AI Remove BG"} ai onClick={() => { handleRemoveBg(contextMenu.spriteId); setContextMenu(null); }} />
            <div style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
            <CtxItem icon="anim" label="Add to Animation" onClick={() => { addToAnimation(contextMenu.spriteId); setContextMenu(null); }} />
            <CtxItem icon="extend" label="AI Extend Frames" shortcut="⌘⇧E" ai onClick={() => { handleAiAction(contextMenu.spriteId, "extend-frames"); setContextMenu(null); }} />
          </div>
        </>
      )}
    </div>
  );
}
