import { useEditorStore } from "@/stores/editor-store";
import { useMemo } from "react";

export function StatusBar() {
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const sprites = useEditorStore((s) => s.sprites);

  const stats = useMemo(() => {
    const bin = bins[activeBin];
    if (!bin) return null;
    const usedArea = bin.rects.reduce((sum, r) => sum + r.width * r.height, 0);
    const totalArea = bin.width * bin.height;
    const density = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;
    const vramBytes = totalArea * 4;
    const vram = vramBytes < 1024 * 1024 ? `${(vramBytes / 1024).toFixed(1)} KB` : `${(vramBytes / (1024 * 1024)).toFixed(1)} MB`;
    const isPot = (bin.width & (bin.width - 1)) === 0 && (bin.height & (bin.height - 1)) === 0;
    return { width: bin.width, height: bin.height, density, vram, pot: isPot };
  }, [bins, activeBin]);

  if (!stats && sprites.length === 0) return null;

  return (
    <div className="h-5 bg-[#080808] border-t border-[#1E1E1E] flex items-center px-3 gap-4 shrink-0">
      {stats ? (
        <>
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#666]">
            {stats.width}×{stats.height}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#666]">RGBA8888</span>
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#666]">
            {stats.pot ? "POT" : "NPOT"}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#06B6D4]">
            {stats.density.toFixed(1)}% packed
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#666]">~{stats.vram} VRAM</span>
        </>
      ) : (
        <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#333]">No sprites loaded</span>
      )}
    </div>
  );
}
