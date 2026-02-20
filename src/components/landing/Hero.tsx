import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="px-6 pb-16" style={{ paddingTop: "calc(var(--nav-h) + 32px)" }}>
      <div
        className="flex flex-col md:grid md:grid-cols-[1.1fr_1fr] items-center gap-10 md:gap-14"
        style={{ maxWidth: "var(--container)", margin: "0 auto" }}
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
            className="text-[28px] md:text-[44px]"
            style={{
              fontFamily: "var(--font-display)",
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
        <div className="w-full" style={{ border: "1px solid var(--border)", background: "#000" }}>
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
              { l: 0, t: 0, w: 84, h: 84, src: "/examples/knight.png" },
              { l: 85, t: 0, w: 84, h: 84, src: "/examples/mage.png" },
              { l: 170, t: 0, w: 64, h: 64, src: "/examples/sword.png" },
              { l: 235, t: 0, w: 32, h: 32, src: "/examples/potion.png" },
              { l: 235, t: 33, w: 32, h: 32, src: "/examples/treasure.png" },
              { l: 0, t: 85, w: 84, h: 84, src: "/examples/skeleton.png" },
              { l: 85, t: 85, w: 84, h: 84, src: "/examples/dragon.png" },
              { l: 170, t: 65, w: 64, h: 64, src: "/examples/slime.png" },
              { l: 170, t: 130, w: 48, h: 48, src: "/examples/fairy.png" },
              { l: 235, t: 66, w: 32, h: 32, src: "/examples/mushroom.png" },
            ].map((c, i) => (
              <div
                key={i}
                className="absolute overflow-hidden"
                style={{
                  left: c.l, top: c.t, width: c.w, height: c.h,
                  border: "1px solid rgba(6,182,212,0.2)",
                  background: "rgba(6,182,212,0.06)",
                }}
              >
                <Image src={c.src} alt="" width={c.w} height={c.h} style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
              </div>
            ))}

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
