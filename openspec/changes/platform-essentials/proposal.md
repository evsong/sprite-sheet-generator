# Platform Essentials

## Summary
Landing page copy update, paid tier gating enforcement, Terms of Service & Privacy Policy enhancements, dead link fix, error monitoring (Sentry), and lightweight analytics (Vercel Analytics).

## Motivation
SpriteForge has shipped dual-mode generation (sequence + atlas), engine sync, normal maps, and compression, but the landing page still describes only animation sequences. The free/pro tier boundaries exist in the database and AI quota, but lack a reusable client-side helper and upgrade prompts. The "Documentation" hero button is a dead link (`href="#"`). Error monitoring and analytics are absent, making it impossible to diagnose production issues or understand user behavior.

## Scope
- **A. Landing Page Copy** - Update hero, features, and workflow sections to reflect atlas mode, engine sync, normal maps, and compression
- **B. Paid Tier Gating** - Create `src/lib/tier.ts` with `isPro()` helper and `UpgradePrompt` component; enforce limits at AI gen, export format, engine sync, normal maps
- **C. ToS & Privacy** - Enhance existing `/terms` and `/privacy` pages with AI-generated content ownership, Gemini API disclosure, and cookie policy sections
- **D. Dead Link Fix** - Replace hero "Documentation" `href="#"` with `/docs` route containing feature documentation
- **E. Sentry Integration** - Install `@sentry/nextjs`, create config files with graceful no-op when DSN is missing
- **F. Vercel Analytics** - Install `@vercel/analytics`, add `<Analytics />` to root layout
