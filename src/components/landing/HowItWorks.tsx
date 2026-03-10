export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "72px 24px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "var(--container)", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px", borderLeft: "2px solid var(--cyan)", paddingLeft: "14px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, lineHeight: 1, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Workflow</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>Three steps. Zero friction.</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "var(--border)", border: "1px solid var(--border)" }}>
          {[
            { num: "Step 01 — Input", title: "Drop or Generate", desc: "Drag sprite frames into the workspace, or use AI to generate animation sequences and icon atlases from a text prompt." },
            { num: "Step 02 — Pack", title: "Auto-Arrange", desc: "MaxRects algorithm packs frames into the tightest possible sheet. Trimming, rotation, power-of-two, normal maps, and compression — all automatic." },
            { num: "Step 03 — Export", title: "Ship It", desc: "Download sprite sheets in 15+ engine formats. Sync directly to Godot or Unity via WebSocket, or copy the loader snippet into your project." },
          ].map((s) => (
            <div key={s.num} style={{ background: "var(--bg-panel)", padding: "24px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--cyan)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.num}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, marginBottom: "6px", color: "#fff", textTransform: "uppercase", letterSpacing: "0.03em" }}>{s.title}</h3>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
