#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using UnityEditor;
using UnityEngine;

namespace SpriteForge
{
    /// <summary>
    /// SpriteForge Engine Sync — Unity Editor Window
    ///
    /// Runs a WebSocket server that receives real-time atlas updates
    /// from the SpriteForge web editor.
    ///
    /// Menu: Window > SpriteForge Sync
    /// </summary>
    public class SpriteForgeSync : EditorWindow
    {
        // ── Protocol Constants ──────────────────────────────────────

        private const int PROTOCOL_VERSION = 1;
        private const int DEFAULT_PORT = 47405;
        private const float HEARTBEAT_TIMEOUT_SEC = 15f;

        // ── State ───────────────────────────────────────────────────

        private int _port = DEFAULT_PORT;
        private bool _running;
        private bool _autoImport = true;
        private string _status = "Server stopped";
        private string _lastUpdateInfo = "";
        private string _sessionToken = "";
        private float _lastHeartbeatTime;
        private bool _handshakeDone;

        // Atlas state
        private Texture2D _atlasPreview;
        private string _pendingAtlasId = "";
        private string _pendingAtlasJson = "";
        private int _pendingWidth;
        private int _pendingHeight;
        private int _pendingSpriteCount;
        private bool _awaitingBinary;

        // Server
        private HttpListener _httpListener;
        private CancellationTokenSource _cts;
        private WebSocket _clientSocket;

        // Thread-safe queue for main-thread actions
        private readonly Queue<Action> _mainThreadQueue = new Queue<Action>();
        private readonly object _queueLock = new object();

        // ── Editor Window ───────────────────────────────────────────

        [MenuItem("Window/SpriteForge Sync")]
        public static void ShowWindow()
        {
            var window = GetWindow<SpriteForgeSync>("SpriteForge Sync");
            window.minSize = new Vector2(300, 400);
        }

        private void OnEnable()
        {
            EditorApplication.update += ProcessMainThreadQueue;
        }

        private void OnDisable()
        {
            EditorApplication.update -= ProcessMainThreadQueue;
            StopServer();
        }

        private void OnDestroy()
        {
            StopServer();
        }

        // ── GUI ─────────────────────────────────────────────────────

        private void OnGUI()
        {
            GUILayout.Label("SpriteForge Sync", EditorStyles.boldLabel);
            EditorGUILayout.Space(4);

            // Port
            EditorGUI.BeginDisabledGroup(_running);
            _port = EditorGUILayout.IntField("Port", _port);
            _port = Mathf.Clamp(_port, 1024, 65535);
            EditorGUI.EndDisabledGroup();

            // Auto-import toggle
            _autoImport = EditorGUILayout.Toggle("Auto Import", _autoImport);

            EditorGUILayout.Space(4);

            // Start/Stop button
            if (GUILayout.Button(_running ? "Stop Server" : "Start Server"))
            {
                if (_running)
                    StopServer();
                else
                    StartServer();
            }

            EditorGUILayout.Space(8);

            // Status
            EditorGUILayout.LabelField("Status", _status);

            if (!string.IsNullOrEmpty(_lastUpdateInfo))
            {
                EditorGUILayout.LabelField("Last Update", _lastUpdateInfo);
            }

            if (!string.IsNullOrEmpty(_sessionToken))
            {
                EditorGUILayout.LabelField("Session", _sessionToken.Length > 8
                    ? _sessionToken.Substring(0, 8) + "..."
                    : _sessionToken);
            }

            EditorGUILayout.Space(8);

            // Atlas preview
            if (_atlasPreview != null)
            {
                GUILayout.Label("Atlas Preview:");
                var rect = GUILayoutUtility.GetAspectRect(
                    (float)_atlasPreview.width / _atlasPreview.height,
                    GUILayout.MaxWidth(position.width - 20),
                    GUILayout.MaxHeight(256));
                EditorGUI.DrawPreviewTexture(rect, _atlasPreview);
            }
        }

        // ── Server Lifecycle ────────────────────────────────────────

        private void StartServer()
        {
            if (_running) return;

            try
            {
                _cts = new CancellationTokenSource();
                _httpListener = new HttpListener();
                _httpListener.Prefixes.Add($"http://127.0.0.1:{_port}/");
                _httpListener.Start();
                _running = true;
                _status = $"Listening on 127.0.0.1:{_port}";

                // Start accepting connections on a background thread
                _ = AcceptConnectionsAsync(_cts.Token);

                Debug.Log($"[SpriteForge] Server started on port {_port}");
            }
            catch (Exception ex)
            {
                _status = $"Failed: {ex.Message}";
                _running = false;
                Debug.LogError($"[SpriteForge] Failed to start server: {ex}");
            }
        }

        private void StopServer()
        {
            if (!_running) return;

            _cts?.Cancel();

            try
            {
                if (_clientSocket != null &&
                    _clientSocket.State == WebSocketState.Open)
                {
                    var msg = JsonUtility.ToJson(new DisconnectMessage
                    {
                        type = "disconnect",
                        reason = "server_shutdown",
                        timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                    });
                    var bytes = Encoding.UTF8.GetBytes(msg);
                    _clientSocket.SendAsync(
                        new ArraySegment<byte>(bytes),
                        WebSocketMessageType.Text, true,
                        CancellationToken.None).Wait(1000);
                    _clientSocket.CloseAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "server_shutdown",
                        CancellationToken.None).Wait(1000);
                }
            }
            catch
            {
                // Ignore shutdown errors
            }

            _clientSocket = null;

            try { _httpListener?.Stop(); } catch { }
            try { _httpListener?.Close(); } catch { }

            _httpListener = null;
            _running = false;
            _handshakeDone = false;
            _awaitingBinary = false;
            _status = "Server stopped";

            Debug.Log("[SpriteForge] Server stopped");
        }

        // ── WebSocket Handling ──────────────────────────────────────

        private async Task AcceptConnectionsAsync(CancellationToken ct)
        {
            while (!ct.IsCancellationRequested)
            {
                try
                {
                    var context = await _httpListener.GetContextAsync();

                    if (!context.Request.IsWebSocketRequest)
                    {
                        context.Response.StatusCode = 400;
                        context.Response.Close();
                        continue;
                    }

                    var wsContext = await context.AcceptWebSocketAsync(null);
                    _clientSocket = wsContext.WebSocket;
                    _handshakeDone = false;
                    _awaitingBinary = false;

                    EnqueueMainThread(() => _status = "Client connecting...");

                    await HandleClientAsync(_clientSocket, ct);
                }
                catch (ObjectDisposedException)
                {
                    break;
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    if (!ct.IsCancellationRequested)
                    {
                        Debug.LogWarning($"[SpriteForge] Accept error: {ex.Message}");
                        await Task.Delay(1000, ct);
                    }
                }
            }
        }

        private async Task HandleClientAsync(WebSocket ws, CancellationToken ct)
        {
            var buffer = new byte[4 * 1024 * 1024]; // 4 MB buffer for atlas PNG

            try
            {
                while (ws.State == WebSocketState.Open && !ct.IsCancellationRequested)
                {
                    var result = await ws.ReceiveAsync(
                        new ArraySegment<byte>(buffer), ct);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        EnqueueMainThread(() =>
                        {
                            _status = "Client disconnected";
                            _handshakeDone = false;
                        });
                        await ws.CloseAsync(
                            WebSocketCloseStatus.NormalClosure,
                            "client_closed",
                            ct);
                        break;
                    }

                    // Collect full message (may span multiple frames)
                    var ms = new MemoryStream();
                    ms.Write(buffer, 0, result.Count);
                    while (!result.EndOfMessage)
                    {
                        result = await ws.ReceiveAsync(
                            new ArraySegment<byte>(buffer), ct);
                        ms.Write(buffer, 0, result.Count);
                    }

                    var messageBytes = ms.ToArray();

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var text = Encoding.UTF8.GetString(messageBytes);
                        HandleTextMessage(ws, text);
                    }
                    else if (result.MessageType == WebSocketMessageType.Binary)
                    {
                        HandleBinaryMessage(ws, messageBytes);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Shutdown
            }
            catch (WebSocketException ex)
            {
                EnqueueMainThread(() => _status = $"WS error: {ex.Message}");
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[SpriteForge] Client handler error: {ex}");
                EnqueueMainThread(() => _status = "Error");
            }
        }

        private void HandleTextMessage(WebSocket ws, string text)
        {
            // Minimal JSON parsing without external dependencies
            var msgType = ExtractJsonString(text, "type");

            switch (msgType)
            {
                case "handshake":
                    HandleHandshake(ws, text);
                    break;
                case "atlas_update":
                    HandleAtlasUpdate(text);
                    break;
                case "heartbeat":
                    HandleHeartbeat(ws);
                    break;
                case "disconnect":
                    var reason = ExtractJsonString(text, "reason");
                    EnqueueMainThread(() => _status = $"Client disconnected: {reason}");
                    break;
            }
        }

        private void HandleHandshake(WebSocket ws, string text)
        {
            var versionStr = ExtractJsonString(text, "version");
            if (!int.TryParse(versionStr, out var version))
                version = 0;

            if (version != PROTOCOL_VERSION)
            {
                var reject = new HandshakeAckMessage
                {
                    type = "handshake_ack",
                    accepted = false,
                    engine = "unity-" + Application.unityVersion,
                    reason = $"Protocol version mismatch (expected {PROTOCOL_VERSION}, got {version})",
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };
                SendJson(ws, JsonUtility.ToJson(reject));
                EnqueueMainThread(() => _status = "Rejected: version mismatch");
                return;
            }

            _sessionToken = ExtractJsonString(text, "sessionToken") ?? "";
            _handshakeDone = true;
            _lastHeartbeatTime = 0;

            var ack = new HandshakeAckMessage
            {
                type = "handshake_ack",
                accepted = true,
                engine = "unity-" + Application.unityVersion,
                reason = "",
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
            SendJson(ws, JsonUtility.ToJson(ack));

            var token = _sessionToken;
            EnqueueMainThread(() =>
            {
                _status = $"Connected (session: {(token.Length > 8 ? token.Substring(0, 8) + "..." : token)})";
                Repaint();
            });
        }

        private void HandleAtlasUpdate(string text)
        {
            if (!_handshakeDone)
            {
                Debug.LogWarning("[SpriteForge] atlas_update before handshake");
                return;
            }

            _pendingAtlasId = ExtractJsonString(text, "atlasId") ?? "";
            _pendingAtlasJson = ExtractJsonString(text, "atlasJson") ?? "";

            if (int.TryParse(ExtractJsonString(text, "width"), out var w))
                _pendingWidth = w;
            if (int.TryParse(ExtractJsonString(text, "height"), out var h))
                _pendingHeight = h;
            if (int.TryParse(ExtractJsonString(text, "spriteCount"), out var sc))
                _pendingSpriteCount = sc;

            _awaitingBinary = true;
            _lastHeartbeatTime = 0;
        }

        private void HandleBinaryMessage(WebSocket ws, byte[] data)
        {
            if (!_awaitingBinary)
            {
                Debug.LogWarning("[SpriteForge] Unexpected binary data");
                return;
            }
            _awaitingBinary = false;

            var pngData = data;
            var atlasId = _pendingAtlasId;
            var atlasJson = _pendingAtlasJson;
            var atlasW = _pendingWidth;
            var atlasH = _pendingHeight;
            var count = _pendingSpriteCount;

            EnqueueMainThread(() =>
            {
                try
                {
                    // Load PNG into Texture2D
                    var tex = new Texture2D(2, 2, TextureFormat.RGBA32, false);
                    if (!tex.LoadImage(pngData))
                    {
                        SendAtlasAck(ws, atlasId, false, "Failed to load PNG");
                        _status = "Error: failed to load PNG";
                        return;
                    }
                    tex.Apply();

                    _atlasPreview = tex;

                    if (_autoImport)
                    {
                        // Save files to Assets
                        var pngPath = "Assets/SpriteForge/spriteforge_atlas.png";
                        var jsonPath = "Assets/SpriteForge/spriteforge_atlas.json";

                        var dir = Path.GetDirectoryName(pngPath);
                        if (!Directory.Exists(dir))
                            Directory.CreateDirectory(dir!);

                        File.WriteAllBytes(pngPath, pngData);
                        File.WriteAllText(jsonPath, atlasJson);

                        AssetDatabase.Refresh();
                    }

                    SendAtlasAck(ws, atlasId, true, null);
                    _status = $"Atlas: {atlasW}x{atlasH} ({count} sprites)";
                    _lastUpdateInfo = $"{atlasW}x{atlasH} - {count} sprites - {DateTime.Now:HH:mm:ss}";
                    Repaint();
                }
                catch (Exception ex)
                {
                    SendAtlasAck(ws, atlasId, false, ex.Message);
                    _status = $"Error: {ex.Message}";
                    Debug.LogError($"[SpriteForge] Atlas import error: {ex}");
                }
            });
        }

        private void HandleHeartbeat(WebSocket ws)
        {
            _lastHeartbeatTime = 0;
            var hb = new HeartbeatMessage
            {
                type = "heartbeat",
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
            SendJson(ws, JsonUtility.ToJson(hb));
        }

        // ── Helpers ─────────────────────────────────────────────────

        private void SendAtlasAck(WebSocket ws, string atlasId, bool success, string error)
        {
            // Use manual JSON to avoid issues with optional fields
            var sb = new StringBuilder();
            sb.Append("{\"type\":\"atlas_ack\"");
            sb.Append($",\"atlasId\":\"{EscapeJson(atlasId)}\"");
            sb.Append($",\"success\":{(success ? "true" : "false")}");
            if (!string.IsNullOrEmpty(error))
                sb.Append($",\"error\":\"{EscapeJson(error)}\"");
            sb.Append($",\"timestamp\":{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}");
            sb.Append("}");
            SendJson(ws, sb.ToString());
        }

        private static void SendJson(WebSocket ws, string json)
        {
            if (ws.State != WebSocketState.Open) return;
            var bytes = Encoding.UTF8.GetBytes(json);
            _ = ws.SendAsync(
                new ArraySegment<byte>(bytes),
                WebSocketMessageType.Text, true,
                CancellationToken.None);
        }

        private void EnqueueMainThread(Action action)
        {
            lock (_queueLock)
            {
                _mainThreadQueue.Enqueue(action);
            }
        }

        private void ProcessMainThreadQueue()
        {
            lock (_queueLock)
            {
                while (_mainThreadQueue.Count > 0)
                {
                    var action = _mainThreadQueue.Dequeue();
                    try { action(); }
                    catch (Exception ex)
                    {
                        Debug.LogError($"[SpriteForge] Main thread action error: {ex}");
                    }
                }
            }
        }

        /// <summary>
        /// Minimal JSON string value extractor. Avoids external dependency.
        /// Handles basic cases; not a full JSON parser.
        /// </summary>
        private static string ExtractJsonString(string json, string key)
        {
            var search = $"\"{key}\"";
            var idx = json.IndexOf(search, StringComparison.Ordinal);
            if (idx < 0) return null;

            idx += search.Length;

            // Skip whitespace and colon
            while (idx < json.Length && (json[idx] == ' ' || json[idx] == ':'))
                idx++;

            if (idx >= json.Length) return null;

            // Check if value is a string
            if (json[idx] == '"')
            {
                idx++;
                var sb = new StringBuilder();
                while (idx < json.Length)
                {
                    if (json[idx] == '\\' && idx + 1 < json.Length)
                    {
                        sb.Append(json[idx + 1]);
                        idx += 2;
                    }
                    else if (json[idx] == '"')
                    {
                        break;
                    }
                    else
                    {
                        sb.Append(json[idx]);
                        idx++;
                    }
                }
                return sb.ToString();
            }

            // Check for boolean / number
            var end = idx;
            while (end < json.Length && json[end] != ',' && json[end] != '}' && json[end] != ' ')
                end++;
            return json.Substring(idx, end - idx);
        }

        private static string EscapeJson(string s)
        {
            if (string.IsNullOrEmpty(s)) return s;
            return s.Replace("\\", "\\\\")
                     .Replace("\"", "\\\"")
                     .Replace("\n", "\\n")
                     .Replace("\r", "\\r")
                     .Replace("\t", "\\t");
        }

        // ── Serializable message types for JsonUtility ──────────────

        [Serializable]
        private struct HandshakeAckMessage
        {
            public string type;
            public bool accepted;
            public string engine;
            public string reason;
            public long timestamp;
        }

        [Serializable]
        private struct HeartbeatMessage
        {
            public string type;
            public long timestamp;
        }

        [Serializable]
        private struct DisconnectMessage
        {
            public string type;
            public string reason;
            public long timestamp;
        }
    }
}
#endif
