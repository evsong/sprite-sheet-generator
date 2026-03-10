import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";

export const metadata = {
  title: "Documentation — SpriteForge",
  description: "Feature documentation for SpriteForge: AI sprite generation, smart packing, engine sync, export formats, and more.",
};

const h2 = { fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "#fff", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginTop: "48px", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" };
const h3 = { fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "var(--text)", textTransform: "uppercase" as const, letterSpacing: "0.03em", marginTop: "24px", marginBottom: "8px" };
const p = { fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.8, marginBottom: "12px" };
const code = { fontFamily: "var(--font-mono)", fontSize: "11px", background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "1px 5px", color: "var(--cyan)" };
const ul = { fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.8, marginBottom: "12px", paddingLeft: "20px" };

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 120px)", paddingTop: "calc(var(--nav-h) + 40px)", background: "var(--bg)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 80px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
            Documentation
          </h1>
          <p style={{ ...p, marginBottom: "32px" }}>
            Everything you need to use SpriteForge effectively. For source code and contributions, visit the{" "}
            <a href="https://github.com/evsong/sprite-sheet-generator" target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan)", textDecoration: "underline", textUnderlineOffset: "2px" }}>GitHub repository</a>.
          </p>

          {/* Getting Started */}
          <h2 style={h2}>Getting Started</h2>
          <p style={p}>
            SpriteForge is a browser-based sprite sheet generator. No installation required. Open the{" "}
            <Link href="/editor" style={{ color: "var(--cyan)" }}>Editor</Link>, drag your sprite images onto the canvas, and export a packed sprite sheet in your preferred engine format.
          </p>
          <h3 style={h3}>Quick Start</h3>
          <ol style={ul}>
            <li>Open the Editor and drag PNG files onto the workspace</li>
            <li>The MaxRects packing algorithm automatically arranges your sprites</li>
            <li>Choose an export format from the Settings panel (right sidebar)</li>
            <li>Click &ldquo;Download .zip&rdquo; to get your sprite sheet + data file</li>
          </ol>

          {/* AI Generation */}
          <h2 style={h2}>AI Sprite Generation</h2>
          <p style={p}>
            SpriteForge uses Google Gemini to generate sprites from text descriptions. Two generation modes are available:
          </p>
          <h3 style={h3}>Sequence Mode</h3>
          <p style={p}>
            Generates a series of animation frames for a single character. Ideal for walk cycles, attack animations, idle poses, and other sequential sprite animations. Describe your character and the desired animation, and the AI will produce consistent frames.
          </p>
          <h3 style={h3}>Atlas Mode</h3>
          <p style={p}>
            Generates a collection of distinct items on a single sheet. Perfect for inventory icons, UI elements, environment tiles, or any set of related but unique sprites. Describe the theme and the AI will create varied items in a consistent art style.
          </p>
          <h3 style={h3}>AI Transform</h3>
          <p style={p}>
            You can also transform existing sprites with AI: generate <span style={code}>variants</span> (different poses), <span style={code}>recolor</span> (new palettes), <span style={code}>upscale</span> (higher resolution), or <span style={code}>extend-frames</span> (additional animation frames).
          </p>
          <h3 style={h3}>Quotas</h3>
          <p style={p}>
            Free accounts get 1 AI generation per day. Pro accounts get 10 per day. Team accounts get 500 per day.
          </p>

          {/* Packing */}
          <h2 style={h2}>Smart Packing</h2>
          <p style={p}>
            SpriteForge uses the MaxRects bin packing algorithm with multiple heuristics (Best Short Side, Bottom Left, Best Area Fit). Packing options include:
          </p>
          <ul style={ul}>
            <li><strong>Sheet Size:</strong> 512x512, 1024x1024, 2048x2048, or Auto</li>
            <li><strong>Padding:</strong> 0px, 1px, 2px, or 4px between sprites</li>
            <li><strong>Power of Two:</strong> Force dimensions to be powers of two (GPU-friendly)</li>
            <li><strong>Allow Rotation:</strong> Rotate sprites 90 degrees for tighter packing</li>
            <li><strong>Trim Alpha:</strong> Remove transparent pixels around each sprite</li>
            <li><strong>Max Pages:</strong> Limit the number of sprite sheet pages</li>
          </ul>

          {/* Export Formats */}
          <h2 style={h2}>Export Formats</h2>
          <p style={p}>
            SpriteForge supports 15+ export formats with engine-specific data files:
          </p>
          <ul style={ul}>
            <li><strong>JSON:</strong> Generic Array, JSON Hash</li>
            <li><strong>PixiJS:</strong> JSON Hash format</li>
            <li><strong>Phaser 3:</strong> Multi-texture atlas format</li>
            <li><strong>Unity:</strong> .tpsheet format with pivot points</li>
            <li><strong>Godot:</strong> Atlas (.tres), Tileset</li>
            <li><strong>Spine:</strong> Atlas text format</li>
            <li><strong>Cocos2d:</strong> Property list format</li>
            <li><strong>Starling / XML:</strong> XML-based formats</li>
            <li><strong>Unreal:</strong> Paper2D format</li>
            <li><strong>CSS:</strong> CSS sprite classes</li>
            <li><strong>UIKit:</strong> iOS plist format</li>
            <li><strong>Egret2D:</strong> JSON format</li>
          </ul>
          <p style={p}>
            Free tier includes JSON Array, JSON Hash, and CSS. Pro and Team tiers unlock all formats.
          </p>

          {/* Engine Sync */}
          <h2 style={h2}>Engine Sync</h2>
          <p style={p}>
            Pro and Team users can enable real-time WebSocket sync to push atlas updates directly to Godot or Unity. When enabled, SpriteForge starts a WebSocket connection on a configurable port (default: 6789). Your game engine connects to receive sprite sheet updates automatically whenever you re-pack or export.
          </p>
          <p style={p}>
            Note: if you&apos;re accessing SpriteForge over HTTPS, mixed-content restrictions may block <span style={code}>ws://</span> connections to localhost. Use HTTP for local sync workflows.
          </p>

          {/* Normal Maps */}
          <h2 style={h2}>Normal Maps</h2>
          <p style={p}>
            SpriteForge can generate or pair normal maps for your sprite sheets. Two approaches are supported:
          </p>
          <ul style={ul}>
            <li><strong>Manual pairing:</strong> Name your normal map files with a <span style={code}>_n</span>, <span style={code}>_normal</span>, or <span style={code}>_nrm</span> suffix and they will be automatically paired with the matching sprite.</li>
            <li><strong>Auto-generation:</strong> Enable the Sobel-based normal map generator in the Settings panel. Adjust the strength parameter (0.5 to 5.0) to control the intensity of the generated normals.</li>
          </ul>
          <p style={p}>Normal maps are a Pro/Team feature.</p>

          {/* Compression */}
          <h2 style={h2}>Compression</h2>
          <p style={p}>
            Export your sprite sheets in multiple image formats:
          </p>
          <ul style={ul}>
            <li><strong>PNG:</strong> Lossless, full quality (available on all tiers)</li>
            <li><strong>WebP:</strong> Lossy or lossless, typically 25-35% smaller (Pro/Team)</li>
            <li><strong>AVIF:</strong> Next-gen lossy, even smaller files (Pro/Team)</li>
          </ul>
          <p style={p}>
            Additional options include RGBA4444 color depth reduction with optional dithering, for mobile-optimized assets.
          </p>

          {/* Keyboard Shortcuts */}
          <h2 style={h2}>Keyboard Shortcuts</h2>
          <p style={p}>
            All shortcuts use <span style={code}>Cmd</span> on macOS and <span style={code}>Ctrl</span> on Windows/Linux.
          </p>

          <h3 style={h3}>General</h3>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              <span>Undo</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + Z</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              <span>Redo</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + Shift + Z</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              <span>Deselect / Close modal</span><span style={{ color: "var(--text-muted)" }}>Escape</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
              <span>Export / Download .zip</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + E</span>
            </div>
          </div>

          <h3 style={h3}>Sprites</h3>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              <span>Delete selected sprite</span><span style={{ color: "var(--text-muted)" }}>Delete / Backspace</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              <span>Duplicate selected sprite</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + D</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              <span>Add all sprites to animation</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + A</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
              <span>Add selected sprite to animation</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + Shift + A</span>
            </div>
          </div>

          <h3 style={h3}>Animation</h3>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              <span>Play / Pause animation</span><span style={{ color: "var(--text-muted)" }}>Space</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
              <span>Toggle onion skin</span><span style={{ color: "var(--text-muted)" }}>O</span>
            </div>
          </div>

          <h3 style={h3}>View</h3>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              <span>Zoom in</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + =</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "2px 0" }}>
              <span>Zoom out</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + -</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
              <span>Reset zoom to 100%</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + 0</span>
            </div>
          </div>

          <h3 style={h3}>Engine Sync</h3>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
              <span>Manual push to engine</span><span style={{ color: "var(--text-muted)" }}>Cmd/Ctrl + Shift + S</span>
            </div>
          </div>

          {/* Support */}
          <h2 style={h2}>Support</h2>
          <p style={p}>
            For bug reports and feature requests, please open an issue on{" "}
            <a href="https://github.com/evsong/sprite-sheet-generator/issues" target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan)", textDecoration: "underline", textUnderlineOffset: "2px" }}>GitHub</a>.
            For account and billing questions, contact{" "}
            <a href="mailto:support@spriteforge.online" style={{ color: "var(--cyan)", textDecoration: "underline", textUnderlineOffset: "2px" }}>support@spriteforge.online</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
