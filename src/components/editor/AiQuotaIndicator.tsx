"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

type QuotaData = { used: number; limit: number; tier: string };

let _globalMutate: (() => void) | null = null;

/** Call this after AI actions to refresh the quota indicator */
export function mutateQuota() {
  _globalMutate?.();
}

export function AiQuotaIndicator() {
  const { data: session } = useSession();
  const [quota, setQuota] = useState<QuotaData | null>(null);

  const fetchQuota = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/quota");
      if (res.ok) {
        const data = await res.json();
        setQuota({ used: data.used, limit: data.limit, tier: data.tier });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    _globalMutate = fetchQuota;
    return () => { _globalMutate = null; };
  }, [fetchQuota]);

  useEffect(() => {
    if (session?.user) fetchQuota();
  }, [session, fetchQuota]);

  if (!session?.user || !quota) return null;

  const remaining = Math.max(quota.limit - quota.used, 0);
  const pct = quota.limit > 0 ? remaining / quota.limit : 0;
  const color = pct <= 0 ? "#EF4444" : pct <= 0.25 ? "#F59E0B" : "var(--text-muted)";

  return (
    <span
      title={`${quota.used}/${quota.limit} AI generations used today (${quota.tier})`}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "8px",
        fontWeight: 600,
        color,
        background: pct <= 0 ? "rgba(239,68,68,0.12)" : pct <= 0.25 ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)",
        padding: "2px 6px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {remaining}/{quota.limit} AI
    </span>
  );
}
