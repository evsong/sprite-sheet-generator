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
      <div
        className="w-full h-full"
        style={{
          display: "grid",
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
