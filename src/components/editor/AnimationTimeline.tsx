import { useEditorStore } from "@/stores/editor-store";
import { useState } from "react";

export function AnimationTimeline() {
  const animation = useEditorStore((s) => s.animation);
  const sprites = useEditorStore((s) => s.sprites);
  const setFps = useEditorStore((s) => s.setFps);
  const togglePlaying = useEditorStore((s) => s.togglePlaying);
  const setAnimationMode = useEditorStore((s) => s.setAnimationMode);
  const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);
  const removeFromAnimation = useEditorStore((s) => s.removeFromAnimation);
  const reorderAnimationFrames = useEditorStore((s) => s.reorderAnimationFrames);
  const setAnimationFrames = useEditorStore((s) => s.setAnimationFrames);
  const toggleOnionSkin = useEditorStore((s) => s.toggleOnionSkin);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const frameSprites = animation.frames
    .map((id) => sprites.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <div className="h-24 bg-[#0D0D0D] border-t border-[#1E1E1E] flex flex-col shrink-0">
      {/* Controls bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1E1E1E]">
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#666] uppercase tracking-wider">
          Timeline
        </span>

        <div className="w-px h-4 bg-[#1E1E1E]" />

        {/* Play/Pause */}
        <button
          onClick={togglePlaying}
          className="p-1 rounded hover:bg-[#1A1A1A] text-[#A0A0A0] hover:text-white transition-colors duration-150 cursor-pointer"
        >
          {animation.playing ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21" />
            </svg>
          )}
        </button>

        {/* FPS */}
        <div className="flex items-center gap-1">
          <input
            type="range"
            min={1}
            max={60}
            value={animation.fps}
            onChange={(e) => setFps(Number(e.target.value))}
            className="w-16 h-1 accent-[#06B6D4] cursor-pointer"
          />
          <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#A0A0A0] w-8">
            {animation.fps}fps
          </span>
        </div>

        <div className="w-px h-4 bg-[#1E1E1E]" />

        {/* Loop mode */}
        <div className="flex gap-0.5">
          {(["loop", "pingpong"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAnimationMode(mode)}
              className={`px-1.5 py-0.5 text-[9px] font-[family-name:var(--font-mono)] rounded cursor-pointer transition-colors duration-150 ${
                animation.mode === mode
                  ? "bg-[#06B6D4]/20 text-[#06B6D4]"
                  : "text-[#666] hover:text-[#A0A0A0]"
              }`}
            >
              {mode === "loop" ? "Loop" : "Ping-Pong"}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-[#1E1E1E]" />

        {/* Onion Skin toggle */}
        <button
          onClick={toggleOnionSkin}
          title="Toggle Onion Skin (O)"
          className={`px-1.5 py-0.5 text-[9px] font-[family-name:var(--font-mono)] rounded cursor-pointer transition-colors duration-150 ${
            animation.onionSkin
              ? "bg-[#06B6D4]/20 text-[#06B6D4]"
              : "text-[#666] hover:text-[#A0A0A0]"
          }`}
        >
          Onion
        </button>

        <div className="flex-1" />

        <span className="font-[family-name:var(--font-mono)] text-[9px] text-[#666]">
          {frameSprites.length} frames
        </span>

        {frameSprites.length > 0 && (
          <button
            onClick={() => setAnimationFrames([])}
            className="text-[9px] font-[family-name:var(--font-mono)] text-[#666] hover:text-red-400 transition-colors duration-150 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Frame strip */}
      <div className="flex-1 flex items-center gap-1 px-3 overflow-x-auto">
        {frameSprites.length === 0 ? (
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#333]">
            Right-click a sprite → Add to Animation
          </span>
        ) : (
          frameSprites.map((sprite, i) => (
            <button
              key={`${sprite!.id}-${i}`}
              draggable
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                setDragOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== i) {
                  reorderAnimationFrames(dragIndex, i);
                }
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onClick={() => setCurrentFrame(i)}
              onContextMenu={(e) => {
                e.preventDefault();
                removeFromAnimation(i);
              }}
              className={`w-14 h-14 rounded border shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-150 relative ${
                animation.currentFrame === i
                  ? "border-[#06B6D4] bg-[#06B6D4]/10"
                  : "border-[#1E1E1E] bg-[#0A0A0A] hover:border-[#333]"
              } ${dragOverIndex === i && dragIndex !== i ? "border-l-2 border-l-[#06B6D4]" : ""} ${
                dragIndex === i ? "opacity-40" : ""
              }`}
            >
              <span className="absolute top-0.5 left-1 font-[family-name:var(--font-mono)] text-[7px] text-[#666]">
                {i + 1}
              </span>
              {sprite!.image && (
                <canvas
                  ref={(canvas) => {
                    if (canvas && sprite!.image) {
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        canvas.width = 48;
                        canvas.height = 48;
                        const scale = Math.min(48 / sprite!.width, 48 / sprite!.height);
                        const w = sprite!.width * scale;
                        const h = sprite!.height * scale;
                        ctx.clearRect(0, 0, 48, 48);
                        ctx.drawImage(sprite!.image, (48 - w) / 2, (48 - h) / 2, w, h);
                      }
                    }
                  }}
                  width={48}
                  height={48}
                />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
