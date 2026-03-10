"use client";

import { useState } from "react";

interface UpgradePromptProps {
  feature: string;
  compact?: boolean;
}

/**
 * Non-blocking upgrade prompt shown when a free user attempts a PRO feature.
 * Dismissible. Links to the pricing section on the landing page.
 */
export function UpgradePrompt({ feature, compact }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "2px 6px",
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.2)",
          fontSize: 8,
          fontFamily: "var(--font-mono)",
          color: "var(--amber)",
          marginTop: 4,
        }}
      >
        <span style={{ flexShrink: 0 }}>PRO</span>
        <span style={{ color: "var(--text-dim)", flex: 1 }}>{feature}</span>
        <a
          href="/#pricing"
          style={{
            color: "var(--amber)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
            whiteSpace: "nowrap",
          }}
        >
          Upgrade
        </a>
        <button
          onClick={() => setDismissed(true)}
          style={{
            color: "var(--text-muted)",
            fontSize: 10,
            lineHeight: 1,
            cursor: "pointer",
            padding: "0 2px",
          }}
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: "rgba(245,158,11,0.06)",
        border: "1px solid rgba(245,158,11,0.18)",
        marginTop: 6,
        fontSize: 10,
        fontFamily: "var(--font-mono)",
      }}
    >
      <span
        style={{
          background: "var(--amber)",
          color: "#000",
          fontSize: 8,
          fontWeight: 700,
          padding: "1px 5px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          flexShrink: 0,
        }}
      >
        PRO
      </span>
      <span style={{ color: "var(--text-dim)", flex: 1 }}>{feature}</span>
      <a
        href="/#pricing"
        style={{
          color: "var(--amber)",
          fontWeight: 600,
          textDecoration: "none",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontSize: 9,
          whiteSpace: "nowrap",
        }}
      >
        Upgrade &rarr;
      </a>
      <button
        onClick={() => setDismissed(true)}
        style={{
          color: "var(--text-muted)",
          fontSize: 12,
          lineHeight: 1,
          cursor: "pointer",
          padding: "0 2px",
        }}
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}
