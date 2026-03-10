import { useEditorStore } from "@/stores/editor-store";

/**
 * Tab bar for switching between multiple atlas pages (bins).
 * Only renders when there are 2+ bins.
 */
export function BinPageTabs() {
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const setActiveBin = useEditorStore((s) => s.setActiveBin);

  if (bins.length < 2) return null;

  return (
    <div
      className="flex items-center gap-0.5 shrink-0"
      style={{
        padding: "3px 8px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-panel)",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
      }}
    >
      <span style={{ color: "var(--text-muted)", marginRight: 4, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Pages
      </span>
      {bins.map((bin, i) => {
        const isActive = i === activeBin;
        return (
          <button
            key={i}
            onClick={() => setActiveBin(i)}
            className="cursor-pointer transition-all duration-100"
            style={{
              padding: "2px 8px",
              color: isActive ? "var(--cyan)" : "var(--text-dim)",
              background: isActive ? "rgba(6,182,212,0.12)" : "transparent",
              border: `1px solid ${isActive ? "rgba(6,182,212,0.3)" : "transparent"}`,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: isActive ? 600 : 400,
            }}
            title={`Page ${i + 1}: ${bin.width}x${bin.height}, ${bin.rects.length} sprites`}
          >
            {i + 1}
          </button>
        );
      })}
      <span style={{ color: "var(--text-muted)", marginLeft: 6, fontSize: 8 }}>
        {bins.length} page{bins.length > 1 ? "s" : ""}
      </span>
    </div>
  );
}
