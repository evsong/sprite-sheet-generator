"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { packSprites, trimTransparency } from "@/lib/packer";
import type { PackedBin } from "@/stores/editor-store";

const WORKER_THRESHOLD = 50;

/**
 * Watches sprites + packingConfig and auto-repacks whenever either changes.
 * Uses a Web Worker for large sprite sets (>50) to keep the main thread responsive.
 */
export function useAutoPack() {
  const sprites = useEditorStore((s) => s.sprites);
  const config = useEditorStore((s) => s.packingConfig);
  const setBins = useEditorStore((s) => s.setBins);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (sprites.length === 0) {
      setBins([]);
      return;
    }

    // Apply trimming if enabled
    const processed = sprites.map((sprite) => {
      if (config.trimTransparency && sprite.image && !sprite.trimmed) {
        const result = trimTransparency(sprite.image);
        if (result) {
          return {
            ...sprite,
            trimmed: true,
            trimRect: result.trimRect,
            sourceSize: result.sourceSize,
          };
        }
      }
      if (!config.trimTransparency && sprite.trimmed) {
        return { ...sprite, trimmed: false, trimRect: undefined, sourceSize: undefined };
      }
      return sprite;
    });

    const trimChanged = processed.some((p, i) => p.trimmed !== sprites[i].trimmed);
    if (trimChanged) {
      useEditorStore.setState({ sprites: processed });
    }

    // Offload to worker for large sprite sets
    if (processed.length > WORKER_THRESHOLD) {
      // Terminate previous worker if config changed
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      try {
        const worker = new Worker(
          new URL("../workers/packer.worker.ts", import.meta.url)
        );
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<PackedBin[]>) => {
          setBins(e.data);
          worker.terminate();
          if (workerRef.current === worker) workerRef.current = null;
        };

        worker.onerror = () => {
          console.warn("Packer worker failed, falling back to main thread");
          worker.terminate();
          if (workerRef.current === worker) workerRef.current = null;
          setBins(packSprites(processed, config));
        };

        worker.postMessage({
          sprites: processed.map((s) => ({
            id: s.id,
            width: s.width,
            height: s.height,
            trimmed: s.trimmed,
            trimRect: s.trimRect,
          })),
          config: {
            maxWidth: config.maxWidth,
            maxHeight: config.maxHeight,
            padding: config.padding,
            border: config.border,
            pot: config.pot,
            allowRotation: config.allowRotation,
          },
        });
      } catch {
        console.warn("Failed to create packer worker, using main thread");
        setBins(packSprites(processed, config));
      }
    } else {
      // Main thread for small sets
      setBins(packSprites(processed, config));
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [sprites, config, setBins]);
}
