const steps = [
  {
    num: "01",
    title: "Upload or Generate",
    description: "Drag-and-drop your sprite images or describe what you need — AI generates style-consistent frames instantly.",
    color: "#F59E0B",
  },
  {
    num: "02",
    title: "Pack & Preview",
    description: "MaxRects algorithm packs sprites with near-zero waste. Trim transparency, adjust padding, preview animations.",
    color: "#06B6D4",
  },
  {
    num: "03",
    title: "Export",
    description: "One-click export to PixiJS, Phaser, Unity, Godot, or CSS. Copy engine code snippets directly into your project.",
    color: "#22C55E",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            How It Works
          </h2>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            From raw sprites to game-ready atlas in three steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="relative p-6 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E]">
              <div
                className="font-[family-name:var(--font-mono)] text-4xl font-bold mb-4 opacity-20"
                style={{ color: s.color }}
              >
                {s.num}
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
