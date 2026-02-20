"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import { generateSpriteSheet } from "@/lib/generate-sprite-sheet";
import { loadHistory, type HistoryEntry } from "@/lib/generation-history";

const STYLES = [
  "Pixel Art", "Hand-drawn", "Flat Vector", "Isometric",
  "Chibi", "Retro 8-bit", "Watercolor", "Low Poly",
];

const SIZES = [32, 64, 128, 256] as const;

interface AiGenerateModalProps {
  open: boolean;
  onClose: () => void;
}

export function AiGenerateModal({ open, onClose }: AiGenerateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Pixel Art");
  const [frameCount, setFrameCount] = useState(4);
  const [targetSize, setTargetSize] = useState<number>(64);
  const [showHistory, setShowHistory] = useState(false);
  const [history] = useState<HistoryEntry[]>(() => loadHistory());

  if (!open) return null;

  const handleTemplate = (id: string) => {
    const t = PROMPT_TEMPLATES.find((p) => p.id === id);
    if (!t) return;
    setPrompt(t.prompt);
    setFrameCount(t.defaultFrames);
  };

  const handleReuse = (entry: HistoryEntry) => {
    setPrompt(entry.prompt);
    setStyle(entry.style);
    setFrameCount(entry.frameCount);
    setTargetSize(entry.targetSize);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const { addSprites, setAnimationFrames, setAiProgress } = useEditorStore.getState();
    onClose();

    try {
      const sprites = await generateSpriteSheet({
        prompt: prompt.trim(),
        style,
        frameCount,
        targetSize,
        onProgress: (p) => {
          const current = useEditorStore.getState().aiProgress;
          setAiProgress({ ...current, active: true, total: frameCount, completed: 0, prompt: prompt.trim(), ...p });
        },
      });

      addSprites(sprites);
      setAnimationFrames(sprites.map((s) => s.id));

      // Save to history
      const { saveHistory } = await import("@/lib/generation-history");
      saveHistory({ prompt: prompt.trim(), style, frameCount, targetSize, timestamp: Date.now() });
    } catch (err) {
      setAiProgress({
        active: true, total: frameCount, completed: 0, prompt: prompt.trim(),
        error: err instanceof Error ? err.message : "Generation failed",
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[300]" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[460px] max-h-[85vh] overflow-y-auto bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-5"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-white">
            AI Sprite Generator
          </h3>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Template cards */}
        <div className="mb-3">
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1.5">
            Templates
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {PROMPT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplate(t.id)}
                className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border border-[#1E1E1E] bg-[#1A1A1A] hover:border-[#F59E0B]/40 hover:bg-[#F59E0B]/5 transition-colors cursor-pointer"
              >
                <span className="text-base">{t.icon}</span>
                <span className="text-[9px] font-[family-name:var(--font-mono)] text-[#999]">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-3">
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1">
            Describe your sprite
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. a warrior character walking animation"
            rows={3}
            className="w-full bg-[#1A1A1A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-[12px] text-white placeholder-[#333] focus:border-[#F59E0B] focus:outline-none resize-none font-[family-name:var(--font-body)]"
          />
        </div>

        {/* Style */}
        <div className="mb-3">
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1">
            Style
          </label>
          <div className="flex flex-wrap gap-1">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-2 py-1 text-[10px] font-[family-name:var(--font-mono)] rounded-md cursor-pointer transition-colors duration-150 ${
                  style === s
                    ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                    : "bg-[#1A1A1A] text-[#666] border border-[#1E1E1E] hover:text-[#A0A0A0]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Target size */}
        <div className="mb-3">
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1">
            Target Size
          </label>
          <div className="flex gap-1.5">
            {SIZES.map((sz) => (
              <button
                key={sz}
                onClick={() => setTargetSize(sz)}
                className={`flex-1 py-1.5 text-[10px] font-[family-name:var(--font-mono)] rounded-md cursor-pointer transition-colors ${
                  targetSize === sz
                    ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                    : "bg-[#1A1A1A] text-[#666] border border-[#1E1E1E] hover:text-[#A0A0A0]"
                }`}
              >
                {sz}px
              </button>
            ))}
          </div>
        </div>

        {/* Frame count */}
        <div className="mb-4">
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1">
            Frames ({frameCount})
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={frameCount}
            onChange={(e) => setFrameCount(Number(e.target.value))}
            className="w-full h-1 accent-[#F59E0B] cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-[#666] font-[family-name:var(--font-mono)]">
            <span>1</span><span>10</span>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-[9px] font-[family-name:var(--font-mono)] text-[#666] hover:text-[#999] cursor-pointer transition-colors"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className={`transition-transform ${showHistory ? "rotate-90" : ""}`}>
                <path d="M2 1l4 3-4 3z" />
              </svg>
              Recent Generations ({history.length})
            </button>
            {showHistory && (
              <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-[#1A1A1A] border border-[#1E1E1E]">
                    {h.thumbnail && (
                      <img src={h.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#999] font-[family-name:var(--font-mono)] truncate">{h.prompt}</p>
                      <p className="text-[8px] text-[#555] font-[family-name:var(--font-mono)]">
                        {h.frameCount}f · {h.style} · {new Date(h.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReuse(h)}
                      className="text-[9px] text-[#F59E0B] hover:text-[#F59E0B]/80 font-[family-name:var(--font-mono)] cursor-pointer shrink-0"
                    >
                      Reuse
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim()}
          className="w-full py-2.5 text-[12px] font-semibold text-black bg-[#F59E0B] rounded-lg hover:brightness-110 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {`Generate ${frameCount > 1 ? `${frameCount} Frames` : "Sprite"} (${targetSize}px)`}
        </button>
      </div>
    </>
  );
}
