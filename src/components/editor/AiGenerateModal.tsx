"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor-store";

const STYLES = [
  "Pixel Art",
  "Hand-drawn",
  "Flat Vector",
  "Isometric",
  "Chibi",
  "Retro 8-bit",
  "Watercolor",
  "Low Poly",
];

interface AiGenerateModalProps {
  open: boolean;
  onClose: () => void;
}

async function generateInBackground(prompt: string, style: string, frameCount: number) {
  const { addSprites, setAiProgress } = useEditorStore.getState();

  setAiProgress({ active: true, total: frameCount, completed: 0, prompt });

  for (let i = 0; i < frameCount; i++) {
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, count: 1 }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiProgress({ active: false, total: frameCount, completed: i, prompt, error: data.error || "Generation failed" });
        return;
      }

      const dataUrl = (data.images as string[])[0];
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = dataUrl;
      });

      addSprites([{
        id: crypto.randomUUID(),
        name: `${prompt.trim().slice(0, 20).replace(/\s+/g, "-")}-${i + 1}`,
        file: null,
        image: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        trimmed: false,
        isAi: true,
      }]);

      setAiProgress({ active: true, total: frameCount, completed: i + 1, prompt });
    } catch {
      setAiProgress({ active: false, total: frameCount, completed: i, prompt, error: "Network error" });
      return;
    }
  }

  // Auto-dismiss after a short delay
  setTimeout(() => setAiProgress(null), 2000);
}

export function AiGenerateModal({ open, onClose }: AiGenerateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Pixel Art");
  const [frameCount, setFrameCount] = useState(1);

  if (!open) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateInBackground(prompt.trim(), style, frameCount);
    onClose();
    setPrompt("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[300]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[420px] bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-5"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
      >
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

        {/* Frame count */}
        <div className="mb-4">
          <label className="font-[family-name:var(--font-mono)] text-[9px] text-[#666] uppercase tracking-wider block mb-1">
            Frames ({frameCount})
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={frameCount}
            onChange={(e) => setFrameCount(Number(e.target.value))}
            className="w-full h-1 accent-[#F59E0B] cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-[#666] font-[family-name:var(--font-mono)]">
            <span>1</span>
            <span>8</span>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim()}
          className="w-full py-2.5 text-[12px] font-semibold text-black bg-[#F59E0B] rounded-lg hover:brightness-110 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {`Generate ${frameCount > 1 ? `${frameCount} Frames` : "Sprite"}`}
        </button>
      </div>
    </>
  );
}
