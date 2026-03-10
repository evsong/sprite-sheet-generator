@tool
extends EditorPlugin
## SpriteForge Sync — Godot 4 Plugin
##
## Receives real-time atlas updates from the SpriteForge web editor
## via WebSocket. The web client connects to this plugin's server.
##
## Usage:
##   1. Enable the plugin in Project Settings > Plugins
##   2. A "SpriteForge" dock appears in the bottom panel
##   3. Click "Start Server" (default port 47405)
##   4. In SpriteForge web editor, enable Engine Sync in Settings

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

# UI references
var _status_label: Label
var _port_input: SpinBox
var _toggle_button: Button
var _info_label: Label
var _texture_rect: TextureRect

# The last received atlas texture
var _atlas_texture: ImageTexture


func _enter_tree() -> void:
	_dock = _build_dock()
	add_control_to_bottom_panel(_dock, "SpriteForge")
	_tcp_server = TCPServer.new()
	_atlas_texture = ImageTexture.new()


func _exit_tree() -> void:
	_stop_server()
	if _dock:
		remove_control_from_bottom_panel(_dock)
		_dock.queue_free()


func _process(delta: float) -> void:
	if not _running:
		return

	# Accept new TCP connections
	if _tcp_server.is_connection_available():
		if _ws_peer != null and _ws_peer.get_ready_state() != WebSocketPeer.STATE_CLOSED:
			# Already have a connection, reject new one
			var tcp := _tcp_server.take_connection()
			tcp.disconnect_from_host()
		else:
			var tcp := _tcp_server.take_connection()
			_ws_peer = WebSocketPeer.new()
			_ws_peer.accept_stream(tcp)
			_handshake_done = false
			_awaiting_binary = false
			_update_status("Client connecting...")

	if _ws_peer == null:
		return

	_ws_peer.poll()

	var state := _ws_peer.get_ready_state()

	if state == WebSocketPeer.STATE_OPEN:
		# Process all available packets
		while _ws_peer.get_available_packet_count() > 0:
			var packet := _ws_peer.get_packet()
			if _ws_peer.was_string_packet():
				_handle_text_message(packet.get_string_from_utf8())
			else:
				_handle_binary_message(packet)

		# Check heartbeat timeout
		if _handshake_done:
			_last_heartbeat_time += delta
			if _last_heartbeat_time > HEARTBEAT_TIMEOUT_SEC:
				_update_status("Client timed out")
				_ws_peer.close(1000, "heartbeat_timeout")
				_ws_peer = null
				_handshake_done = false

	elif state == WebSocketPeer.STATE_CLOSED:
		_update_status("Disconnected (code: %d)" % _ws_peer.get_close_code())
		_ws_peer = null
		_handshake_done = false
		_awaiting_binary = false


func _handle_text_message(text: String) -> void:
	var json := JSON.new()
	var err := json.parse(text)
	if err != OK:
		push_warning("[SpriteForge] Invalid JSON: " + text.left(100))
		return

	var msg: Dictionary = json.data
	var msg_type: String = msg.get("type", "")

	match msg_type:
		"handshake":
			_handle_handshake(msg)
		"atlas_update":
			_handle_atlas_update(msg)
		"heartbeat":
			_handle_heartbeat()
		"disconnect":
			_update_status("Client disconnected: " + str(msg.get("reason", "")))
			_ws_peer.close(1000, "client_disconnect")
		_:
			push_warning("[SpriteForge] Unknown message type: " + msg_type)


func _handle_handshake(msg: Dictionary) -> void:
	var version: int = msg.get("version", 0)
	if version != PROTOCOL_VERSION:
		_send_json({
			"type": "handshake_ack",
			"accepted": false,
			"engine": "godot-4",
			"reason": "Protocol version mismatch (expected %d, got %d)" % [PROTOCOL_VERSION, version],
			"timestamp": _timestamp_ms(),
		})
		_update_status("Rejected: version mismatch")
		return

	_session_token = str(msg.get("sessionToken", ""))
	_handshake_done = true
	_last_heartbeat_time = 0.0

	_send_json({
		"type": "handshake_ack",
		"accepted": true,
		"engine": "godot-4",
		"timestamp": _timestamp_ms(),
	})
	_update_status("Connected (session: %s...)" % _session_token.left(8))


func _handle_atlas_update(msg: Dictionary) -> void:
	if not _handshake_done:
		push_warning("[SpriteForge] Received atlas_update before handshake")
		return

	_pending_atlas_id = str(msg.get("atlasId", ""))
	_pending_atlas_json = str(msg.get("atlasJson", ""))
	_pending_atlas_width = int(msg.get("width", 0))
	_pending_atlas_height = int(msg.get("height", 0))
	_pending_atlas_sprite_count = int(msg.get("spriteCount", 0))
	_awaiting_binary = true
	_last_heartbeat_time = 0.0


func _handle_binary_message(data: PackedByteArray) -> void:
	if not _awaiting_binary:
		push_warning("[SpriteForge] Unexpected binary data")
		return
	_awaiting_binary = false

	# Load PNG from buffer
	var image := Image.new()
	var err := image.load_png_from_buffer(data)
	if err != OK:
		_send_json({
			"type": "atlas_ack",
			"atlasId": _pending_atlas_id,
			"success": false,
			"error": "Failed to load PNG (error %d)" % err,
			"timestamp": _timestamp_ms(),
		})
		_update_status("Error: failed to load PNG")
		return

	# Create/update texture
	_atlas_texture = ImageTexture.create_from_image(image)

	# Update preview in dock
	if _texture_rect:
		_texture_rect.texture = _atlas_texture

	# Save to project (optional — makes it available in the FileSystem dock)
	var save_path := "res://spriteforge_atlas.png"
	image.save_png(save_path)

	# Also save the JSON atlas descriptor
	var json_path := "res://spriteforge_atlas.json"
	var file := FileAccess.open(json_path, FileAccess.WRITE)
	if file:
		file.store_string(_pending_atlas_json)
		file.close()

	# Trigger reimport
	EditorInterface.get_resource_filesystem().scan()

	_send_json({
		"type": "atlas_ack",
		"atlasId": _pending_atlas_id,
		"success": true,
		"timestamp": _timestamp_ms(),
	})

	_update_status("Atlas updated: %d×%d (%d sprites)" % [
		_pending_atlas_width, _pending_atlas_height, _pending_atlas_sprite_count
	])
	if _info_label:
		_info_label.text = "Last: %d×%d · %d sprites · %s" % [
			_pending_atlas_width,
			_pending_atlas_height,
			_pending_atlas_sprite_count,
			Time.get_time_string_from_system(),
		]


func _handle_heartbeat() -> void:
	_last_heartbeat_time = 0.0
	_send_json({
		"type": "heartbeat",
		"timestamp": _timestamp_ms(),
	})


# ── Server control ──────────────────────────────────────────────────

func _start_server() -> void:
	if _running:
		return

	_port = int(_port_input.value) if _port_input else DEFAULT_PORT
	var err := _tcp_server.listen(_port, "127.0.0.1")
	if err != OK:
		_update_status("Failed to listen on port %d (error %d)" % [_port, err])
		return

	_running = true
	_update_status("Listening on 127.0.0.1:%d" % _port)
	if _toggle_button:
		_toggle_button.text = "Stop Server"
	if _port_input:
		_port_input.editable = false


func _stop_server() -> void:
	if not _running:
		return

	if _ws_peer and _ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
		_send_json({
			"type": "disconnect",
			"reason": "server_shutdown",
			"timestamp": _timestamp_ms(),
		})
		_ws_peer.close(1000, "server_shutdown")

	_ws_peer = null
	_tcp_server.stop()
	_running = false
	_handshake_done = false
	_awaiting_binary = false
	_update_status("Server stopped")
	if _toggle_button:
		_toggle_button.text = "Start Server"
	if _port_input:
		_port_input.editable = true


func _toggle_server() -> void:
	if _running:
		_stop_server()
	else:
		_start_server()


# ── Helpers ─────────────────────────────────────────────────────────

func _send_json(data: Dictionary) -> void:
	if _ws_peer and _ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
		_ws_peer.send_text(JSON.stringify(data))


func _timestamp_ms() -> int:
	return int(Time.get_unix_time_from_system() * 1000.0)


func _update_status(text: String) -> void:
	if _status_label:
		_status_label.text = text
	print("[SpriteForge] " + text)


# ── Dock UI ─────────────────────────────────────────────────────────

func _build_dock() -> Control:
	var panel := VBoxContainer.new()
	panel.name = "SpriteForgeSync"
	panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	# Header
	var header := Label.new()
	header.text = "SpriteForge Sync"
	header.add_theme_font_size_override("font_size", 14)
	panel.add_child(header)

	# Separator
	panel.add_child(HSeparator.new())

	# Port row
	var port_row := HBoxContainer.new()
	var port_label := Label.new()
	port_label.text = "Port:"
	port_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	port_row.add_child(port_label)

	_port_input = SpinBox.new()
	_port_input.min_value = 1024
	_port_input.max_value = 65535
	_port_input.value = DEFAULT_PORT
	_port_input.custom_minimum_size.x = 100
	port_row.add_child(_port_input)
	panel.add_child(port_row)

	# Toggle button
	_toggle_button = Button.new()
	_toggle_button.text = "Start Server"
	_toggle_button.pressed.connect(_toggle_server)
	panel.add_child(_toggle_button)

	# Status
	_status_label = Label.new()
	_status_label.text = "Server stopped"
	_status_label.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
	panel.add_child(_status_label)

	# Info (last update)
	_info_label = Label.new()
	_info_label.text = ""
	_info_label.add_theme_font_size_override("font_size", 11)
	_info_label.add_theme_color_override("font_color", Color(0.5, 0.8, 0.5))
	panel.add_child(_info_label)

	# Separator
	panel.add_child(HSeparator.new())

	# Atlas preview
	var preview_label := Label.new()
	preview_label.text = "Atlas Preview:"
	panel.add_child(preview_label)

	_texture_rect = TextureRect.new()
	_texture_rect.custom_minimum_size = Vector2(256, 256)
	_texture_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_texture_rect.expand_mode = TextureRect.EXPAND_FIT_WIDTH
	panel.add_child(_texture_rect)

	return panel
