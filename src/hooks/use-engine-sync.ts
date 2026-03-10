"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { renderBinToCanvas } from "@/lib/exporter";
import {
  SYNC_DEFAULT_PORT,
  SYNC_HEARTBEAT_INTERVAL_MS,
  SYNC_RECONNECT_BASE_MS,
  SYNC_RECONNECT_MAX_MS,
  createHandshake,
  createAtlasUpdate,
  createHeartbeat,
  createDisconnect,
  parseSyncMessage,
} from "@/lib/sync-protocol";
import type { PackedBin, SpriteItem } from "@/stores/editor-store";

// ── Helpers ─────────────────────────────────────────────────────────

function canvasToArrayBuffer(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Failed to create PNG blob"));
      blob.arrayBuffer().then(resolve, reject);
    }, "image/png");
  });
}

function buildAtlasJson(bin: PackedBin, sprites: SpriteItem[]): string {
  const frames: Record<string, unknown> = {};
  for (const rect of bin.rects) {
    const sprite = sprites.find((s) => s.id === rect.spriteId);
    const name = sprite?.name ?? rect.spriteId;
    frames[name] = {
      frame: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      rotated: rect.rot,
      trimmed: sprite?.trimmed ?? false,
      spriteSourceSize: sprite?.trimmed && sprite?.trimRect
        ? { x: sprite.trimRect.x, y: sprite.trimRect.y, w: sprite.trimRect.w, h: sprite.trimRect.h }
        : { x: 0, y: 0, w: rect.width, h: rect.height },
      sourceSize: sprite?.trimmed && sprite?.sourceSize
        ? { w: sprite.sourceSize.w, h: sprite.sourceSize.h }
        : { w: rect.width, h: rect.height },
    };
  }
  return JSON.stringify({
    frames,
    meta: {
      app: "SpriteForge",
      version: "1.0",
      image: "spritesheet.png",
      size: { w: bin.width, h: bin.height },
      scale: 1,
    },
  });
}

/**
 * Detects mixed-content issues: HTTPS page trying to connect via ws://.
 * Returns true if the connection would be blocked.
 */
function isMixedContentBlocked(port: number): boolean {
  if (typeof window === "undefined") return false;
  // ws://127.0.0.1 is exempted from mixed-content in most browsers,
  // but ws://localhost may not be in all environments.
  // We warn but don't block for 127.0.0.1.
  return window.location.protocol === "https:" && port > 0;
}

// ── Hook ────────────────────────────────────────────────────────────

/**
 * Manages the WebSocket connection to a game engine plugin.
 *
 * - Connects to ws://127.0.0.1:{port}
 * - Performs handshake with session token
 * - Auto-pushes atlas PNG + JSON whenever bins change (if autoSync is on)
 * - Sends heartbeat every 5s
 * - Reconnects with exponential backoff on disconnect
 */
export function useEngineSync() {
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const handshakeAcceptedRef = useRef(false);
  const lastPushedBinsRef = useRef<string>("");

  const engineSync = useEditorStore((s) => s.engineSync);
  const updateEngineSync = useEditorStore((s) => s.updateEngineSync);
  const bins = useEditorStore((s) => s.bins);
  const sprites = useEditorStore((s) => s.sprites);

  // ── Cleanup helpers ─────────────────────────────────────────────

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopHeartbeat();
    clearReconnectTimeout();
    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(createDisconnect("client_cleanup")));
        }
        ws.close(1000, "cleanup");
      } catch {
        // ignore close errors
      }
    }
    handshakeAcceptedRef.current = false;
  }, [stopHeartbeat, clearReconnectTimeout]);

  // ── Connect ─────────────────────────────────────────────────────

  const connect = useCallback(() => {
    const { port, sessionToken, connected } = useEditorStore.getState().engineSync;
    if (connected || wsRef.current) return;

    clearReconnectTimeout();

    // Mixed-content warning
    if (isMixedContentBlocked(port)) {
      console.warn(
        "[SpriteForge Sync] Page served over HTTPS — ws://127.0.0.1 connections may be blocked by the browser. " +
        "Consider using the editor over HTTP for local engine sync, or configure your engine plugin to use wss://."
      );
      updateEngineSync({ mixedContentWarning: true });
    }

    const url = `ws://127.0.0.1:${port}`;
    updateEngineSync({ status: "connecting" });

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
    } catch (err) {
      console.error("[SpriteForge Sync] Failed to create WebSocket:", err);
      updateEngineSync({ status: "disconnected" });
      scheduleReconnect();
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
      ws.send(JSON.stringify(createHandshake(sessionToken)));

      // Start heartbeat
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(createHeartbeat()));
        }
      }, SYNC_HEARTBEAT_INTERVAL_MS);
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== "string") return; // ignore binary frames from server
      const msg = parseSyncMessage(event.data);
      if (!msg) return;

      switch (msg.type) {
        case "handshake_ack":
          if (msg.accepted) {
            handshakeAcceptedRef.current = true;
            updateEngineSync({
              connected: true,
              status: "connected",
              engineName: msg.engine,
              mixedContentWarning: false,
            });
          } else {
            console.warn("[SpriteForge Sync] Handshake rejected:", msg.reason);
            updateEngineSync({ status: "disconnected" });
            ws.close(1000, "handshake_rejected");
          }
          break;

        case "atlas_ack":
          if (msg.success) {
            updateEngineSync({ lastPushAt: msg.timestamp });
          } else {
            console.warn("[SpriteForge Sync] Atlas rejected:", msg.error);
          }
          break;

        case "heartbeat":
          // Server echoed heartbeat, connection is alive
          break;

        case "disconnect":
          console.info("[SpriteForge Sync] Server disconnecting:", msg.reason);
          break;
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      handshakeAcceptedRef.current = false;
      stopHeartbeat();
      updateEngineSync({ connected: false, status: "disconnected", engineName: undefined });
      scheduleReconnect();
    };

    ws.onerror = () => {
      // onclose will fire after onerror, so reconnect is handled there
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateEngineSync, stopHeartbeat, clearReconnectTimeout]);

  // ── Reconnect with exponential backoff ──────────────────────────

  const scheduleReconnect = useCallback(() => {
    const { autoSync } = useEditorStore.getState().engineSync;
    if (!autoSync) return;

    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(
      SYNC_RECONNECT_BASE_MS * Math.pow(2, attempt),
      SYNC_RECONNECT_MAX_MS
    );
    reconnectAttemptRef.current = attempt + 1;

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      const { autoSync: stillAuto } = useEditorStore.getState().engineSync;
      if (stillAuto) connect();
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  // ── Push atlas to engine ────────────────────────────────────────

  const pushAtlas = useCallback(async () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !handshakeAcceptedRef.current) return;

    const state = useEditorStore.getState();
    const { bins: currentBins, sprites: currentSprites, engineSync: sync } = state;

    if (currentBins.length === 0) return;

    // Push the active bin
    const activeBin = currentBins[state.activeBin] ?? currentBins[0];
    if (!activeBin) return;

    try {
      const canvas = renderBinToCanvas(activeBin, currentSprites);
      const pngBuffer = await canvasToArrayBuffer(canvas);
      const atlasJson = buildAtlasJson(activeBin, currentSprites);
      const atlasId = crypto.randomUUID();

      // Send JSON metadata first
      const updateMsg = createAtlasUpdate(
        sync.sessionToken,
        atlasId,
        activeBin.width,
        activeBin.height,
        activeBin.rects.length,
        atlasJson,
      );
      ws.send(JSON.stringify(updateMsg));

      // Then send binary PNG data
      ws.send(pngBuffer);

      updateEngineSync({ lastPushAt: Date.now() });
    } catch (err) {
      console.error("[SpriteForge Sync] Failed to push atlas:", err);
    }
  }, [updateEngineSync]);

  // ── Auto-sync when bins change ──────────────────────────────────

  useEffect(() => {
    if (!engineSync.autoSync || !engineSync.connected) return;
    if (bins.length === 0) return;

    // Fingerprint bins to avoid duplicate pushes
    const fingerprint = JSON.stringify(
      bins.map((b) => ({
        w: b.width,
        h: b.height,
        n: b.rects.length,
        ids: b.rects.map((r) => r.spriteId).sort(),
      }))
    );
    if (fingerprint === lastPushedBinsRef.current) return;
    lastPushedBinsRef.current = fingerprint;

    // Debounce: wait 300ms after last bin change before pushing
    const timer = setTimeout(() => {
      pushAtlas();
    }, 300);

    return () => clearTimeout(timer);
  }, [bins, sprites, engineSync.autoSync, engineSync.connected, pushAtlas]);

  // ── Connect/disconnect based on autoSync toggle ─────────────────

  useEffect(() => {
    if (engineSync.autoSync) {
      connect();
    } else {
      cleanup();
      updateEngineSync({ connected: false, status: "disconnected", engineName: undefined });
    }

    return () => {
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineSync.autoSync, engineSync.port]);

  // ── Listen for manual push shortcut (Ctrl+Shift+S) ──────────────

  useEffect(() => {
    const handler = () => {
      pushAtlas();
    };
    window.addEventListener("spriteforge:manual-push", handler);
    return () => window.removeEventListener("spriteforge:manual-push", handler);
  }, [pushAtlas]);

  // ── Expose manual push ──────────────────────────────────────────

  return { pushAtlas };
}
