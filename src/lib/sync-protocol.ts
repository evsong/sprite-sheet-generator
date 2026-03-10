/**
 * SpriteForge Engine Realtime Sync Protocol
 *
 * WebSocket message types for communication between the SpriteForge web editor
 * and game engine plugins (Godot 4, Unity).
 *
 * Default port: 47405 (SPRTE on phone keypad)
 */

// ── Protocol Constants ──────────────────────────────────────────────

export const SYNC_PROTOCOL_VERSION = 1;
export const SYNC_DEFAULT_PORT = 47405;
export const SYNC_HEARTBEAT_INTERVAL_MS = 5000;
export const SYNC_RECONNECT_BASE_MS = 1000;
export const SYNC_RECONNECT_MAX_MS = 30000;

// ── Message Types ───────────────────────────────────────────────────

export type SyncMessageType =
  | "handshake"
  | "handshake_ack"
  | "atlas_update"
  | "atlas_ack"
  | "heartbeat"
  | "disconnect";

// ── Handshake ───────────────────────────────────────────────────────

/** Sent by web client upon connecting to the engine plugin's WS server. */
export interface HandshakeMessage {
  type: "handshake";
  version: number;
  sessionToken: string;
  editor: "spriteforge-web";
  timestamp: number;
}

/** Sent by engine plugin to acknowledge a valid handshake. */
export interface HandshakeAckMessage {
  type: "handshake_ack";
  accepted: boolean;
  engine: string; // e.g. "godot-4", "unity-2022"
  reason?: string; // rejection reason if accepted === false
  timestamp: number;
}

// ── Atlas Update ────────────────────────────────────────────────────

/**
 * Sent by web client when a new atlas pack is ready.
 *
 * The message is sent as a JSON text frame. Immediately after, the client
 * sends a binary frame containing the PNG data. The engine plugin associates
 * the binary frame with the preceding atlas_update JSON.
 */
export interface AtlasUpdateMessage {
  type: "atlas_update";
  sessionToken: string;
  atlasId: string; // unique per push, e.g. UUID
  width: number;
  height: number;
  spriteCount: number;
  /** JSON atlas descriptor (same format as export). */
  atlasJson: string;
  timestamp: number;
}

/** Sent by engine plugin to confirm receipt of an atlas update. */
export interface AtlasAckMessage {
  type: "atlas_ack";
  atlasId: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

// ── Heartbeat ───────────────────────────────────────────────────────

/** Bidirectional keep-alive ping. */
export interface HeartbeatMessage {
  type: "heartbeat";
  timestamp: number;
}

// ── Disconnect ──────────────────────────────────────────────────────

/** Graceful disconnect notification. */
export interface DisconnectMessage {
  type: "disconnect";
  reason: string;
  timestamp: number;
}

// ── Union Type ──────────────────────────────────────────────────────

export type SyncMessage =
  | HandshakeMessage
  | HandshakeAckMessage
  | AtlasUpdateMessage
  | AtlasAckMessage
  | HeartbeatMessage
  | DisconnectMessage;

// ── Helpers ─────────────────────────────────────────────────────────

export function createHandshake(sessionToken: string): HandshakeMessage {
  return {
    type: "handshake",
    version: SYNC_PROTOCOL_VERSION,
    sessionToken,
    editor: "spriteforge-web",
    timestamp: Date.now(),
  };
}

export function createAtlasUpdate(
  sessionToken: string,
  atlasId: string,
  width: number,
  height: number,
  spriteCount: number,
  atlasJson: string,
): AtlasUpdateMessage {
  return {
    type: "atlas_update",
    sessionToken,
    atlasId,
    width,
    height,
    spriteCount,
    atlasJson,
    timestamp: Date.now(),
  };
}

export function createHeartbeat(): HeartbeatMessage {
  return { type: "heartbeat", timestamp: Date.now() };
}

export function createDisconnect(reason: string): DisconnectMessage {
  return { type: "disconnect", reason, timestamp: Date.now() };
}

export function parseSyncMessage(data: string): SyncMessage | null {
  try {
    const msg = JSON.parse(data);
    if (msg && typeof msg.type === "string") return msg as SyncMessage;
    return null;
  } catch {
    return null;
  }
}
