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
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Delete selected sprite
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedSpriteId && !isInput) {
          e.preventDefault();
          state.removeSprite(selectedSpriteId);
        }
        return;
      }

      // ⌘Z — Undo
      if (meta && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        useEditorStore.temporal.getState().undo();
        return;
      }

      // ⌘⇧Z — Redo
      if (meta && e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        useEditorStore.temporal.getState().redo();
        return;
      }

      // ⌘E — Export / Download .zip
      if (meta && e.key === "e") {
        e.preventDefault();
        const { bins, packingConfig } = state;
        if (bins.length === 0) return;
        import("@/lib/exporter").then(({ exportSpriteSheet }) => {
          exportSpriteSheet(bins, sprites, packingConfig);
        });
        return;
      }

      // ⌘A — Add all sequence sprites to animation frames
      if (meta && !e.shiftKey && e.key === "a") {
        e.preventDefault();
        const existingFrames = new Set(state.animation.frames);
        const sequenceSprites = sprites.filter(
          (s) => s.mode !== "atlas" && !existingFrames.has(s.id),
        );
        if (sequenceSprites.length > 0) {
          state.setAnimationFrames([
            ...state.animation.frames,
            ...sequenceSprites.map((s) => s.id),
          ]);
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

      // ⌘⇧A — Add selected sprite to animation
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
      if (e.key === " " && !isInput) {
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
      if (e.key === "o" && !meta && !isInput) {
        e.preventDefault();
        state.toggleOnionSkin();
        return;
      }

      // ⌘⇧S / Ctrl+Shift+S — Manual push to engine
      if (meta && e.shiftKey && e.key === "s") {
        e.preventDefault();
        // Dispatch a custom event that useEngineSync listens for
        window.dispatchEvent(new CustomEvent("spriteforge:manual-push"));
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
