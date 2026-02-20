"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";

const STAGE_COLORS = {
  generating: "#F59E0B",
  splitting: "#3B82F6",
  "removing-bg": "#8B5CF6",
  done: "#22C55E",
};

export function AiProgressToast() {
  const progress = useEditorStore((s) => s.aiProgress);

  useEffect(() => {
    if (progress?.stage === "done" && !progress.error) {
      const t = setTimeout(() => useEditorStore.getState().setAiProgress(null), 2000);
      return () => clearTimeout(t);
    }
  }, [progress?.stage, progress?.error]);

  if (!progress?.active) return null;

  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const color = progress.error ? "#EF4444" : STAGE_COLORS[progress.stage || "generating"];
  const label = progress.error ? "Generation failed" : progress.stageLabel || "Generating...";

  return (
    <div className="fixed bottom-16 right-4 z-[200] w-64 bg-[#0D0D0D] border border-[#1E1E1E] rounded-lg p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        {progress.error ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        ) : progress.stage === "done" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        )}
        <span className="text-[11px] font-[family-name:var(--font-mono)] text-white truncate flex-1">
          {label}
        </span>
      </div>

      <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {progress.error && (
        <p className="text-[10px] text-red-400 mt-1.5 font-[family-name:var(--font-mono)]">{progress.error}</p>
      )}

      {progress.error && (
        <button
          onClick={() => useEditorStore.getState().setAiProgress(null)}
          className="mt-2 text-[10px] text-[#666] hover:text-white font-[family-name:var(--font-mono)] cursor-pointer transition-colors"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
