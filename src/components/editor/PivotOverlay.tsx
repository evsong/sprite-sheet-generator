import { useEditorStore } from "@/stores/editor-store";
import { useCallback, useRef } from "react";

/**
 * Transparent overlay rendered on top of the canvas area when pivot edit mode
 * is active. Displays a draggable crosshair for the selected sprite's pivot
 * point. The crosshair position is normalized (0..1) relative to the sprite's
 * packed rect on the atlas.
 */
export function PivotOverlay() {
  const pivotEditMode = useEditorStore((s) => s.pivotEditMode);
  const selectedSpriteId = useEditorStore((s) => s.selectedSpriteId);
  const sprites = useEditorStore((s) => s.sprites);
  const bins = useEditorStore((s) => s.bins);
  const activeBin = useEditorStore((s) => s.activeBin);
  const zoom = useEditorStore((s) => s.zoom);
  const dragging = useRef(false);

  const sprite = sprites.find((s) => s.id === selectedSpriteId);
  const bin = bins[activeBin];
  const rect = bin?.rects.find((r) => r.spriteId === selectedSpriteId);

  const isVisible = pivotEditMode && !!sprite && !!rect && !!bin;

  const updatePivotFromEvent = useCallback(
    (clientX: number, clientY: number, overlayEl: HTMLElement) => {
      const state = useEditorStore.getState();
      const currentBin = state.bins[state.activeBin];
      const currentSprite = state.sprites.find((s) => s.id === state.selectedSpriteId);
      const currentRect = currentBin?.rects.find((r) => r.spriteId === state.selectedSpriteId);
      if (!currentRect || !currentBin || !currentSprite) return;

      const bounds = overlayEl.getBoundingClientRect();
      const canvasDisplayW = currentBin.width * state.zoom;
      const canvasDisplayH = currentBin.height * state.zoom;
      const offsetX = (bounds.width - canvasDisplayW) / 2;
      const offsetY = (bounds.height - canvasDisplayH) / 2;

      const localX = (clientX - bounds.left - offsetX) / state.zoom;
      const localY = (clientY - bounds.top - offsetY) / state.zoom;

      const rw = currentRect.rot ? currentRect.height : currentRect.width;
      const rh = currentRect.rot ? currentRect.width : currentRect.height;

      const nx = Math.max(0, Math.min(1, (localX - currentRect.x) / rw));
      const ny = Math.max(0, Math.min(1, (localY - currentRect.y) / rh));

      state.updateSprite(currentSprite.id, {
        pivot: { x: Math.round(nx * 100) / 100, y: Math.round(ny * 100) / 100 },
      });
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePivotFromEvent(e.clientX, e.clientY, e.currentTarget);
    },
    [updatePivotFromEvent],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      updatePivotFromEvent(e.clientX, e.clientY, e.currentTarget);
    },
    [updatePivotFromEvent],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  if (!isVisible) return null;

  const rw = rect.rot ? rect.height : rect.width;
  const rh = rect.rot ? rect.width : rect.height;

  // Pixel position of pivot within the packed rect
  const pivotPx = {
    x: rect.x + sprite.pivot.x * rw,
    y: rect.y + sprite.pivot.y * rh,
  };

  // Scale crosshair position to screen coordinates
  const crossX = pivotPx.x * zoom;
  const crossY = pivotPx.y * zoom;

  return (
    <div
      className="absolute inset-0 z-10"
      style={{ cursor: "crosshair" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Center-aligned container matching the canvas transform */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="relative"
          style={{
            width: bin.width * zoom,
            height: bin.height * zoom,
          }}
        >
          {/* Crosshair */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              left: crossX - 12,
              top: crossY - 12,
              pointerEvents: "none",
              filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))",
            }}
          >
            {/* Outer circle */}
            <circle cx="12" cy="12" r="8" fill="none" stroke="#06B6D4" strokeWidth="1.5" />
            {/* Cross lines */}
            <line x1="12" y1="2" x2="12" y2="8" stroke="#06B6D4" strokeWidth="1.5" />
            <line x1="12" y1="16" x2="12" y2="22" stroke="#06B6D4" strokeWidth="1.5" />
            <line x1="2" y1="12" x2="8" y2="12" stroke="#06B6D4" strokeWidth="1.5" />
            <line x1="16" y1="12" x2="22" y2="12" stroke="#06B6D4" strokeWidth="1.5" />
            {/* Center dot */}
            <circle cx="12" cy="12" r="2" fill="#06B6D4" />
          </svg>

          {/* Pivot coordinates label */}
          <div
            style={{
              position: "absolute",
              left: crossX + 14,
              top: crossY - 8,
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              color: "#06B6D4",
              background: "rgba(0,0,0,0.8)",
              padding: "1px 4px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {sprite.pivot.x.toFixed(2)}, {sprite.pivot.y.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
