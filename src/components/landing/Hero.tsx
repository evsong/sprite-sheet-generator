import React from "react";
import Link from "next/link";

export function Hero() {
  return (
    <section style={{ padding: "88px 24px 64px", paddingTop: "calc(var(--nav-h) + 88px)" }}>
      <div
        className="items-center"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: "56px",
        }}
      >
        {/* Left: Text */}
        <div>
          <div
            className="inline-flex items-center gap-1.5"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--cyan)",
              border: "1px solid rgba(6,182,212,0.25)",
              padding: "3px 10px",
              marginBottom: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <span
              className="rounded-full"
              style={{
                width: "5px",
                height: "5px",
                background: "var(--cyan)",
                animation: "pulse 2s infinite",
              }}
            />
            v1.0 Public Beta
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "44px",
              fontWeight: 700,
              lineHeight: 0.95,
              marginBottom: "20px",
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            Production Ready
            <br />
            <span style={{ color: "var(--text-muted)" }}>Sprite Sheets</span>
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "var(--text-dim)",
              lineHeight: 1.6,
              marginBottom: "28px",
              maxWidth: "440px",
            }}
          >
            The industrial-grade packing tool for game developers. MaxRects
            algorithm, 15+ engine formats, zero server uploads. All in your
            browser.
          </p>

          <div className="flex gap-2.5">
            <Link
              href="/editor"
              className="inline-flex items-center hover:bg-white cursor-pointer"
              style={{
                height: "36px",
                padding: "0 20px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderRadius: "2px",
                background: "var(--text)",
                color: "#000",
                border: "1px solid var(--text)",
                transition: "all 0.12s",
              }}
            >
              Start Forging
            </Link>
            <a
              href="#"
              className="inline-flex items-center cursor-pointer"
              style={{
                height: "36px",
                padding: "0 20px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderRadius: "2px",
                border: "1px solid var(--border)",
                color: "var(--text-dim)",
                transition: "all 0.12s",
              }}
            >
              Documentation
            </a>
          </div>

          <div
            className="flex gap-8"
            style={{
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border)",
            }}
          >
            {[
              { val: "0ms", label: "Latency" },
              { val: "100%", label: "Client-side" },
              { val: "15+", label: "Formats" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-0.5"
                style={{ fontSize: "11px", color: "var(--text-muted)" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "var(--cyan)",
                  }}
                >
                  {s.val}
                </span>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sprite Preview with Rulers */}
        <div style={{ border: "1px solid var(--border)", background: "#000" }}>
          {/* Ruler X */}
          <div
            className="flex overflow-hidden"
            style={{
              height: "14px",
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-surface)",
              paddingLeft: "14px",
            }}
          >
            {["0", "64", "128", "192", "256", "320", "384", "448", "512"].map(
              (t) => (
                <div
                  key={t}
                  className="flex items-center shrink-0"
                  style={{
                    width: "40px",
                    height: "100%",
                    borderRight: "1px solid rgba(255,255,255,0.08)",
                    paddingLeft: "2px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "7px",
                    color: "var(--text-muted)",
                  }}
                >
                  {t}
                </div>
              )
            )}
          </div>

          <div className="relative" style={{ marginLeft: "14px", height: "240px" }}>
            {/* Ruler Y */}
            <div
              className="absolute flex flex-col overflow-hidden"
              style={{
                width: "14px",
                borderRight: "1px solid var(--border)",
                background: "var(--bg-surface)",
                top: 0,
                bottom: 0,
                left: "-14px",
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="shrink-0"
                  style={{
                    height: "40px",
                    width: "100%",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>

            {/* Packed sprite cells */}
            {[
              { l: 0, t: 0, w: 84, h: 96, bg: "rgba(6,182,212,0.14)", icon: "warrior" },
              { l: 85, t: 0, w: 64, h: 72, bg: "rgba(8,145,178,0.11)", icon: "char" },
              { l: 150, t: 0, w: 64, h: 72, bg: "rgba(14,116,144,0.11)", icon: "char" },
              { l: 215, t: 0, w: 28, h: 38, bg: "rgba(245,158,11,0.10)", icon: "sword" },
              { l: 244, t: 0, w: 24, h: 24, bg: "rgba(245,158,11,0.08)", icon: "coin" },
              { l: 215, t: 39, w: 28, h: 32, bg: "rgba(34,197,94,0.10)", icon: "potion" },
              { l: 244, t: 25, w: 24, h: 24, bg: "rgba(6,182,212,0.08)", icon: "diamond" },
              { l: 85, t: 73, w: 68, h: 78, bg: "rgba(14,116,144,0.13)", icon: "char" },
              { l: 154, t: 73, w: 64, h: 72, bg: "rgba(6,182,212,0.11)", icon: "char" },
              { l: 219, t: 72, w: 26, h: 26, bg: "rgba(8,145,178,0.08)", icon: "shield" },
              { l: 246, t: 50, w: 22, h: 22, bg: "rgba(239,68,68,0.10)", icon: "heart" },
              { l: 219, t: 99, w: 24, h: 28, bg: "rgba(245,158,11,0.08)", icon: "key" },
              { l: 0, t: 97, w: 64, h: 72, bg: "rgba(8,145,178,0.11)", icon: "char" },
              { l: 65, t: 152, w: 64, h: 68, bg: "rgba(6,182,212,0.11)", icon: "char" },
              { l: 130, t: 146, w: 64, h: 72, bg: "rgba(14,116,144,0.11)", icon: "char" },
            ].map((c, i) => {
              const icons: Record<string, React.ReactNode> = {
                warrior: (<svg viewBox="0 0 32 32" className="opacity-80" style={{ width: "75%", height: "75%" }}>
                  <rect x="13" y="3" width="7" height="6" rx="1" fill="#22D3EE" />
                  <rect x="11" y="10" width="10" height="8" fill="#06B6D4" />
                  <rect x="11" y="18" width="4" height="8" fill="#0891B2" />
                  <rect x="17" y="18" width="4" height="8" fill="#0891B2" />
                  <rect x="22" y="6" width="3" height="14" fill="#F59E0B" />
                  <rect x="21" y="4" width="5" height="3" fill="#FBBF24" />
                </svg>),
                char: (<svg viewBox="0 0 32 32" className="opacity-80" style={{ width: "75%", height: "75%" }}>
                  <rect x="13" y="3" width="7" height="6" rx="1" fill="#22D3EE" />
                  <rect x="11" y="10" width="10" height="8" fill="#06B6D4" />
                  <rect x="11" y="18" width="4" height="8" fill="#0891B2" />
                  <rect x="17" y="18" width="4" height="8" fill="#0891B2" />
                </svg>),
                sword: (<svg viewBox="0 0 32 32" className="opacity-80" style={{ width: "65%", height: "65%" }}>
                  <rect x="15" y="2" width="3" height="18" fill="#F59E0B" />
                  <rect x="11" y="20" width="11" height="3" fill="#FBBF24" />
                  <rect x="14" y="23" width="5" height="5" fill="#D97706" />
                </svg>),
                coin: (<svg viewBox="0 0 32 32" className="opacity-80" style={{ width: "65%", height: "65%" }}>
                  <circle cx="16" cy="16" r="10" fill="#F59E0B" />
                  <circle cx="16" cy="16" r="6" fill="#FBBF24" />
                </svg>),
                potion: (<svg viewBox="0 0 32 32" className="opacity-80" style={{ width: "65%", height: "65%" }}>
                  <rect x="13" y="2" width="7" height="4" fill="#86EFAC" />
                  <rect x="11" y="6" width="11" height="3" fill="#4ADE80" />
                  <rect x="9" y="9" width="15" height="16" rx="2" fill="#22C55E" />
                  <rect x="13" y="12" width="3" height="8" fill="#86EFAC" opacity="0.5" />
                </svg>),
                diamond: (<svg viewBox="0 0 32 32" className="opacity-80" style={{ width: "65%", height: "65%" }}>
                  <polygon points="16,3 27,14 16,29 5,14" fill="#22D3EE" />
                  <polygon points="16,3 21,14 16,25 11,14" fill="#67E8F9" opacity="0.6" />
                </svg>),
                shield: (<svg viewBox="0 0 32 32" className="opacity-80" style={{ width: "65%", height: "65%" }}>
                  <path d="M16 3 L26 8 L26 18 Q26 26 16 30 Q6 26 6 18 L6 8 Z" fill="#0891B2" />
                  <path d="M16 7 L22 10 L22 17 Q22 23 16 26 Q10 23 10 17 L10 10 Z" fill="#22D3EE" opacity="0.4" />
                </svg>),
                heart: (<svg viewBox="0 0 32 32" className="opacity-80" style={{ width: "65%", height: "65%" }}>
                  <path d="M16 28 Q4 18 4 10 Q4 4 10 4 Q14 4 16 8 Q18 4 22 4 Q28 4 28 10 Q28 18 16 28Z" fill="#EF4444" />
                  <path d="M16 24 Q8 16 8 11 Q8 7 12 7 Q14 7 16 10" fill="#FCA5A5" opacity="0.4" />
                </svg>),
                key: (<svg viewBox="0 0 32 32" className="opacity-80" style={{ width: "65%", height: "65%" }}>
                  <circle cx="16" cy="10" r="6" fill="#F59E0B" />
                  <circle cx="16" cy="10" r="3" fill="#D97706" />
                  <rect x="14" y="15" width="4" height="14" fill="#FBBF24" />
                  <rect x="18" y="22" width="4" height="3" fill="#FBBF24" />
                  <rect x="18" y="26" width="3" height="3" fill="#FBBF24" />
                </svg>),
              };
              return (
                <div
                  key={i}
                  className="absolute flex items-center justify-center overflow-hidden"
                  style={{
                    left: c.l,
                    top: c.t,
                    width: c.w,
                    height: c.h,
                    background: c.bg,
                    border: "1px solid rgba(6,182,212,0.2)",
                    transition: "all 0.12s",
                  }}
                >
                  {icons[c.icon]}
                </div>
              );
            })}

            {/* Waste areas */}
            <div
              className="absolute"
              style={{ left: 0, top: 170, width: 64, height: 50, border: "1px dashed rgba(255,255,255,0.04)" }}
            />
            <div
              className="absolute"
              style={{ left: 195, top: 128, width: 48, height: 38, border: "1px dashed rgba(255,255,255,0.04)" }}
            />

            {/* Meta bar */}
            <div
              className="absolute bottom-0 right-0 flex gap-2"
              style={{
                background: "var(--bg-surface)",
                borderTop: "1px solid var(--border)",
                borderLeft: "1px solid var(--border)",
                padding: "3px 8px",
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--cyan)",
              }}
            >
              512×512 · RGBA8888 · POT · <span style={{ color: "#22C55E" }}>94.2% packed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
