# Platform Essentials - Design

## A. Landing Page Copy Update

### Hero Section (`src/components/landing/Hero.tsx`)
- Update subtitle to mention both sequence & atlas modes
- Change stats bar to reflect current capabilities: "2 Modes", "100% Client-side", "15+ Formats"
- Fix "Documentation" button to link to `/docs`

### Features Section (`src/components/landing/Features.tsx`)
- Update feature card descriptions:
  - 01 Smart Packing: add compression options mention
  - 02 AI Generation: mention dual mode (sequence + atlas)
  - 03 Animation Preview: unchanged
  - 04 Multi-Export: add engine sync mention
  - 05 Engine Code Snippets: mention real-time sync with Godot/Unity
  - 06 Zero Install: mention normal maps and compression
- Add additional capability mentions inline (no new cards needed)

### HowItWorks Section (`src/components/landing/HowItWorks.tsx`)
- Update step descriptions to mention atlas mode and engine sync

### Pricing Section (`src/components/landing/Pricing.tsx`)
- Update feature lists to match actual tier boundaries
- FREE: up to 64 sprites, 3 basic formats, 3 AI gens/day, PNG export
- PRO: unlimited sprites, 15+ formats, 50 AI gens/day, all export formats, engine sync, normal maps, compression, code snippets
- TEAM: everything in Pro + team seats + API + priority support

## B. Paid Tier Gating

### Helper Module (`src/lib/tier.ts`)
```ts
export type TierName = "FREE" | "PRO" | "TEAM";
export function isPro(tier: TierName): boolean;
export function getTierFromSession(session): TierName;
export const TIER_LIMITS: Record<TierName, TierLimits>;
```

### UpgradePrompt Component (`src/components/shared/UpgradePrompt.tsx`)
- Non-blocking banner shown when free user hits a gated feature
- Dismissible, links to pricing section
- Matches dark theme with amber accent

### Enforcement Points
- `SettingsPanel.tsx` - already checks isPro for export format + code snippet (keep, refactor to use new helper)
- `route.ts` (AI generate/transform) - already enforces via ai-quota.ts (keep)
- Normal map toggle - show UpgradePrompt for free users
- Engine sync toggle - show UpgradePrompt for free users
- Compression format (WebP/AVIF) - show UpgradePrompt for free users

## C. Terms of Service & Privacy Policy

### Existing Pages
Both `/terms` and `/privacy` already exist with professional content. Enhancements:
- Add AI-generated content ownership clause to ToS
- Add Gemini API third-party service disclosure to Privacy
- Add cookie specifics (session cookie name, duration)
- Minor copy improvements

## D. Documentation Page (`src/app/docs/page.tsx`)
- Simple feature documentation page matching dark theme
- Sections: Getting Started, AI Generation, Packing Options, Export Formats, Engine Sync, Normal Maps, Compression, Keyboard Shortcuts
- Links to GitHub repo for detailed docs

## E. Sentry Integration
- `@sentry/nextjs` SDK
- `sentry.client.config.ts` - client-side error tracking
- `sentry.server.config.ts` - server-side error tracking
- `sentry.edge.config.ts` - edge runtime tracking
- `next.config.ts` - wrap with `withSentryConfig`
- All configs check `NEXT_PUBLIC_SENTRY_DSN` env var; no-op when missing
- `instrumentation.ts` - Next.js instrumentation hook for Sentry

## F. Vercel Analytics
- `@vercel/analytics` package
- `<Analytics />` component in root layout
- Zero-config, privacy-focused, works automatically on Vercel
