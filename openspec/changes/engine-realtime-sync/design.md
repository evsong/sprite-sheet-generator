# Engine Realtime Sync — Design

## Architecture

```
SpriteForge Web Editor (WS Client)
        |
        | ws://127.0.0.1:47405
        v
Engine Plugin WS Server (Godot / Unity)
```

The web editor acts as the WebSocket **client** connecting to the engine plugin's local **server**. This avoids the need for the browser to run a WS server (which is not possible in standard web APIs).

## Protocol (v1)

All messages are JSON text frames, except for PNG data which is sent as binary frames.

### Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| `handshake` | Client -> Server | Authenticate with session token, declare protocol version |
| `handshake_ack` | Server -> Client | Accept/reject handshake, declare engine identity |
| `atlas_update` | Client -> Server | Atlas metadata (JSON text frame), followed by PNG binary frame |
| `atlas_ack` | Server -> Client | Confirm receipt, report success/failure |
| `heartbeat` | Bidirectional | Keep-alive, every 5s from client, echoed by server |
| `disconnect` | Bidirectional | Graceful disconnect with reason |

### Atlas Push Flow

1. Web client packs sprites (auto-pack or manual)
2. Client sends `atlas_update` JSON with metadata + atlas JSON descriptor
3. Client immediately sends binary frame with PNG data
4. Server loads PNG into engine texture, saves files, triggers reimport
5. Server sends `atlas_ack` confirming success

### Reconnection

Exponential backoff: 1s, 2s, 4s, 8s, ... up to 30s max. Resets on successful connection.

## Web Client State (Zustand)

```typescript
interface EngineSyncState {
  connected: boolean;
  status: "disconnected" | "connecting" | "connected";
  port: number;           // default 47405
  autoSync: boolean;      // user toggle
  sessionToken: string;   // generated per session
  lastPushAt: number | null;
  engineName?: string;    // from handshake_ack
  mixedContentWarning?: boolean;
}
```

## File Layout

```
src/lib/sync-protocol.ts          # TypeScript types + helpers
src/hooks/use-engine-sync.ts      # WebSocket client hook
src/components/editor/SyncStatusIndicator.tsx
plugins/godot/plugin.cfg
plugins/godot/spriteforge_sync.gd
plugins/godot/spriteforge_dock.tscn
plugins/unity/SpriteForgeSync/SpriteForgeSync.cs
plugins/unity/SpriteForgeSync/SpriteForgeSync.asmdef
```

## Security

- Server binds to `127.0.0.1` only — no external access
- Session token validated on handshake
- Binary frames only accepted after `atlas_update` JSON (state machine)
- Mixed-content detection warns users on HTTPS pages
