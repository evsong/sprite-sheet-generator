# Engine Realtime Sync — Tasks

## Phase 1: Protocol & Web Client

- [x] Create `src/lib/sync-protocol.ts` with TypeScript types for all WS message types
- [x] Create `src/hooks/use-engine-sync.ts` with WebSocket client logic
  - Connect to ws://127.0.0.1:47405 (configurable port)
  - Handshake with session token
  - Auto-push atlas PNG + JSON on pack completion
  - Heartbeat every 5 seconds
  - Auto-reconnect with exponential backoff
- [x] Add `engineSync` state to `editor-store.ts`
- [x] Create `SyncStatusIndicator.tsx` (connection status dot in toolbar)
- [x] Add sync toggle and port config in SettingsPanel
- [x] Add keyboard shortcut for manual push (Ctrl+Shift+S)

## Phase 2: Godot 4 Plugin

- [x] Create `plugins/godot/plugin.cfg` (Godot addon metadata)
- [x] Create `plugins/godot/spriteforge_sync.gd` (GDScript WebSocket server)
  - TCPServer listening on configurable port
  - WebSocketPeer for connection handling
  - Handshake validation
  - Receive binary PNG -> Image.load_png_from_buffer() -> ImageTexture update
  - Editor dock UI showing connection status
- [x] Create `plugins/godot/spriteforge_dock.tscn` (UI scene)

## Phase 3: Unity Plugin

- [x] Create `plugins/unity/SpriteForgeSync/SpriteForgeSync.cs` (C# EditorWindow)
  - HttpListener-based WebSocket server
  - Main thread marshalling via EditorApplication.delayCall
  - Receive PNG bytes -> Texture2D.LoadImage() -> Apply()
  - EditorWindow UI with connection status, port config, auto-import toggle
- [x] Create `plugins/unity/SpriteForgeSync/SpriteForgeSync.asmdef` (Assembly Definition)

## Phase 4: Polish

- [x] Mixed-content detection (warn if HTTPS page trying ws://)
- [x] Connection status in toolbar (SyncStatusIndicator)
- [x] Keyboard shortcut for manual push (Ctrl+Shift+S)
- [x] Settings panel with port config and sync toggle
