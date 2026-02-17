## Context

SpriteForge is a greenfield Next.js web application — an AI-powered sprite sheet generator targeting game developers. The prototype (single-file HTML) has been validated through 3 rounds of Gemini design review. Research confirms a market gap: no free web tool combines MaxRects packing, transparent trimming, animation preview, and multi-engine export.

Key constraints:
- Sprite image processing MUST happen client-side (privacy, no server cost for image manipulation)
- AI generation requires server-side API calls (API keys must not be exposed to client)
- Must support guest usage (no sign-in required for core packing features)
- SEO-critical landing page needs SSR

## Goals / Non-Goals

**Goals:**
- Ship a functional MVP with packing + export + AI generation + auth + payments
- Client-side packing with zero image uploads to server
- Landing page optimized for "sprite sheet generator" SEO (480K/month)
- Freemium conversion funnel: free tool → sign up → PRO/TEAM

**Non-Goals:**
- Pixel art editor (Piskel territory — we're a packer, not an editor)
- Self-hosted AI models (MVP uses third-party APIs; ComfyUI is post-MVP)
- Mobile-first editor (editor is desktop-focused; landing page is responsive)
- Real-time collaboration (TEAM tier is shared projects, not live co-editing)
- Offline/PWA support

## Decisions

### D1: Next.js App Router + Server Components
Use Next.js 14+ App Router with React Server Components for the landing page (SSR for SEO) and client components for the editor (heavy Canvas/DOM interaction).

**Why not Pages Router:** App Router is the current standard, better streaming/loading UX, native server components reduce client bundle.

### D2: Client-side packing architecture
All image processing runs in the browser:
- `maxrects-packer` for bin packing (zero dependencies, ~15KB)
- Canvas API `getImageData()` for transparent trimming
- Web Workers for packing computation on large sprite sets (>50 sprites) to avoid UI blocking

**Why not server-side:** Privacy (images never leave browser), zero server compute cost, instant feedback loop. Trade-off: limited by client device performance.

### D3: AI generation via Next.js API routes
AI requests flow: Client → Next.js API Route → Third-party AI API → Client.

API route handles: API key management, usage quota enforcement, response streaming, error handling. Start with Stability AI (best for pixel art / game assets), add DALL-E and Flux as alternatives.

**Why not direct client→AI API:** API keys would be exposed. Server proxy also enables quota tracking in database.

### D4: Database schema (PostgreSQL + Prisma + Neon)

Core tables:
- `User` — id, email, name, avatar, provider, tier, stripeCustomerId, createdAt
- `Project` — id, userId, name, config (JSON), thumbnail, createdAt, updatedAt
- `ProjectAsset` — id, projectId, filename, storageUrl, metadata (JSON)
- `AiUsage` — id, userId, date, count (daily counter)
- `Subscription` — id, userId, stripeSubscriptionId, tier, status, currentPeriodEnd

**Why Neon:** Serverless PostgreSQL, scales to zero, generous free tier, works well with Vercel.

### D5: File storage — Vercel Blob
Use Vercel Blob for project asset storage (saved sprites). Simple API, integrated with Vercel, no S3 configuration needed.

**Why not S3:** Vercel Blob is simpler for MVP, no IAM/bucket config. Can migrate to S3 later if costs warrant it.

### D6: Auth — NextAuth v5
NextAuth with GitHub and Google OAuth providers. JWT strategy (no database sessions) for simplicity. User record created on first sign-in.

**Why not Clerk/Auth0:** NextAuth is free, open-source, and sufficient for OAuth + session management. No vendor lock-in.

### D7: Payments — Stripe Checkout + Customer Portal
Use Stripe's hosted Checkout for purchases and Customer Portal for subscription management. Minimizes PCI scope and custom billing UI.

Webhook endpoint at `/api/webhooks/stripe` handles subscription lifecycle events.

### D8: Editor state management — Zustand
Use Zustand for editor state (sprite list, packing config, animation state, selection). Lightweight, no boilerplate, works well with Canvas-heavy UIs.

**Why not Redux/Context:** Zustand is simpler for this use case — flat state with frequent updates from Canvas interactions. Context would cause unnecessary re-renders.

### D9: Landing page structure
Route structure:
- `/` — Landing page (SSR, server components)
- `/editor` — Editor app (client components, lazy-loaded)
- `/pricing` — Pricing page (SSR)
- `/api/ai/generate` — AI generation endpoint
- `/api/webhooks/stripe` — Stripe webhooks
- `/api/auth/[...nextauth]` — NextAuth routes

## Risks / Trade-offs

- **[AI API cost]** → Strict per-tier quotas + daily reset. Monitor usage. Can switch providers if costs spike.
- **[Client-side performance]** → Web Workers for heavy packing. Set reasonable sprite count limits per tier. Show progress indicators.
- **[maxrects-packer limitations]** → Library handles most cases well. Oversized sprites fallback to dedicated bins. No polygon packing (post-MVP).
- **[Vercel Blob storage costs]** → PRO/TEAM only for cloud save. Monitor per-user storage. Set project count limits if needed.
- **[SEO competition]** → TexturePacker dominates branded searches. Target long-tail: "free online sprite sheet generator", "AI sprite generator". Blog content for engine-specific tutorials.
