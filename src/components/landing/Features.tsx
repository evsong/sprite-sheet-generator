const features = [
  {
    title: "AI Sprite Generation",
    description: "Describe your character, get style-consistent sprite frames. Walk cycles, attacks, idles — generated in seconds.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    accent: "border-[#F59E0B]/20 hover:border-[#F59E0B]/50",
    tag: "AI",
    tagColor: "text-[#F59E0B] bg-[#F59E0B]/10",
  },
  {
    title: "Smart Packing",
    description: "MaxRects bin packing algorithm — same as TexturePacker. Transparent trimming, POT alignment, rotation support.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    accent: "border-[#06B6D4]/20 hover:border-[#06B6D4]/50",
    tag: "CORE",
    tagColor: "text-[#06B6D4] bg-[#06B6D4]/10",
  },
  {
    title: "Animation Workflow",
    description: "Frame timeline, playback preview, FPS control, onion skin overlay. Drag to reorder, loop or ping-pong.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    accent: "border-[#22C55E]/20 hover:border-[#22C55E]/50",
    tag: "ANIM",
    tagColor: "text-[#22C55E] bg-[#22C55E]/10",
  },
  {
    title: "Engine Integration",
    description: "Export to PixiJS, Phaser 3, Unity, Godot, CSS. Copy-paste code snippets ready for your game engine.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    accent: "border-[#A78BFA]/20 hover:border-[#A78BFA]/50",
    tag: "EXPORT",
    tagColor: "text-[#A78BFA] bg-[#A78BFA]/10",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Everything You Need
          </h2>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            Professional sprite sheet tools — free, in your browser, no install.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group p-6 rounded-xl bg-[#0D0D0D] border ${f.accent} transition-all duration-200 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-[#1A1A1A]">{f.icon}</div>
                <span className={`text-[10px] font-[family-name:var(--font-mono)] font-semibold px-2 py-0.5 rounded ${f.tagColor}`}>
                  {f.tag}
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
