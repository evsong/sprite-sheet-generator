import { useEditorStore } from "@/stores/editor-store";
import { useMemo } from "react";

export function FileInfoBar() {
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const sprites = useEditorStore((s) => s.sprites);

  const info = useMemo(() => {
    const bin = bins[activeBin];
    if (!bin) return null;
    const usedArea = bin.rects.reduce((sum, r) => sum + r.width * r.height, 0);
    const totalArea = bin.width * bin.height;
    const density = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;
    return { width: bin.width, height: bin.height, density };
  }, [bins, activeBin]);

  return (
    <div className="h-6 bg-[#080808] border-b border-[#1E1E1E] flex items-center px-3 gap-3 shrink-0">
      <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#A0A0A0]">
        Untitled.sfp
      </span>
      <div className="w-px h-3 bg-[#1E1E1E]" />
      {info ? (
        <>
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#666]">
            {sprites.length} sprites
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#666]">
            {info.width}×{info.height}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#06B6D4]">
            {info.density.toFixed(1)}%
          </span>
        </>
      ) : (
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#333]">
          No sprites loaded
        </span>
      )}
    </div>
  );
}
