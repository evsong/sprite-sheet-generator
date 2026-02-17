"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor-store";

/**
 * Drives animation playback — advances currentFrame based on FPS and mode.
 */
export function useAnimationPlayback() {
  const playing = useEditorStore((s) => s.animation.playing);
  const fps = useEditorStore((s) => s.animation.fps);
  const mode = useEditorStore((s) => s.animation.mode);
  const frames = useEditorStore((s) => s.animation.frames);
  const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);

  const directionRef = useRef(1); // 1 = forward, -1 = backward (for pingpong)

  useEffect(() => {
    if (!playing || frames.length < 2) return;

    const interval = 1000 / fps;
    const timer = setInterval(() => {
      const state = useEditorStore.getState();
      const { currentFrame } = state.animation;
      const total = state.animation.frames.length;

      if (mode === "loop") {
        setCurrentFrame((currentFrame + 1) % total);
      } else {
        // pingpong
        let next = currentFrame + directionRef.current;
        if (next >= total) {
          directionRef.current = -1;
          next = total - 2;
        } else if (next < 0) {
          directionRef.current = 1;
          next = 1;
        }
        setCurrentFrame(Math.max(0, Math.min(total - 1, next)));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [playing, fps, mode, frames.length, setCurrentFrame]);

  // Reset direction when mode changes
  useEffect(() => {
    directionRef.current = 1;
  }, [mode]);
}
