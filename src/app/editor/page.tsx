"use client";

import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { SpriteList } from "@/components/editor/SpriteList";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { AnimationTimeline } from "@/components/editor/AnimationTimeline";
import { FileInfoBar } from "@/components/editor/FileInfoBar";
import { StatusBar } from "@/components/editor/StatusBar";
import { AiGenerateModal } from "@/components/editor/AiGenerateModal";
import { AiProgressToast } from "@/components/editor/AiProgressToast";
import { useAutoPack } from "@/hooks/use-auto-pack";
import { useAnimationPlayback } from "@/hooks/use-animation-playback";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useEditorStore } from "@/stores/editor-store";

export default function EditorPage() {
  useAutoPack();
  useAnimationPlayback();
  useKeyboardShortcuts();

  const aiModalOpen = useEditorStore((s) => s.aiModalOpen);
  const setAiModalOpen = useEditorStore((s) => s.setAiModalOpen);

  return (
    <div className="h-screen w-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      <EditorToolbar />
      <FileInfoBar />
      <div className="flex flex-1 min-h-0">
        <SpriteList />
        <EditorCanvas />
        <SettingsPanel />
      </div>
      <AnimationTimeline />
      <StatusBar />
      <AiGenerateModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      <AiProgressToast />
    </div>
  );
}
