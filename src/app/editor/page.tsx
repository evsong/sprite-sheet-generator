"use client";

import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { SpriteList } from "@/components/editor/SpriteList";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { AnimationTimeline } from "@/components/editor/AnimationTimeline";
import { AiGenerateModal } from "@/components/editor/AiGenerateModal";
import { AiProgressToast } from "@/components/editor/AiProgressToast";
import { useAutoPack } from "@/hooks/use-auto-pack";
import { useAnimationPlayback } from "@/hooks/use-animation-playback";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useEditorStore } from "@/stores/editor-store";
import { loadDemoSprites } from "@/lib/demo-sprites";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function EditorPage() {
  useAutoPack();
  useAnimationPlayback();
  useKeyboardShortcuts();

  const aiModalOpen = useEditorStore((s) => s.aiModalOpen);
  const setAiModalOpen = useEditorStore((s) => s.setAiModalOpen);
  const sprites = useEditorStore((s) => s.sprites);
  const addSprites = useEditorStore((s) => s.addSprites);
  const setAnimationFrames = useEditorStore((s) => s.setAnimationFrames);
  const demoLoaded = useRef(false);

  useEffect(() => {
    if (demoLoaded.current || sprites.length > 0) return;
    demoLoaded.current = true;
    loadDemoSprites().then((demo) => {
      addSprites(demo);
      const animFrames = demo.filter((s) => s.isAnimation).map((s) => s.id);
      setAnimationFrames(animFrames.length ? animFrames : demo.map((s) => s.id));
    });
  }, [sprites.length, addSprites, setAnimationFrames]);

  return (
    <div className="fixed inset-0 top-[var(--nav-h)] bg-[var(--bg)] text-white flex flex-col overflow-hidden">
      {/* Mobile gate */}
      <div className="md:hidden flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <svg viewBox="0 0 20 20" fill="none" width="32" height="32">
          <rect width="20" height="20" fill="#fff" />
          <rect x="4" y="4" width="5" height="5" fill="#000" />
          <rect x="11" y="4" width="5" height="5" fill="#000" />
          <rect x="4" y="11" width="5" height="5" fill="#000" />
          <rect x="11" y="11" width="5" height="5" fill="#06B6D4" />
        </svg>
        <p style={{ fontSize: "14px", color: "var(--text-dim)", lineHeight: 1.6 }}>
          SpriteForge Editor is designed for desktop browsers.<br />
          Please visit on a computer for the best experience.
        </p>
        <Link
          href="/"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "8px 20px",
            border: "1px solid var(--border)",
            color: "var(--text-dim)",
          }}
        >
          Back to Home
        </Link>
      </div>

      {/* Desktop editor */}
      <div
        className="hidden md:grid w-full h-full"
        style={{
          gridTemplateColumns: "180px 1fr 220px",
          gridTemplateRows: "30px 1fr 64px",
        }}
      >
        <EditorToolbar />
        <SpriteList />
        <EditorCanvas />
        <SettingsPanel />
        <AnimationTimeline />
      </div>
      <AiGenerateModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      <AiProgressToast />
    </div>
  );
}
