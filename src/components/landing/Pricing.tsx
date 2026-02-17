import Link from "next/link";

const tiers = [
  {
    name: "FREE",
    price: "$0",
    period: "forever",
    cta: "Start Free",
    ctaStyle: "border border-[#1E1E1E] text-white hover:border-[#06B6D4] hover:text-[#06B6D4]",
    features: [
      { text: "MaxRects bin packing", included: true },
      { text: "Transparent trimming", included: true },
      { text: "2 export formats (JSON, CSS)", included: true },
      { text: "3 AI generations / day", included: true },
      { text: "Up to 20 sprites", included: true },
      { text: "Basic animation preview", included: true },
      { text: "All export formats", included: false },
      { text: "Engine code snippets", included: false },
      { text: "Cloud project save", included: false },
      { text: "No watermark", included: false },
    ],
  },
  {
    name: "PRO",
    price: "$9.99",
    period: "/month",
    cta: "Upgrade to PRO",
    ctaStyle: "bg-[#22C55E] text-black hover:brightness-110",
    highlight: true,
    features: [
      { text: "MaxRects bin packing", included: true },
      { text: "Transparent trimming", included: true },
      { text: "All 6+ export formats", included: true },
      { text: "50 AI generations / day", included: true },
      { text: "Up to 200 sprites", included: true },
      { text: "Advanced animation + onion skin", included: true },
      { text: "Engine code snippets", included: true },
      { text: "Cloud project save", included: true },
      { text: "No watermark", included: true },
      { text: "Priority support", included: true },
    ],
  },
  {
    name: "TEAM",
    price: "$29.99",
    period: "/month",
    cta: "Start Team Plan",
    ctaStyle: "border border-[#1E1E1E] text-white hover:border-[#06B6D4] hover:text-[#06B6D4]",
    features: [
      { text: "Everything in PRO", included: true },
      { text: "Unlimited AI generations", included: true },
      { text: "Unlimited sprites", included: true },
      { text: "Team project sharing", included: true },
      { text: "Shared asset library", included: true },
      { text: "Admin dashboard", included: true },
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Simple Pricing
          </h2>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-6 rounded-xl bg-[#0D0D0D] border transition-all duration-200 ${
                tier.highlight
                  ? "border-[#22C55E]/50 shadow-[0_0_30px_rgba(34,197,94,0.08)]"
                  : "border-[#1E1E1E]"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#22C55E] text-black text-[10px] font-[family-name:var(--font-mono)] font-bold">
                  POPULAR
                </div>
              )}

              <div className="mb-6">
                <div className="font-[family-name:var(--font-mono)] text-xs text-[#666666] mb-1">
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-3xl font-bold">
                    {tier.price}
                  </span>
                  <span className="text-sm text-[#666666]">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-8">
                {tier.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-sm">
                    {f.included ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                        <path d="M3 8l3 3 7-7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                        <path d="M4 8h8" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className={f.included ? "text-[#A0A0A0]" : "text-[#444]"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.name === "FREE" ? "/editor" : "#"}
                className={`block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${tier.ctaStyle}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
