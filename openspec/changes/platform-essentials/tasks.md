# Platform Essentials - Tasks

## A. Landing Page Copy Update
- [x] Update Hero subtitle and description to mention sequence + atlas modes
- [x] Update Hero stats bar (2 AI Modes, 100% Client-side, 15+ Formats)
- [x] Fix Hero "Documentation" dead link to point to /docs
- [x] Update Features section descriptions (AI dual-mode, engine sync, normal maps, compression)
- [x] Update HowItWorks descriptions to reflect atlas mode and engine sync
- [x] Update Pricing feature lists to match actual tier boundaries
- [x] Update Footer description to mention atlas mode

## B. Paid Tier Gating
- [x] Create `src/lib/tier.ts` with isPro(), getTierFromSession(), TIER_LIMITS
- [x] Create `src/components/shared/UpgradePrompt.tsx` component
- [x] Refactor SettingsPanel isPro() to use shared tier helper
- [x] Add UpgradePrompt to normal map toggle for free users
- [x] Add UpgradePrompt to engine sync toggle for free users
- [x] Add UpgradePrompt to compression format selector for free users

## C. Terms of Service & Privacy Policy
- [x] Add AI-generated content ownership section to ToS
- [x] Add Gemini API disclosure to Privacy third-party services section
- [x] Add detailed cookie information to Privacy
- [x] Update "Last updated" dates

## D. Documentation Page
- [x] Create `src/app/docs/page.tsx` with feature documentation
- [x] Add docs link to Footer

## E. Error Monitoring (Sentry)
- [x] Install @sentry/nextjs
- [x] Create sentry.client.config.ts with DSN env var check
- [x] Create sentry.server.config.ts with DSN env var check
- [x] Create sentry.edge.config.ts with DSN env var check
- [x] Create instrumentation.ts for Next.js Sentry hook
- [x] Update next.config.ts with withSentryConfig wrapper

## F. Analytics
- [x] Install @vercel/analytics
- [x] Add Analytics component to root layout
