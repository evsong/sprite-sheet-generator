"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    tier: "FREE",
    features: [
      { text: "Up to 64 sprites per sheet", off: false },
      { text: "5 export formats", off: false },
      { text: "Basic packing algorithm", off: false },
      { text: "Animation preview", off: false },
      { text: "AI sprite generation", off: true },
      { text: "Priority support", off: true },
    ],
    cta: "Start Free",
    ctaType: "ghost" as const,
    href: "/editor",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    tier: "PRO",
    featured: true,
    features: [
      { text: "Unlimited sprites per sheet", off: false },
      { text: "15+ export formats", off: false },
      { text: "Advanced MaxRects packing", off: false },
      { text: "Animation preview + onion skin", off: false },
      { text: "50 AI generations / month", off: false },
      { text: "Email support", off: false },
    ],
    cta: "Get Pro",
    ctaType: "primary" as const,
    href: "#",
  },
  {
    name: "Team",
    price: "$29.99",
    period: "/month",
    tier: "TEAM",
    features: [
      { text: "Everything in Pro", off: false },
      { text: "5 team seats included", off: false },
      { text: "Shared asset library", off: false },
      { text: "200 AI generations / month", off: false },
      { text: "API access", off: false },
      { text: "Priority support + Slack", off: false },
    ],
    cta: "Get Team",
    ctaType: "ghost" as const,
    href: "#",
  },
];

export function Pricing() {
  const { data: session } = useSession();
  const userTier = (session?.user as Record<string, unknown>)?.tier as string ?? "FREE";

  const handleCheckout = async (tier: string) => {
    if (!session) { window.location.href = "/auth/signin?callbackUrl=/pricing"; return; }
    const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const btnBaseStyle = {
    width: "100%", height: "30px", padding: "0 14px", fontSize: "11px",
    fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em",
    borderRadius: "2px", transition: "all 0.12s", cursor: "pointer" as const,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <section id="pricing" style={{ padding: "72px 24px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "var(--container)", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px", borderLeft: "2px solid var(--cyan)", paddingLeft: "14px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, lineHeight: 1, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Pricing</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>No signup required for free tier.</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => {
            const isCurrent = userTier === tier.tier;
            return (
              <div key={tier.name} style={{ border: "1px solid", borderColor: tier.featured ? "var(--text)" : "var(--border)", background: "var(--bg-panel)" }}>
                <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", background: tier.featured ? "var(--bg-elevated)" : undefined }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", textTransform: "uppercase", color: tier.featured ? "var(--cyan)" : "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "6px" }}>{tier.name}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "#fff" }}>
                    {tier.price}<span style={{ fontSize: "12px", fontWeight: 400, color: "var(--text-muted)" }}>{tier.period}</span>
                  </div>
                </div>
                <div style={{ padding: "20px" }}>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    {tier.features.map((f) => (
                      <li key={f.text} style={{ fontSize: "12px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "8px", opacity: f.off ? 0.35 : 1, textDecoration: f.off ? "line-through" : "none" }}>
                        <span style={{ width: "3px", height: "3px", background: f.off ? "var(--text-muted)" : "var(--cyan)", flexShrink: 0 }} />
                        {f.text}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div style={{ ...btnBaseStyle, background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Current Plan</div>
                  ) : tier.tier === "FREE" ? (
                    <Link href={tier.href} style={{ ...btnBaseStyle, background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border)" }}>{tier.cta}</Link>
                  ) : (
                    <button onClick={() => handleCheckout(tier.tier)} style={{ ...btnBaseStyle, ...(tier.ctaType === "primary" ? { background: "var(--text)", color: "#000", border: "1px solid var(--text)" } : { background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border)" }) }}>
                      {tier.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
