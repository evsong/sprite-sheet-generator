import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#A0A0A0 1px, transparent 1px), linear-gradient(90deg, #A0A0A0 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full border border-[#1E1E1E] bg-[#0D0D0D] text-xs font-[family-name:var(--font-mono)] text-[#06B6D4]">
          AI-Powered &middot; Browser-Based &middot; Free
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          Generate & Pack{" "}
          <span className="text-[#06B6D4]">Sprite Sheets</span>
          <br />
          in Seconds
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-[#A0A0A0] mb-10 leading-relaxed">
          AI sprite generation, MaxRects bin packing, transparent trimming, and
          one-click export to Phaser, PixiJS, Unity, Godot, and more — all in
          your browser.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/editor"
            className="px-8 py-3.5 text-base font-semibold text-black bg-[#22C55E] rounded-lg hover:brightness-110 transition-all duration-200 cursor-pointer"
          >
            Start Free
          </Link>
          <a
            href="#pricing"
            className="px-8 py-3.5 text-base font-semibold text-white border border-[#1E1E1E] rounded-lg hover:border-[#06B6D4] hover:text-[#06B6D4] transition-all duration-200 cursor-pointer"
          >
            View Pricing
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "6+", label: "Export Formats" },
            { value: "∞", label: "Sprites Packed" },
            { value: "4", label: "Game Engines" },
            { value: "0", label: "Install Required" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-[#06B6D4]">
                {stat.value}
              </div>
              <div className="text-xs text-[#666666] mt-1 font-[family-name:var(--font-mono)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
