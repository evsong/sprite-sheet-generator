export function Features() {
  const cardStyle = {
    background: "var(--bg-panel)",
    padding: "24px",
    position: "relative" as const,
    transition: "background 0.15s",
  };
  const numStyle = {
    fontFamily: "var(--font-display)",
    fontSize: "28px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.04)",
    position: "absolute" as const,
    top: "12px",
    right: "16px",
    lineHeight: 1,
  };
  const h3Style = {
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "6px",
    color: "#fff",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  };
  const pStyle = {
    fontSize: "12px",
    color: "var(--text-dim)",
    lineHeight: 1.55,
    maxWidth: "320px",
  };
  const miniStyle = {
    marginTop: "16px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    padding: "8px",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
  };
  const rowStyle = { color: "var(--text-muted)", marginBottom: "4px" };

  return (
    <section id="features" style={{ padding: "72px 24px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "var(--container)", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px", borderLeft: "2px solid var(--cyan)", paddingLeft: "14px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, lineHeight: 1, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Core Modules</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>Essential tools for the modern asset pipeline.</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "var(--border)", border: "1px solid var(--border)" }}>
          <div className="md:col-span-2" style={cardStyle}>
            <span style={numStyle}>01</span>
            <h3 style={h3Style}>Smart Packing</h3>
            <p style={pStyle}>MaxRects bin packing with heuristic selection. Auto-rotation, transparent trimming, and power-of-two alignment for GPU-friendly sheets.</p>
            <div style={miniStyle}>
              <div className="flex justify-between" style={rowStyle}><span>Density</span><span style={{ color: "var(--cyan)" }}>94%</span></div>
              <div style={{ height: "3px", background: "var(--bg-elevated)", width: "100%", margin: "6px 0" }}><div style={{ height: "100%", background: "var(--cyan)", width: "94%" }} /></div>
              <div className="flex justify-between" style={rowStyle}><span>Waste</span><span>6%</span></div>
              <div className="flex justify-between" style={{ color: "var(--text-muted)" }}><span>Algorithm</span><span>MaxRects BSS</span></div>
            </div>
          </div>
          <div style={cardStyle}>
            <span style={numStyle}>02</span>
            <h3 style={h3Style}>AI Generation</h3>
            <p style={pStyle}>Describe a character, get consistent sprite frames. Walk cycles, attacks, idles — generated and packed automatically.</p>
            <div style={miniStyle}>
              <div className="flex justify-between" style={rowStyle}><span>Prompt</span><span>Pixel Knight</span></div>
              <div className="flex justify-between" style={rowStyle}><span>Frames</span><span>8</span></div>
              <div className="flex justify-between" style={{ color: "var(--text-muted)" }}><span>Status</span><span style={{ color: "var(--cyan)" }}>READY</span></div>
            </div>
          </div>
          <div style={cardStyle}>
            <span style={numStyle}>03</span>
            <h3 style={h3Style}>Animation Preview</h3>
            <p style={pStyle}>Real-time playback with adjustable FPS, onion skin overlay, and drag-to-reorder frame sequencing.</p>
          </div>
          <div style={cardStyle}>
            <span style={numStyle}>04</span>
            <h3 style={h3Style}>Multi-Export</h3>
            <p style={pStyle}>PixiJS, Phaser 3, Unity, Godot, CSS, XML — 15+ formats with engine-specific data files.</p>
            <div style={miniStyle}>
              <div className="flex justify-between" style={rowStyle}><span>Unity</span><span>.json</span></div>
              <div className="flex justify-between" style={rowStyle}><span>Godot</span><span>.tres</span></div>
              <div className="flex justify-between" style={{ color: "var(--text-muted)" }}><span>Phaser</span><span>.json</span></div>
            </div>
          </div>
          <div className="md:col-span-2" style={cardStyle}>
            <span style={numStyle}>05</span>
            <h3 style={h3Style}>Engine Code Snippets</h3>
            <p style={pStyle}>One-click copy of loader code for your engine. Paste directly into your project — no manual wiring.</p>
            <div style={miniStyle} dangerouslySetInnerHTML={{ __html: `<span class="ck">this</span>.load.<span class="cf">atlas</span>(<span class="cs">'hero'</span>, <span class="cs">'hero.png'</span>, <span class="cs">'hero.json'</span>);\n<span class="ck">this</span>.anims.<span class="cf">create</span>({ <span class="cf">key</span>: <span class="cs">'run'</span>, <span class="cf">frameRate</span>: <span class="cn">12</span> });` }} />
          </div>
          <div style={cardStyle}>
            <span style={numStyle}>06</span>
            <h3 style={h3Style}>Zero Install</h3>
            <p style={pStyle}>Runs entirely in your browser. Images never leave your machine. No signup for free tier.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
