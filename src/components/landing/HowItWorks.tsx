export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "72px 24px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "var(--container)", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px", borderLeft: "2px solid var(--cyan)", paddingLeft: "14px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, lineHeight: 1, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Workflow</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>Three steps. Zero friction.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
          {[
            { num: "Step 01 — Input", title: "Drop or Generate", desc: "Drag individual sprite frames into the workspace, or describe a character and let AI generate consistent animation frames for you." },
            { num: "Step 02 — Pack", title: "Auto-Arrange", desc: "MaxRects algorithm packs frames into the tightest possible sheet. Transparent pixels are trimmed, rotations optimized, power-of-two enforced." },
            { num: "Step 03 — Export", title: "Ship It", desc: "Download the sprite sheet PNG plus engine-specific data files. Copy the loader snippet directly into your Phaser, Unity, or Godot project." },
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
