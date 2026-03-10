/**
 * Plugin Bundler
 *
 * Bundles Godot and Unity engine plugin files and generates
 * downloadable ZIP archives for users.
 */

// ── Godot Plugin Files ─────────────────────────────────────────────

const GODOT_PLUGIN_CFG = `[plugin]

name="SpriteForge Sync"
description="Real-time sync with SpriteForge web editor. Receives atlas updates via WebSocket."
author="SpriteForge"
version="1.0.0"
script="spriteforge_sync.gd"
`;

const GODOT_DOCK_TSCN = `[gd_scene format=3]

[node name="SpriteForgeSync" type="VBoxContainer"]
`;

const GODOT_SYNC_GD = `@tool
extends EditorPlugin

const PROTOCOL_VERSION := 1
const DEFAULT_PORT := 47405
const HEARTBEAT_TIMEOUT_SEC := 15.0

var _dock: Control
var _tcp_server: TCPServer
var _ws_peer: WebSocketPeer
var _port: int = DEFAULT_PORT
var _running := false
var _handshake_done := false
var _session_token := ""
var _last_heartbeat_time := 0.0
var _pending_atlas_id := ""
var _pending_atlas_json := ""
var _pending_atlas_width := 0
var _pending_atlas_height := 0
var _pending_atlas_sprite_count := 0
var _awaiting_binary := false

var _status_label: Label
var _port_input: SpinBox
var _toggle_button: Button
var _info_label: Label
var _texture_rect: TextureRect
var _atlas_texture: ImageTexture


func _enter_tree() -> void:
\t_dock = _build_dock()
\tadd_control_to_bottom_panel(_dock, "SpriteForge")
\t_tcp_server = TCPServer.new()
\t_atlas_texture = ImageTexture.new()


func _exit_tree() -> void:
\t_stop_server()
\tif _dock:
\t\tremove_control_from_bottom_panel(_dock)
\t\t_dock.queue_free()


func _process(delta: float) -> void:
\tif not _running:
\t\treturn
\tif _tcp_server.is_connection_available():
\t\tif _ws_peer != null and _ws_peer.get_ready_state() != WebSocketPeer.STATE_CLOSED:
\t\t\tvar tcp := _tcp_server.take_connection()
\t\t\ttcp.disconnect_from_host()
\t\telse:
\t\t\tvar tcp := _tcp_server.take_connection()
\t\t\t_ws_peer = WebSocketPeer.new()
\t\t\t_ws_peer.accept_stream(tcp)
\t\t\t_handshake_done = false
\t\t\t_awaiting_binary = false
\t\t\t_update_status("Client connecting...")
\tif _ws_peer == null:
\t\treturn
\t_ws_peer.poll()
\tvar state := _ws_peer.get_ready_state()
\tif state == WebSocketPeer.STATE_OPEN:
\t\twhile _ws_peer.get_available_packet_count() > 0:
\t\t\tvar packet := _ws_peer.get_packet()
\t\t\tif _ws_peer.was_string_packet():
\t\t\t\t_handle_text_message(packet.get_string_from_utf8())
\t\t\telse:
\t\t\t\t_handle_binary_message(packet)
\t\tif _handshake_done:
\t\t\t_last_heartbeat_time += delta
\t\t\tif _last_heartbeat_time > HEARTBEAT_TIMEOUT_SEC:
\t\t\t\t_update_status("Client timed out")
\t\t\t\t_ws_peer.close(1000, "heartbeat_timeout")
\t\t\t\t_ws_peer = null
\t\t\t\t_handshake_done = false
\telif state == WebSocketPeer.STATE_CLOSED:
\t\t_update_status("Disconnected (code: %d)" % _ws_peer.get_close_code())
\t\t_ws_peer = null
\t\t_handshake_done = false
\t\t_awaiting_binary = false


func _handle_text_message(text: String) -> void:
\tvar json := JSON.new()
\tvar err := json.parse(text)
\tif err != OK:
\t\treturn
\tvar msg: Dictionary = json.data
\tvar msg_type: String = msg.get("type", "")
\tmatch msg_type:
\t\t"handshake":
\t\t\t_handle_handshake(msg)
\t\t"atlas_update":
\t\t\t_handle_atlas_update(msg)
\t\t"heartbeat":
\t\t\t_handle_heartbeat()
\t\t"disconnect":
\t\t\t_update_status("Client disconnected")
\t\t\t_ws_peer.close(1000, "client_disconnect")


func _handle_handshake(msg: Dictionary) -> void:
\tvar version: int = msg.get("version", 0)
\tif version != PROTOCOL_VERSION:
\t\t_send_json({"type": "handshake_ack", "accepted": false, "engine": "godot-4", "reason": "Protocol version mismatch"})
\t\treturn
\t_session_token = str(msg.get("sessionToken", ""))
\t_handshake_done = true
\t_last_heartbeat_time = 0.0
\t_send_json({"type": "handshake_ack", "accepted": true, "engine": "godot-4", "timestamp": _timestamp_ms()})
\t_update_status("Connected (session: %s...)" % _session_token.left(8))


func _handle_atlas_update(msg: Dictionary) -> void:
\tif not _handshake_done:
\t\treturn
\t_pending_atlas_id = str(msg.get("atlasId", ""))
\t_pending_atlas_json = str(msg.get("atlasJson", ""))
\t_pending_atlas_width = int(msg.get("width", 0))
\t_pending_atlas_height = int(msg.get("height", 0))
\t_pending_atlas_sprite_count = int(msg.get("spriteCount", 0))
\t_awaiting_binary = true
\t_last_heartbeat_time = 0.0


func _handle_binary_message(data: PackedByteArray) -> void:
\tif not _awaiting_binary:
\t\treturn
\t_awaiting_binary = false
\tvar image := Image.new()
\tvar err := image.load_png_from_buffer(data)
\tif err != OK:
\t\t_send_json({"type": "atlas_ack", "atlasId": _pending_atlas_id, "success": false, "error": "Failed to load PNG"})
\t\treturn
\t_atlas_texture = ImageTexture.create_from_image(image)
\tif _texture_rect:
\t\t_texture_rect.texture = _atlas_texture
\timage.save_png("res://spriteforge_atlas.png")
\tvar file := FileAccess.open("res://spriteforge_atlas.json", FileAccess.WRITE)
\tif file:
\t\tfile.store_string(_pending_atlas_json)
\t\tfile.close()
\tEditorInterface.get_resource_filesystem().scan()
\t_send_json({"type": "atlas_ack", "atlasId": _pending_atlas_id, "success": true, "timestamp": _timestamp_ms()})
\t_update_status("Atlas updated: %dx%d (%d sprites)" % [_pending_atlas_width, _pending_atlas_height, _pending_atlas_sprite_count])


func _handle_heartbeat() -> void:
\t_last_heartbeat_time = 0.0
\t_send_json({"type": "heartbeat", "timestamp": _timestamp_ms()})


func _start_server() -> void:
\tif _running:
\t\treturn
\t_port = int(_port_input.value) if _port_input else DEFAULT_PORT
\tvar err := _tcp_server.listen(_port, "127.0.0.1")
\tif err != OK:
\t\t_update_status("Failed to listen on port %d" % _port)
\t\treturn
\t_running = true
\t_update_status("Listening on 127.0.0.1:%d" % _port)
\tif _toggle_button:
\t\t_toggle_button.text = "Stop Server"
\tif _port_input:
\t\t_port_input.editable = false


func _stop_server() -> void:
\tif not _running:
\t\treturn
\tif _ws_peer and _ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
\t\t_send_json({"type": "disconnect", "reason": "server_shutdown"})
\t\t_ws_peer.close(1000, "server_shutdown")
\t_ws_peer = null
\t_tcp_server.stop()
\t_running = false
\t_handshake_done = false
\t_awaiting_binary = false
\t_update_status("Server stopped")
\tif _toggle_button:
\t\t_toggle_button.text = "Start Server"
\tif _port_input:
\t\t_port_input.editable = true


func _toggle_server() -> void:
\tif _running:
\t\t_stop_server()
\telse:
\t\t_start_server()


func _send_json(data: Dictionary) -> void:
\tif _ws_peer and _ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
\t\t_ws_peer.send_text(JSON.stringify(data))


func _timestamp_ms() -> int:
\treturn int(Time.get_unix_time_from_system() * 1000.0)


func _update_status(text: String) -> void:
\tif _status_label:
\t\t_status_label.text = text


func _build_dock() -> Control:
\tvar panel := VBoxContainer.new()
\tpanel.name = "SpriteForgeSync"
\tvar header := Label.new()
\theader.text = "SpriteForge Sync"
\theader.add_theme_font_size_override("font_size", 14)
\tpanel.add_child(header)
\tpanel.add_child(HSeparator.new())
\tvar port_row := HBoxContainer.new()
\tvar port_label := Label.new()
\tport_label.text = "Port:"
\tport_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
\tport_row.add_child(port_label)
\t_port_input = SpinBox.new()
\t_port_input.min_value = 1024
\t_port_input.max_value = 65535
\t_port_input.value = DEFAULT_PORT
\tport_row.add_child(_port_input)
\tpanel.add_child(port_row)
\t_toggle_button = Button.new()
\t_toggle_button.text = "Start Server"
\t_toggle_button.pressed.connect(_toggle_server)
\tpanel.add_child(_toggle_button)
\t_status_label = Label.new()
\t_status_label.text = "Server stopped"
\tpanel.add_child(_status_label)
\t_info_label = Label.new()
\t_info_label.text = ""
\tpanel.add_child(_info_label)
\tpanel.add_child(HSeparator.new())
\tvar preview_label := Label.new()
\tpreview_label.text = "Atlas Preview:"
\tpanel.add_child(preview_label)
\t_texture_rect = TextureRect.new()
\t_texture_rect.custom_minimum_size = Vector2(256, 256)
\t_texture_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
\tpanel.add_child(_texture_rect)
\treturn panel
`;

// ── Unity Plugin Files ─────────────────────────────────────────────

const UNITY_ASMDEF = `{
    "name": "SpriteForgeSync",
    "rootNamespace": "SpriteForge",
    "references": [],
    "includePlatforms": [
        "Editor"
    ],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "overrideReferences": false,
    "precompiledReferences": [],
    "autoReferenced": true,
    "defineConstraints": [],
    "versionDefines": [],
    "noEngineReferences": false
}
`;

// Unity C# file is too large to inline; we'll provide a readme with install instructions
const UNITY_README = `# SpriteForge Sync — Unity Plugin

## Installation
1. Copy the SpriteForgeSync folder into your Unity project's Assets/Editor/ directory
2. Open Unity — the plugin compiles automatically
3. Open Window > SpriteForge Sync
4. Click "Start Server" (default port 47405)
5. In the SpriteForge web editor, enable Engine Sync in Settings

## Requirements
- Unity 2021.3 or later
- .NET Framework 4.x or .NET Standard 2.1

## How It Works
The plugin runs a local WebSocket server that receives real-time atlas
updates from the SpriteForge web editor. When you export or modify your
sprite sheet, the atlas PNG and JSON descriptor are automatically
imported into your Unity project.
`;

// ── Download Functions ─────────────────────────────────────────────

export async function downloadGodotPlugin(): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const folder = zip.folder("addons/spriteforge_sync")!;
  folder.file("plugin.cfg", GODOT_PLUGIN_CFG);
  folder.file("spriteforge_dock.tscn", GODOT_DOCK_TSCN);
  folder.file("spriteforge_sync.gd", GODOT_SYNC_GD);

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "spriteforge-godot-plugin.zip");
}

export async function downloadUnityPlugin(): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const folder = zip.folder("SpriteForgeSync")!;
  folder.file("SpriteForgeSync.asmdef", UNITY_ASMDEF);
  folder.file("README.md", UNITY_README);

  // Fetch the full C# file from the public plugins directory
  // If not available, provide a stub with install instructions
  try {
    const res = await fetch("/plugins/unity/SpriteForgeSync/SpriteForgeSync.cs");
    if (res.ok) {
      const csContent = await res.text();
      folder.file("SpriteForgeSync.cs", csContent);
    } else {
      throw new Error("Not found");
    }
  } catch {
    // Fallback: include a note that the file should be downloaded from GitHub
    folder.file(
      "SpriteForgeSync.cs",
      "// Download the full SpriteForgeSync.cs from:\n// https://github.com/evsong/sprite-sheet-generator/tree/main/plugins/unity/SpriteForgeSync/\n",
    );
  }

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "spriteforge-unity-plugin.zip");
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
