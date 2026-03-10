import { useEditorStore } from "@/stores/editor-store";
import { exportSpriteSheet } from "@/lib/exporter";
import { exportProject, importProject } from "@/lib/project";
import { CompareButton } from "./AtlasDiffViewer";
import { useCallback, useRef, useMemo, useState } from "react";

export function EditorToolbar() {
  const sprites = useEditorStore((s) => s.sprites);
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const packingConfig = useEditorStore((s) => s.packingConfig);
  const animation = useEditorStore((s) => s.animation);
  const clearSprites = useEditorStore((s) => s.clearSprites);
  const loadProjectAction = useEditorStore((s) => s.loadProject);
  const activeTab = useEditorStore((s) => s.activeTab);
  const pivotEditMode = useEditorStore((s) => s.pivotEditMode);
  const setPivotEditMode = useEditorStore((s) => s.setPivotEditMode);
  const openFileRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const isAssets = activeTab === "assets";
  const filteredCount = sprites.filter((s) =>
    isAssets ? s.mode !== "sequence" : s.mode !== "atlas"
  ).length;

  const stats = useMemo(() => {
    const bin = bins[activeBin];
    if (!bin) return null;
    const usedArea = bin.rects.reduce((sum, r) => sum + r.width * r.height, 0);
    const totalArea = bin.width * bin.height;
    const density = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;
    return { width: bin.width, height: bin.height, density };
  }, [bins, activeBin]);

  const handleExport = useCallback(() => {
    if (bins.length === 0) return;
    exportSpriteSheet(bins, sprites, packingConfig);
  }, [bins, sprites, packingConfig]);

  const handleNew = useCallback(() => {
    if (sprites.length > 0 && !confirm("Start a new project? Unsaved changes will be lost.")) return;
    clearSprites();
    useEditorStore.setState({
      animation: { frames: [], fps: 12, playing: false, currentFrame: 0, mode: "loop", onionSkin: false },
    });
  }, [sprites.length, clearSprites]);

  const handleSave = useCallback(() => {
    exportProject(sprites, packingConfig, animation);
  }, [sprites, packingConfig, animation]);

  const handleOpen = useCallback(async (file: File) => {
    try {
      const data = await importProject(file);
      loadProjectAction(data);
    } catch (e) {
      alert(`Failed to open project: ${(e as Error).message}`);
    }
  }, [loadProjectAction]);

  return (
    <div
      className="flex items-center justify-between"
      style={{
        gridColumn: "1 / -1",
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border)",
        padding: "0 8px",
        gap: "6px",
        minHeight: 0,
      }}
    >
      {/* Left: project name + undo/redo */}
      <div className="flex items-center gap-1.5">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text)", fontWeight: 500 }}>
          hero-sprites.sfp
        </span>
        <button
          title="Undo (⌘Z)"
          onClick={handleNew}
          className="flex items-center justify-center hover:border-[var(--text)] hover:text-[var(--text)] transition-all duration-100"
          style={{ width: 22, height: 22, border: "1px solid var(--border)", color: "var(--text-dim)", fontSize: 10 }}
        >
          ↩
        </button>
        <button
          title="Redo (⌘⇧Z)"
          className="flex items-center justify-center hover:border-[var(--text)] hover:text-[var(--text)] transition-all duration-100"
          style={{ width: 22, height: 22, border: "1px solid var(--border)", color: "var(--text-dim)", fontSize: 10 }}
        >
          ↪
        </button>
      </div>

      {/* Right: stats + pivot + compare + export + save */}
      <div className="flex items-center gap-1.5">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)" }}>
          {filteredCount} {isAssets ? "assets" : "frames"}{stats ? ` · ${stats.width}×${stats.height} · ${stats.density.toFixed(1)}%` : ""}
        </span>
        <button
          onClick={() => setPivotEditMode(!pivotEditMode)}
          title="Toggle Pivot Edit Mode"
          className="hover:border-[var(--text)] hover:text-[var(--text)] transition-all duration-100"
          style={{
            height: 20, padding: "0 6px", fontSize: "9px",
            border: `1px solid ${pivotEditMode ? "var(--cyan)" : "var(--border)"}`,
            color: pivotEditMode ? "var(--cyan)" : "var(--text-dim)",
            background: pivotEditMode ? "rgba(6,182,212,0.1)" : "transparent",
            fontFamily: "var(--font-mono)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}
        >
          <svg viewBox="0 0 16 16" width="10" height="10" style={{ verticalAlign: "-1px", display: "inline" }}>
            <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="8" y1="1" x2="8" y2="5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="8" y1="11" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" />
            <line x1="1" y1="8" x2="5" y2="8" stroke="currentColor" strokeWidth="1.5" />
            <line x1="11" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <CompareButton />
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="hover:border-[var(--text)] hover:text-[var(--text)] transition-all duration-100"
            style={{
              height: 20, padding: "0 8px", fontSize: "9px",
              border: "1px solid var(--border)", color: "var(--text-dim)",
              fontFamily: "var(--font-mono)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}
          >
            Export ▾
          </button>
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-[99]" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-[100] py-1 min-w-[120px]"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                <button onClick={() => { handleExport(); setShowExportMenu(false); }}
                  className="w-full px-3 py-1 text-left hover:bg-[var(--bg-elevated)] transition-colors"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)" }}>
                  Download .zip
                </button>
              </div>
            </>
          )}
        </div>
        <button
          onClick={handleSave}
          style={{
            height: 20, padding: "0 8px", fontSize: "9px",
            background: "var(--cyan)", color: "#fff",
            border: "1px solid var(--cyan)",
            fontFamily: "var(--font-mono)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}
          className="hover:bg-[#22D3EE] transition-all duration-100"
        >
          Save
        </button>
        <input ref={openFileRef} type="file" accept=".spriteforge" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleOpen(f); e.target.value = ""; }} />
      </div>
    </div>
  );
}
