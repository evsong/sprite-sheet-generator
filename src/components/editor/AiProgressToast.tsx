"use client";

import { useEffect, useState } from "react";
import { useEditorStore, type AiStage } from "@/stores/editor-store";
import { generateSpriteSheet } from "@/lib/generate-sprite-sheet";
import { mutateQuota } from "@/components/editor/AiQuotaIndicator";

const STAGES: { key: AiStage; label: string; icon: string }[] = [
  { key: "generating", label: "Generate", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { key: "splitting", label: "Split", icon: "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" },
  { key: "removing-bg", label: "Clean BG", icon: "M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" },
  { key: "done", label: "Done", icon: "M20 6L9 17l-5-5" },
];

const STAGE_COLORS: Record<string, string> = {
  generating: "#F59E0B",
  splitting: "#3B82F6",
  "removing-bg": "#8B5CF6",
  done: "#22C55E",
};

function getStageIndex(stage?: AiStage): number {
  if (!stage) return 0;
  return STAGES.findIndex((s) => s.key === stage);
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AiProgressToast() {
  const progress = useEditorStore((s) => s.aiProgress);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!progress?.active || !progress.startedAt) {
      setElapsed(0);
      return;
    }
    setElapsed(Date.now() - progress.startedAt);
    const iv = setInterval(() => {
      setElapsed(Date.now() - progress.startedAt!);
    }, 1000);
    return () => clearInterval(iv);
  }, [progress?.active, progress?.startedAt]);

  useEffect(() => {
    if (progress?.stage === "done" && !progress.error) {
      const t = setTimeout(() => useEditorStore.getState().setAiProgress(null), 3000);
      return () => clearTimeout(t);
    }
  }, [progress?.stage, progress?.error]);

  if (!progress?.active) return null;

  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const currentIdx = getStageIndex(progress.stage);
  const color = progress.error ? "#EF4444" : STAGE_COLORS[progress.stage || "generating"];
  const label = progress.error ? "Generation failed" : progress.stageLabel || "Generating...";

  const handleRetry = async () => {
    const { lastAiParams, addSprites, setAnimationFrames, setAiProgress } = useEditorStore.getState();
    if (!lastAiParams) return;

    try {
      const sprites = await generateSpriteSheet({
        ...lastAiParams,
        onProgress: (p) => {
          const current = useEditorStore.getState().aiProgress;
          setAiProgress({ ...current, active: true, total: lastAiParams.frameCount, completed: 0, prompt: lastAiParams.prompt, ...p });
        },
      });

      addSprites(sprites);
      mutateQuota();
      if (lastAiParams.mode === "sequence") {
        setAnimationFrames(sprites.map((s) => s.id));
      }
    } catch (err) {
      setAiProgress({
        active: true, total: lastAiParams.frameCount, completed: 0, prompt: lastAiParams.prompt,
        error: err instanceof Error ? err.message : "Generation failed",
      });
    }
  };

  // Compute weighted overall progress for the bar
  let barPct: string;
  if (progress.error) {
    barPct = "100%";
  } else if (progress.stage === "generating") {
    barPct = "15%";
  } else if (progress.stage === "splitting") {
    barPct = "45%";
  } else if (progress.stage === "removing-bg") {
    barPct = `${Math.round(50 + (pct * 45) / 100)}%`;
  } else {
    barPct = "100%";
  }

  return (
    <div
      className="fixed z-[200] left-1/2 -translate-x-1/2"
      style={{ bottom: 80 }}
    >
      <div
        className="bg-[#0A0A0A]/95 backdrop-blur-sm border border-[#1E1E1E] rounded-xl px-5 py-3 shadow-2xl"
        style={{ minWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
      >
        {/* Stage steps */}
        <div className="flex items-center justify-between mb-3">
          {STAGES.map((stage, i) => {
            const isActive = i === currentIdx;
            const isDone = i < currentIdx || (progress.stage === "done" && !progress.error);
            const stageColor = progress.error
              ? (isActive ? "#EF4444" : "#333")
              : isDone
                ? "#22C55E"
                : isActive
                  ? STAGE_COLORS[stage.key]
                  : "#333";

            return (
              <div key={stage.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      border: `1.5px solid ${stageColor}`,
                      backgroundColor: isDone ? stageColor + "20" : isActive ? stageColor + "15" : "transparent",
                    }}
                  >
                    {isDone && !isActive ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={stageColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={isActive && !isDone ? "animate-pulse" : ""}
                      >
                        <path d={stage.icon} />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-[8px] font-[family-name:var(--font-mono)] uppercase tracking-wider transition-colors duration-300"
                    style={{ color: isActive || isDone ? stageColor : "#444" }}
                  >
                    {stage.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <div
                    className="flex-1 h-px mx-2 transition-colors duration-300"
                    style={{
                      backgroundColor: isDone ? "#22C55E40" : "#1A1A1A",
                      marginBottom: 16,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${progress.stage === "generating" && !progress.error ? "animate-pulse" : ""}`}
            style={{
              width: barPct,
              backgroundColor: color,
            }}
          />
        </div>

        {/* Status text */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {progress.error ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            ) : progress.stage === "done" ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            )}
            <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#999]">
              {label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Elapsed time */}
            {!progress.error && progress.stage !== "done" && (
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#555]">
                {formatElapsed(elapsed)}
              </span>
            )}

            {/* Retry / Dismiss for errors */}
            {progress.error && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetry}
                  className="text-[10px] text-[#F59E0B] hover:text-[#F59E0B]/80 font-[family-name:var(--font-mono)] cursor-pointer transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => useEditorStore.getState().setAiProgress(null)}
                  className="text-[10px] text-[#666] hover:text-white font-[family-name:var(--font-mono)] cursor-pointer transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error details */}
        {progress.error && (
          <p className="text-[10px] text-red-400/80 mt-1 font-[family-name:var(--font-mono)]">{progress.error}</p>
        )}

        {/* Prompt snippet */}
        {!progress.error && progress.prompt && progress.stage !== "done" && (
          <p className="text-[9px] text-[#444] mt-1 font-[family-name:var(--font-mono)] truncate">
            {progress.prompt.length > 60 ? progress.prompt.slice(0, 60) + "..." : progress.prompt}
          </p>
        )}
      </div>
    </div>
  );
}
