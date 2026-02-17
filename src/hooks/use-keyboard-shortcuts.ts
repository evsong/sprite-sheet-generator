"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";

/**
 * Global keyboard shortcuts for the editor.
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const state = useEditorStore.getState();
      const { selectedSpriteId, sprites } = state;

      // Delete selected sprite
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedSpriteId && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          state.removeSprite(selectedSpriteId);
        }
        return;
      }

      // ⌘D — Duplicate selected sprite
      if (meta && e.key === "d") {
        e.preventDefault();
        if (!selectedSpriteId) return;
        const sprite = sprites.find((s) => s.id === selectedSpriteId);
        if (!sprite) return;
        state.addSprites([{
          ...sprite,
          id: crypto.randomUUID(),
          name: `${sprite.name}-copy`,
        }]);
        return;
      }

      // ⌘A — Select all (add all to animation)
      if (meta && e.shiftKey && e.key === "a") {
        e.preventDefault();
        if (selectedSpriteId) {
          state.addToAnimation(selectedSpriteId);
        }
        return;
      }

      // Escape — Deselect
      if (e.key === "Escape") {
        state.selectSprite(null);
        state.setAiModalOpen(false);
        return;
      }

      // Space — Toggle animation playback
      if (e.key === " " && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        state.togglePlaying();
        return;
      }

      // +/- — Zoom
      if (meta && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        state.setZoom(Math.min(4, state.zoom + 0.25));
        return;
      }
      if (meta && e.key === "-") {
        e.preventDefault();
        state.setZoom(Math.max(0.25, state.zoom - 0.25));
        return;
      }

      // ⌘0 — Reset zoom
      if (meta && e.key === "0") {
        e.preventDefault();
        state.setZoom(1);
        return;
      }

      // O — Toggle onion skin
      if (e.key === "o" && !meta && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        state.toggleOnionSkin();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
