## Why

Game developers need a free, professional-grade sprite sheet tool that works in the browser. Current options are either paid desktop apps (TexturePacker $50) or basic online tools that only do grid layout with no data file output. No free web tool combines intelligent bin packing, transparent trimming, animation preview, and multi-engine export — let alone AI sprite generation. SpriteForge fills this gap as a freemium web app targeting the "sprite sheet generator" keyword (480K/month searches, KD 20%).

## What Changes

- Build a complete Next.js web application from scratch (no existing codebase)
- Client-side MaxRects bin packing via `maxrects-packer` library — sprites never leave the browser
- Canvas API transparent pixel trimming with sourceSize/spriteSourceSize metadata
- AI sprite generation through third-party APIs (Stability AI / DALL-E / Flux) with usage limits per tier
- Animation timeline with frame preview, frame reorder, onion skin overlay
- Export to 6+ formats: PixiJS JSON, Phaser 3 Atlas, CSS sprites, Unity, Godot, generic JSON Array
- Copy-paste engine code snippets (Phaser, PixiJS, Unity C#, Godot GDScript)
- User authentication (NextAuth) with project save/load
- Freemium subscription (Stripe): FREE / PRO $9.99/mo / TEAM $29.99/mo
- Landing page with SEO optimization for organic acquisition

## Capabilities

### New Capabilities
- `sprite-packing`: Client-side MaxRects bin packing, transparent trimming, POT alignment, padding/border control, multi-bin output
- `ai-generation`: Text-to-sprite generation via third-party AI APIs, style consistency, batch generation, usage quotas per tier
- `animation-workflow`: Frame sequence preview, playback speed control, onion skin overlay, drag-to-reorder frames, loop/ping-pong modes
- `export-engine`: Multi-format export (PixiJS JSON Hash, Phaser 3 Atlas, CSS sprites, Unity, Godot .tres, JSON Array), engine code snippet generation
- `user-auth`: NextAuth authentication (GitHub, Google, email), session management, user profiles
- `project-storage`: Cloud project save/load (PostgreSQL via Prisma + Neon), project history, asset management
- `subscription`: Stripe integration, three tiers (FREE/PRO/TEAM), usage metering for AI generation, feature gating

### Modified Capabilities
<!-- None — greenfield project -->

## Impact

- **New codebase**: Next.js 14+ App Router, TailwindCSS, deployed on Vercel
- **Database**: PostgreSQL (Neon) with Prisma ORM — users, projects, subscriptions, AI usage tables
- **External APIs**: Stability AI / OpenAI DALL-E / Flux for sprite generation, Stripe for payments
- **Client dependencies**: `maxrects-packer` for bin packing, Canvas API for image processing
- **Auth providers**: GitHub OAuth, Google OAuth, email/password via NextAuth
- **CDN/Storage**: Vercel Blob or S3 for saved project assets
