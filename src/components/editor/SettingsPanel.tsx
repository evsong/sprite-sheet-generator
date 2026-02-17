import { useEditorStore } from "@/stores/editor-store";
import { getFormatGroups, isFormatFree } from "@/lib/export-formats";
import { generateCodeSnippet } from "@/lib/exporter";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

const FORMAT_GROUPS = getFormatGroups();

function useSheetStats() {
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const sprites = useEditorStore((s) => s.sprites);
  const config = useEditorStore((s) => s.packingConfig);
  return useMemo(() => {
    const bin = bins[activeBin];
    if (!bin) return null;
    const usedArea = bin.rects.reduce((sum, r) => sum + r.width * r.height, 0);
    const totalArea = bin.width * bin.height;
    const density = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;
    const vramBytes = totalArea * 4;
    const isPot = (bin.width & (bin.width - 1)) === 0 && (bin.height & (bin.height - 1)) === 0;
    return {
      width: bin.width, height: bin.height,
      sprites: sprites.length, density, waste: 100 - density,
      vram: vramBytes < 1024 * 1024 ? `${(vramBytes / 1024).toFixed(1)} KB` : `${(vramBytes / (1024 * 1024)).toFixed(1)} MB`,
      pot: isPot, drawCalls: bins.length, format: config.exportFormat,
    };
  }, [bins, activeBin, sprites.length, config.exportFormat]);
}

export function SettingsPanel() {
  const config = useEditorStore((s) => s.packingConfig);
  const updateConfig = useEditorStore((s) => s.updatePackingConfig);
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const setActiveBin = useEditorStore((s) => s.setActiveBin);
  const { data: session } = useSession();
  const tier = (session?.user as Record<string, unknown> | undefined)?.tier as string ?? "FREE";
  const isPaid = tier === "PRO" || tier === "TEAM";
  const stats = useSheetStats();
  const [copied, setCopied] = useState(false);

  return (
    <div className="w-56 bg-[#0D0D0D] border-l border-[#1E1E1E] flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#1E1E1E]">
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#666] uppercase tracking-wider">
          Settings
        </span>
      </div>

      {/* Sheet Stats */}
      {stats && (
        <div className="p-3 border-b border-[#1E1E1E]">
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-2">Sheet Stats</span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {[
              { label: "Texture", value: `${stats.width}×${stats.height}` },
              { label: "Format", value: "RGBA8888" },
              { label: "VRAM", value: stats.vram },
              { label: "Sprites", value: String(stats.sprites) },
              { label: "Density", value: `${stats.density.toFixed(1)}%`, highlight: true },
              { label: "Waste", value: `${stats.waste.toFixed(1)}%` },
              { label: "POT", value: stats.pot ? "Yes" : "No", highlight: stats.pot },
              { label: "Draw Calls", value: String(stats.drawCalls) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#666]">{row.label}</span>
                <span className={`font-[family-name:var(--font-mono)] text-[9px] ${row.highlight ? "text-[#06B6D4]" : "text-[#A0A0A0]"}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 space-y-4">
        {/* Canvas Size */}
        <div>
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1.5">
            Max Atlas Size
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={config.maxWidth}
                onChange={(e) => updateConfig({ maxWidth: Number(e.target.value) })}
                className="w-full bg-[#1A1A1A] border border-[#1E1E1E] rounded px-2 py-1 text-[11px] font-[family-name:var(--font-mono)] text-white focus:border-[#06B6D4] focus:outline-none transition-colors duration-150"
              />
              <span className="text-[8px] text-[#666] font-[family-name:var(--font-mono)] mt-0.5 block">W</span>
            </div>
            <div className="flex-1">
              <input
                type="number"
                value={config.maxHeight}
                onChange={(e) => updateConfig({ maxHeight: Number(e.target.value) })}
                className="w-full bg-[#1A1A1A] border border-[#1E1E1E] rounded px-2 py-1 text-[11px] font-[family-name:var(--font-mono)] text-white focus:border-[#06B6D4] focus:outline-none transition-colors duration-150"
              />
              <span className="text-[8px] text-[#666] font-[family-name:var(--font-mono)] mt-0.5 block">H</span>
            </div>
          </div>
        </div>

        {/* Padding */}
        <div>
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1.5">
            Padding
          </label>
          <input
            type="number"
            min={0}
            max={32}
            value={config.padding}
            onChange={(e) => updateConfig({ padding: Number(e.target.value) })}
            className="w-full bg-[#1A1A1A] border border-[#1E1E1E] rounded px-2 py-1 text-[11px] font-[family-name:var(--font-mono)] text-white focus:border-[#06B6D4] focus:outline-none transition-colors duration-150"
          />
        </div>

        {/* Border */}
        <div>
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1.5">
            Border
          </label>
          <input
            type="number"
            min={0}
            max={32}
            value={config.border}
            onChange={(e) => updateConfig({ border: Number(e.target.value) })}
            className="w-full bg-[#1A1A1A] border border-[#1E1E1E] rounded px-2 py-1 text-[11px] font-[family-name:var(--font-mono)] text-white focus:border-[#06B6D4] focus:outline-none transition-colors duration-150"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          {[
            { label: "Power of Two", key: "pot" as const, value: config.pot },
            { label: "Allow Rotation", key: "allowRotation" as const, value: config.allowRotation },
            { label: "Trim Transparency", key: "trimTransparency" as const, value: config.trimTransparency },
          ].map((toggle) => (
            <label key={toggle.key} className="flex items-center justify-between cursor-pointer group">
              <span className="text-[11px] text-[#A0A0A0] group-hover:text-white transition-colors duration-150">
                {toggle.label}
              </span>
              <button
                onClick={() => updateConfig({ [toggle.key]: !toggle.value })}
                className={`w-8 h-4 rounded-full transition-colors duration-200 cursor-pointer ${
                  toggle.value ? "bg-[#06B6D4]" : "bg-[#333]"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${
                    toggle.value ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          ))}
        </div>

        {/* Algorithm */}
        <div>
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1.5">
            Algorithm
          </label>
          <div className="bg-[#1A1A1A] border border-[#1E1E1E] rounded px-2 py-1.5 text-[11px] font-[family-name:var(--font-mono)] text-[#06B6D4]">
            MaxRects Best Short Side
          </div>
        </div>

        {/* Export Format */}
        <div>
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1.5">
            Export Format
          </label>
          <select
            value={config.exportFormat}
            onChange={(e) => {
              const id = e.target.value;
              if (!isPaid && !isFormatFree(id)) return;
              updateConfig({ exportFormat: id });
            }}
            className="w-full bg-[#1A1A1A] border border-[#1E1E1E] rounded px-2 py-1.5 text-[11px] font-[family-name:var(--font-mono)] text-white focus:border-[#06B6D4] focus:outline-none transition-colors duration-150 cursor-pointer appearance-none"
          >
            {FORMAT_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.formats.map((fmt) => (
                  <option key={fmt.id} value={fmt.id} disabled={!isPaid && !isFormatFree(fmt.id)}>
                    {fmt.label}{!isPaid && !isFormatFree(fmt.id) ? " 🔒 PRO" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Bin selector */}
        {bins.length > 1 && (
          <div>
            <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1.5">
              Bins ({bins.length})
            </label>
            <div className="flex gap-1 flex-wrap">
              {bins.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBin(i)}
                  className={`px-2 py-1 text-[10px] font-[family-name:var(--font-mono)] rounded cursor-pointer transition-colors duration-150 ${
                    activeBin === i
                      ? "bg-[#06B6D4] text-black"
                      : "bg-[#1A1A1A] text-[#666] hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Code Snippet */}
        {stats && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider">Code Snippet</span>
              {isPaid && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateCodeSnippet(config.exportFormat, "spritesheet"));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="text-[8px] font-[family-name:var(--font-mono)] text-[#06B6D4] hover:text-[#22D3EE] cursor-pointer transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div className="relative">
              <pre className={`bg-[#1A1A1A] border border-[#1E1E1E] rounded p-2 text-[9px] font-[family-name:var(--font-mono)] text-[#A0A0A0] overflow-x-auto max-h-32 leading-relaxed ${!isPaid ? "blur-[2px] select-none" : ""}`}>
                {generateCodeSnippet(config.exportFormat, "spritesheet")}
              </pre>
              {!isPaid && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#F59E0B] bg-[#0D0D0D]/80 px-2 py-1 rounded">PRO Feature</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Download ZIP */}
        <button
          onClick={() => {
            if (bins.length === 0) return;
            import("@/lib/exporter").then(({ exportSpriteSheet }) => {
              const sprites = useEditorStore.getState().sprites;
              exportSpriteSheet(bins, sprites, config, "spritesheet", { watermark: !isPaid });
            });
          }}
          disabled={bins.length === 0}
          className="w-full py-2.5 text-[11px] font-[family-name:var(--font-mono)] font-bold text-black bg-[#22C55E] rounded-md hover:brightness-110 transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          DOWNLOAD .ZIP
        </button>
      </div>
    </div>
  );
}
