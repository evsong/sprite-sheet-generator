import { useEditorStore } from "@/stores/editor-store";
import { getFormatGroups, isFormatFree } from "@/lib/export-formats";
import { generateCodeSnippet } from "@/lib/exporter";
import { FILENAME_PRESETS } from "@/lib/filename-parser";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

const FORMAT_GROUPS = getFormatGroups();

const S: Record<string, React.CSSProperties> = {
  section: { padding: "6px 8px", borderBottom: "1px solid var(--border)" },
  h4: { fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 5 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, fontSize: 10 },
  label: { color: "var(--text-dim)", fontSize: 10 },
  val: { fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)" },
  valCyan: { fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--cyan)" },
  valGreen: { fontFamily: "var(--font-mono)", fontSize: 9, color: "#22C55E" },
  select: { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 9, padding: "2px 4px", height: 20 },
  toggle: { width: 24, height: 12, position: "relative" as const, cursor: "pointer", transition: "all 0.15s", border: "1px solid var(--border)" },
};

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      ...S.toggle,
      background: on ? "var(--cyan)" : "var(--bg-elevated)",
      borderColor: on ? "var(--cyan)" : "var(--border)",
    }}>
      <div style={{
        position: "absolute", top: 1, left: on ? 13 : 1,
        width: 8, height: 8, background: "var(--text)", transition: "left 0.15s",
      }} />
    </div>
  );
}

export function SettingsPanel() {
  const config = useEditorStore((s) => s.packingConfig);
  const updateConfig = useEditorStore((s) => s.updatePackingConfig);
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const sprites = useEditorStore((s) => s.sprites);
  const pivotEditMode = useEditorStore((s) => s.pivotEditMode);
  const setPivotEditMode = useEditorStore((s) => s.setPivotEditMode);
  const selectedSpriteId = useEditorStore((s) => s.selectedSpriteId);
  const updateSprite = useEditorStore((s) => s.updateSprite);
  const filenamePattern = useEditorStore((s) => s.filenamePattern);
  const setFilenamePattern = useEditorStore((s) => s.setFilenamePattern);
  const autoTagOnImport = useEditorStore((s) => s.autoTagOnImport);
  const setAutoTagOnImport = useEditorStore((s) => s.setAutoTagOnImport);
  const { data: session } = useSession();
  const tier = (session?.user as Record<string, unknown> | undefined)?.tier as string ?? "FREE";
  const isPaid = tier === "PRO" || tier === "TEAM";
  const [copied, setCopied] = useState(false);

  const selectedSprite = sprites.find((s) => s.id === selectedSpriteId);

  const stats = useMemo(() => {
    const bin = bins[activeBin];
    if (!bin) return null;
    const used = bin.rects.reduce((s, r) => s + r.width * r.height, 0);
    const total = bin.width * bin.height;
    const d = total > 0 ? (used / total) * 100 : 0;
    const vram = total * 4;
    const pot = (bin.width & (bin.width - 1)) === 0 && (bin.height & (bin.height - 1)) === 0;
    return { w: bin.width, h: bin.height, sprites: bin.rects.length, d, waste: 100 - d, vram: vram < 1048576 ? `~${(vram/1024).toFixed(1)} KB` : `~${(vram/1048576).toFixed(1)} MB`, pot, draws: bins.length };
  }, [bins, activeBin]);

  return (
    <div className="flex flex-col overflow-y-auto" style={{ background: "var(--bg-panel)", borderLeft: "1px solid var(--border)" }}>
      {/* Sheet Stats */}
      {stats && (
        <div style={S.section}>
          <h4 style={S.h4}>Sheet Stats</h4>
          <div style={S.row}><label style={S.label}>Texture</label><span style={S.valCyan}>{stats.w} × {stats.h}</span></div>
          <div style={S.row}><label style={S.label}>Format</label><span style={S.val}>RGBA8888</span></div>
          <div style={S.row}><label style={S.label}>VRAM</label><span style={S.val}>{stats.vram}</span></div>
          <div style={S.row}><label style={S.label}>Sprites</label><span style={S.val}>{stats.sprites}</span></div>
          <div style={S.row}><label style={S.label}>Density</label><span style={S.valGreen}>{stats.d.toFixed(1)}%</span></div>
          <div style={S.row}><label style={S.label}>Waste</label><span style={{ ...S.val, color: "var(--text-muted)" }}>{stats.waste.toFixed(1)}%</span></div>
          <div style={S.row}><label style={S.label}>POT</label><span style={stats.pot ? S.valGreen : S.val}>{stats.pot ? "Yes" : "No"}</span></div>
          <div style={S.row}><label style={S.label}>Draw Calls</label><span style={S.val}>{stats.draws}</span></div>
        </div>
      )}
      {/* Packing */}
      <div style={S.section}>
        <h4 style={S.h4}>Packing</h4>
        <div style={S.row}><label style={S.label}>Algorithm</label>
          <select style={S.select}><option>MaxRects BSS</option><option>MaxRects BL</option><option>MaxRects BAF</option></select>
        </div>
        <div style={S.row}><label style={S.label}>Sheet Size</label>
          <select style={S.select} value={`${config.maxWidth} × ${config.maxHeight}`}
            onChange={(e) => { const v = e.target.value; if (v === "Auto") { updateConfig({ maxWidth: 4096, maxHeight: 4096 }); } else { const [w,h] = v.split(" × ").map(Number); updateConfig({ maxWidth: w, maxHeight: h }); } }}>
            <option>512 × 512</option><option>1024 × 1024</option><option>2048 × 2048</option><option>Auto</option>
          </select>
        </div>
        <div style={S.row}><label style={S.label}>Padding</label>
          <select style={S.select} value={`${config.padding}px`}
            onChange={(e) => updateConfig({ padding: parseInt(e.target.value) })}>
            <option>0px</option><option>1px</option><option>2px</option><option>4px</option>
          </select>
        </div>
        <div style={S.row}><label style={S.label}>Power of Two</label>
          <Toggle on={config.pot} onClick={() => updateConfig({ pot: !config.pot })} />
        </div>
        <div style={S.row}><label style={S.label}>Allow Rotation</label>
          <Toggle on={config.allowRotation} onClick={() => updateConfig({ allowRotation: !config.allowRotation })} />
        </div>
        <div style={S.row}><label style={S.label}>Trim Alpha</label>
          <Toggle on={config.trimTransparency} onClick={() => updateConfig({ trimTransparency: !config.trimTransparency })} />
        </div>
      </div>
      {/* Pivot */}
      <div style={S.section}>
        <h4 style={S.h4}>Pivot Point</h4>
        <div style={S.row}>
          <label style={S.label}>Edit Mode</label>
          <Toggle on={pivotEditMode} onClick={() => setPivotEditMode(!pivotEditMode)} />
        </div>
        {pivotEditMode && selectedSprite && (
          <>
            <div style={S.row}>
              <label style={S.label}>X</label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={selectedSprite.pivot.x}
                onChange={(e) => updateSprite(selectedSprite.id, { pivot: { ...selectedSprite.pivot, x: Number(e.target.value) } })}
                style={{ ...S.select, width: 56 }}
              />
            </div>
            <div style={S.row}>
              <label style={S.label}>Y</label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={selectedSprite.pivot.y}
                onChange={(e) => updateSprite(selectedSprite.id, { pivot: { ...selectedSprite.pivot, y: Number(e.target.value) } })}
                style={{ ...S.select, width: 56 }}
              />
            </div>
            <div className="flex gap-1 mt-1">
              {([
                ["TL", 0, 0], ["TC", 0.5, 0], ["TR", 1, 0],
                ["ML", 0, 0.5], ["C", 0.5, 0.5], ["MR", 1, 0.5],
                ["BL", 0, 1], ["BC", 0.5, 1], ["BR", 1, 1],
              ] as [string, number, number][]).map(([label, px, py]) => (
                <button
                  key={label}
                  onClick={() => updateSprite(selectedSprite.id, { pivot: { x: px, y: py } })}
                  style={{
                    width: 20,
                    height: 16,
                    fontSize: 6,
                    fontFamily: "var(--font-mono)",
                    color: selectedSprite.pivot.x === px && selectedSprite.pivot.y === py ? "var(--cyan)" : "var(--text-muted)",
                    background: selectedSprite.pivot.x === px && selectedSprite.pivot.y === py ? "rgba(6,182,212,0.1)" : "var(--bg)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
        {pivotEditMode && !selectedSprite && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)" }}>
            Select a sprite to edit its pivot
          </span>
        )}
      </div>
      {/* Filename Pattern */}
      <div style={S.section}>
        <h4 style={S.h4}>Auto-Tag</h4>
        <div style={S.row}>
          <label style={S.label}>On Import</label>
          <Toggle on={autoTagOnImport} onClick={() => setAutoTagOnImport(!autoTagOnImport)} />
        </div>
        {autoTagOnImport && (
          <>
            <div style={{ marginBottom: 4 }}>
              <select
                style={{ ...S.select, width: "100%", marginBottom: 3 }}
                value={FILENAME_PRESETS.find((p) => p.pattern === filenamePattern) ? filenamePattern : ""}
                onChange={(e) => { if (e.target.value) setFilenamePattern(e.target.value); }}
              >
                {FILENAME_PRESETS.map((p) => (
                  <option key={p.label} value={p.pattern}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                value={filenamePattern}
                onChange={(e) => setFilenamePattern(e.target.value)}
                placeholder="Regex with named groups..."
                style={{
                  ...S.select,
                  width: "100%",
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                }}
              />
            </div>
          </>
        )}
      </div>
      {/* Export */}
      <div style={S.section}>
        <h4 style={S.h4}>Export</h4>
        <div style={S.row}><label style={S.label}>Format</label>
          <select style={S.select} value={config.exportFormat}
            onChange={(e) => { if (!isPaid && !isFormatFree(e.target.value)) return; updateConfig({ exportFormat: e.target.value }); }}>
            {FORMAT_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.formats.map((f) => <option key={f.id} value={f.id} disabled={!isPaid && !isFormatFree(f.id)}>{f.label}{!isPaid && !isFormatFree(f.id) ? " 🔒" : ""}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <button onClick={() => { if (bins.length === 0) return; import("@/lib/exporter").then(({ exportSpriteSheet }) => { exportSpriteSheet(bins, sprites, config, "spritesheet", { watermark: !isPaid }); }); }}
          disabled={bins.length === 0}
          style={{ width: "100%", height: 22, fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--cyan)", color: "#fff", border: "1px solid var(--cyan)", marginTop: 4, cursor: bins.length === 0 ? "not-allowed" : "pointer", opacity: bins.length === 0 ? 0.3 : 1 }}>
          Download .zip ↓
        </button>
      </div>
      {/* Code Snippet */}
      {stats && (
        <div style={S.section}>
          <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
            <h4 style={{ ...S.h4, marginBottom: 0 }}>Code Snippet</h4>
            {isPaid && (
              <button onClick={() => { navigator.clipboard.writeText(generateCodeSnippet(config.exportFormat, "spritesheet")); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
                style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--text-muted)", background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "1px 4px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className="relative">
            <pre style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: 6, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-dim)", whiteSpace: "pre", overflow: "auto", lineHeight: 1.4, filter: isPaid ? "none" : "blur(2px)" }}>
              {generateCodeSnippet(config.exportFormat, "spritesheet")}
            </pre>
            {!isPaid && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--amber)", background: "rgba(13,13,13,0.8)", padding: "2px 8px" }}>PRO Feature</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
