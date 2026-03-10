import { useEditorStore } from "@/stores/editor-store";
import type { EngineSyncStatus } from "@/stores/editor-store";

const STATUS_COLORS: Record<EngineSyncStatus, string> = {
  connected: "#22C55E",    // green
  connecting: "#EAB308",   // yellow
  disconnected: "#6B7280", // gray (not red — red implies error)
};

const STATUS_LABELS: Record<EngineSyncStatus, string> = {
  connected: "Engine connected",
  connecting: "Connecting to engine...",
  disconnected: "Engine sync off",
};

export function SyncStatusIndicator() {
  const engineSync = useEditorStore((s) => s.engineSync);

  if (!engineSync.autoSync) return null;

  const color = STATUS_COLORS[engineSync.status];
  const label = engineSync.engineName
    ? `Connected to ${engineSync.engineName}`
    : STATUS_LABELS[engineSync.status];

  return (
    <div
      className="flex items-center gap-1.5"
      title={label}
      style={{ cursor: "default" }}
    >
      {/* Pulsing dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: engineSync.status === "connected" ? `0 0 4px ${color}` : "none",
          animation: engineSync.status === "connecting" ? "pulse 1.5s ease-in-out infinite" : "none",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 8,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {engineSync.status === "connected"
          ? engineSync.engineName ?? "Engine"
          : engineSync.status === "connecting"
          ? "Sync..."
          : "Sync"}
      </span>

      {/* Inline keyframe animation for the pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
