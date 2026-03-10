import { useEditorStore } from "@/stores/editor-store";
import { renderBinToCanvas } from "@/lib/exporter";
import pixelmatch from "pixelmatch";
import { useCallback, useRef, useEffect, useState } from "react";

/**
 * Visual Atlas Diff viewer.
 *
 * Loads a "before" atlas image from the user's filesystem, compares it against
 * the current packed atlas using pixelmatch, and displays the diff in either
 * side-by-side or overlay mode.
 */
export function AtlasDiffViewer() {
  const diffState = useEditorStore((s) => s.diffState);
  const setDiffState = useEditorStore((s) => s.setDiffState);
  const clearDiff = useEditorStore((s) => s.clearDiff);
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const sprites = useEditorStore((s) => s.sprites);
  const fileRef = useRef<HTMLInputElement>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  const bin = bins[activeBin];

  const handleLoadBefore = useCallback(
    (file: File) => {
      if (!bin) return;
      const img = new Image();
      img.onload = () => {
        // Render "before" image to ImageData
        const beforeCanvas = document.createElement("canvas");
        beforeCanvas.width = bin.width;
        beforeCanvas.height = bin.height;
        const beforeCtx = beforeCanvas.getContext("2d")!;
        beforeCtx.drawImage(img, 0, 0, bin.width, bin.height);
        const beforeData = beforeCtx.getImageData(0, 0, bin.width, bin.height);

        // Render "after" (current atlas) to ImageData
        const afterCanvas = renderBinToCanvas(bin, sprites);
        const afterCtx = afterCanvas.getContext("2d")!;
        const afterData = afterCtx.getImageData(0, 0, bin.width, bin.height);

        // Run pixelmatch
        const diffImageData = new ImageData(bin.width, bin.height);
        const mismatchCount = pixelmatch(
          beforeData.data,
          afterData.data,
          diffImageData.data,
          bin.width,
          bin.height,
          { threshold: 0.1, alpha: 0.5, diffColor: [255, 70, 70] },
        );

        setDiffState({
          active: true,
          before: beforeData,
          after: afterData,
          diff: diffImageData,
          mismatchCount,
        });
      };
      img.src = URL.createObjectURL(file);
    },
    [bin, sprites, setDiffState],
  );

  // Paint canvases when diffState updates
  useEffect(() => {
    if (!diffState.active || !diffState.before || !diffState.after || !diffState.diff) return;

    const draw = (ref: React.RefObject<HTMLCanvasElement | null>, data: ImageData) => {
      const canvas = ref.current;
      if (!canvas) return;
      canvas.width = data.width;
      canvas.height = data.height;
      const ctx = canvas.getContext("2d")!;
      ctx.putImageData(data, 0, 0);
    };

    draw(beforeCanvasRef, diffState.before);
    draw(afterCanvasRef, diffState.after);
    draw(diffCanvasRef, diffState.diff);
  }, [diffState]);

  if (!diffState.active) return null;

  const totalPixels = diffState.before ? diffState.before.width * diffState.before.height : 1;
  const pctChanged = ((diffState.mismatchCount / totalPixels) * 100).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="flex flex-col"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Atlas Diff
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: diffState.mismatchCount > 0 ? "#EF4444" : "#22C55E",
              }}
            >
              {diffState.mismatchCount > 0
                ? `${diffState.mismatchCount.toLocaleString()} px changed (${pctChanged}%)`
                : "No changes detected"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex gap-0.5">
              {(["side-by-side", "overlay"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDiffState({ viewMode: mode })}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    padding: "2px 8px",
                    border: "1px solid var(--border)",
                    color:
                      diffState.viewMode === mode
                        ? "var(--cyan)"
                        : "var(--text-dim)",
                    background:
                      diffState.viewMode === mode
                        ? "rgba(6,182,212,0.1)"
                        : "transparent",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
            {/* Overlay opacity slider */}
            {diffState.viewMode === "overlay" && (
              <div className="flex items-center gap-1">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    color: "var(--text-muted)",
                  }}
                >
                  Opacity
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={overlayOpacity * 100}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                  style={{ width: 60, height: 2 }}
                />
              </div>
            )}
            <button
              onClick={clearDiff}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                padding: "2px 8px",
                border: "1px solid var(--border)",
                color: "var(--text-dim)",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-auto"
          style={{ padding: 12 }}
        >
          {diffState.viewMode === "side-by-side" ? (
            <div className="flex gap-3">
              {/* Before */}
              <div className="flex flex-col items-center gap-1">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Before
                </span>
                <canvas
                  ref={beforeCanvasRef}
                  style={{
                    maxWidth: "30vw",
                    maxHeight: "70vh",
                    imageRendering: "pixelated",
                    outline: "1px solid var(--border)",
                  }}
                />
              </div>
              {/* After */}
              <div className="flex flex-col items-center gap-1">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  After
                </span>
                <canvas
                  ref={afterCanvasRef}
                  style={{
                    maxWidth: "30vw",
                    maxHeight: "70vh",
                    imageRendering: "pixelated",
                    outline: "1px solid var(--border)",
                  }}
                />
              </div>
              {/* Diff */}
              <div className="flex flex-col items-center gap-1">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    color: "#EF4444",
                    textTransform: "uppercase",
                  }}
                >
                  Diff
                </span>
                <canvas
                  ref={diffCanvasRef}
                  style={{
                    maxWidth: "30vw",
                    maxHeight: "70vh",
                    imageRendering: "pixelated",
                    outline: "1px solid var(--border)",
                  }}
                />
              </div>
            </div>
          ) : (
            /* Overlay mode */
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <canvas
                  ref={beforeCanvasRef}
                  style={{
                    maxWidth: "60vw",
                    maxHeight: "70vh",
                    imageRendering: "pixelated",
                    outline: "1px solid var(--border)",
                  }}
                />
                <canvas
                  ref={afterCanvasRef}
                  className="absolute inset-0"
                  style={{
                    maxWidth: "60vw",
                    maxHeight: "70vh",
                    imageRendering: "pixelated",
                    opacity: overlayOpacity,
                  }}
                />
              </div>
              <div className="flex gap-4" style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)" }}>
                <span>Before (bottom)</span>
                <span>After (top, opacity {Math.round(overlayOpacity * 100)}%)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleLoadBefore(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/**
 * "Compare" button for the toolbar. Opens a file picker to load a previous
 * atlas, then triggers the diff computation.
 */
export function CompareButton() {
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const sprites = useEditorStore((s) => s.sprites);
  const setDiffState = useEditorStore((s) => s.setDiffState);
  const fileRef = useRef<HTMLInputElement>(null);
  const bin = bins[activeBin];

  const handleFile = useCallback(
    (file: File) => {
      if (!bin) return;
      const img = new Image();
      img.onload = () => {
        const beforeCanvas = document.createElement("canvas");
        beforeCanvas.width = bin.width;
        beforeCanvas.height = bin.height;
        const beforeCtx = beforeCanvas.getContext("2d")!;
        beforeCtx.drawImage(img, 0, 0, bin.width, bin.height);
        const beforeData = beforeCtx.getImageData(0, 0, bin.width, bin.height);

        const afterCanvas = renderBinToCanvas(bin, sprites);
        const afterCtx = afterCanvas.getContext("2d")!;
        const afterData = afterCtx.getImageData(0, 0, bin.width, bin.height);

        const diffImageData = new ImageData(bin.width, bin.height);
        const mismatchCount = pixelmatch(
          beforeData.data,
          afterData.data,
          diffImageData.data,
          bin.width,
          bin.height,
          { threshold: 0.1, alpha: 0.5, diffColor: [255, 70, 70] },
        );

        setDiffState({
          active: true,
          before: beforeData,
          after: afterData,
          diff: diffImageData,
          mismatchCount,
          viewMode: "side-by-side",
        });
      };
      img.src = URL.createObjectURL(file);
    },
    [bin, sprites, setDiffState],
  );

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={!bin}
        className="hover:border-[var(--text)] hover:text-[var(--text)] transition-all duration-100"
        style={{
          height: 20,
          padding: "0 8px",
          fontSize: "9px",
          border: "1px solid var(--border)",
          color: !bin ? "var(--text-muted)" : "var(--text-dim)",
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          opacity: !bin ? 0.4 : 1,
          cursor: !bin ? "not-allowed" : "pointer",
        }}
      >
        Compare
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}
