# Engine Realtime Sync

## Problem
Game developers using SpriteForge must manually export their atlas, copy the files to their game project, and re-import every time they make changes. This export-copy-import cycle breaks creative flow, especially during rapid iteration on sprite animations and icon sets.

## Solution
Add real-time WebSocket-based sync between the SpriteForge web editor and game engine plugins for Godot 4 and Unity. When auto-sync is enabled, every atlas repack is automatically pushed to the running game engine, where the texture updates in real time without restarting the game.

## Key Features
- **WebSocket protocol** on `ws://127.0.0.1:47405` with handshake, heartbeat, and binary PNG transfer
- **Auto-push on pack**: atlas PNG + JSON descriptor sent automatically after every repack
- **Godot 4 plugin**: GDScript EditorPlugin with bottom dock, TCP/WebSocket server, live texture reload
- **Unity plugin**: C# EditorWindow with HttpListener WebSocket server, main-thread marshalling
- **Mixed-content detection**: warns when HTTPS editor tries ws:// connections
- **Manual push shortcut**: Ctrl+Shift+S / Cmd+Shift+S

## Non-Goals
- Bidirectional sync (engine -> editor)
- Unreal Engine plugin (future work)
- Secure WebSocket (wss://) — localhost only, no TLS needed
