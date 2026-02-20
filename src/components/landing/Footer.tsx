export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "48px 24px 28px", background: "var(--bg-panel)" }}>
      <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8" style={{ maxWidth: "var(--container)", margin: "0 auto" }}>
        <div className="col-span-2 md:col-span-1">
          <div style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", color: "#fff", marginBottom: "6px", textTransform: "uppercase" }}>SPRITEFORGE</div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>Production-grade sprite sheet tooling for game developers. Pack, preview, export — all in your browser.</p>
        </div>
        {[
          { title: "Product", links: ["Editor", "Features", "Pricing", "Changelog"] },
          { title: "Resources", links: ["Documentation", "API Reference", "Export Formats", "Blog"] },
          { title: "Company", links: ["About", "GitHub", "Twitter", "Contact"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>{col.title}</h4>
            {col.links.map((link) => (
              <a key={link} href="#" className="block transition-colors duration-100 hover:text-[var(--text)]" style={{ fontSize: "11px", color: "var(--text-dim)", padding: "2px 0" }}>{link}</a>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between" style={{ maxWidth: "var(--container)", margin: "20px auto 0", paddingTop: "16px", borderTop: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>
        <span>&copy; 2026 SpriteForge. All rights reserved.</span>
        <span>v1.0.0-beta</span>
      </div>
    </footer>
  );
}
