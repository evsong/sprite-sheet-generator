## 1. Project Setup

- [x] 1.1 Initialize Next.js 14+ project with App Router, TypeScript, TailwindCSS, ESLint
- [x] 1.2 Configure Google Fonts (Chakra Petch, IBM Plex Sans, JetBrains Mono) and CSS variables from design system MASTER.md
- [x] 1.3 Install core dependencies: maxrects-packer, zustand, next-auth, prisma, @stripe/stripe-js, stripe
- [x] 1.4 Set up Prisma schema with User, Project, ProjectAsset, AiUsage, Subscription tables and connect to Neon PostgreSQL
- [x] 1.5 Configure environment variables (.env.local template): DATABASE_URL, NEXTAUTH_SECRET, GITHUB_ID/SECRET, GOOGLE_ID/SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STABILITY_API_KEY
- [x] 1.6 Set up project folder structure: app/(landing), app/editor, app/pricing, app/api, lib/, components/, stores/

## 2. Landing Page

- [x] 2.1 Build root layout with floating navbar (SpriteForge logo, Features, Pricing, Docs links, "Open Editor" CTA button)
- [x] 2.2 Build Hero section with headline, sub-text, two CTAs (Start Free / View Pricing), stats row
- [x] 2.3 Build Features section — 4 bento cards: AI Generation, Smart Packing, Animation Workflow, Engine Integration
- [x] 2.4 Build How It Works section — 3 steps: Upload/Generate → Pack & Preview → Export
- [x] 2.5 Build Pricing section with FREE/PRO/TEAM tier comparison table and Stripe checkout CTAs
- [x] 2.6 Build Footer with links, social icons, copyright
- [x] 2.7 Add SEO metadata (title, description, OG tags) targeting "sprite sheet generator" keyword
- [x] 2.8 Ensure responsive layout at 375px, 768px, 1024px, 1440px breakpoints

## 3. Authentication

- [x] 3.1 Configure NextAuth v5 with GitHub and Google OAuth providers, JWT strategy
- [x] 3.2 Create sign-in/sign-up UI (modal or page) with OAuth buttons
- [x] 3.3 Implement user record creation on first sign-in (upsert to User table)
- [x] 3.4 Build user profile dropdown in navbar (avatar, name, tier badge, sign-out)
- [x] 3.5 Implement guest mode — editor works without auth, cloud save disabled with "Sign in to save" prompt

## 4. Editor — Layout & Shell

- [x] 4.1 Build editor page layout: top toolbar, left sidebar (sprite list), center canvas, right sidebar (settings), bottom timeline
- [x] 4.2 Set up Zustand store for editor state: sprites[], packingConfig, animationState, selection, bins[]
- [x] 4.3 Build top toolbar: file operations (New, Open, Save), undo/redo buttons, zoom slider, Export button
- [x] 4.4 Build left sidebar: sprite list with drag-to-reorder, thumbnail, name, AI badge, right-click context menu
- [x] 4.5 Build right sidebar: settings panel (canvas size W×H, padding, border, POT toggle, rotation toggle, algorithm display, export format dropdown)
- [x] 4.6 Build canvas area with grid background, rulers, zoom/pan controls

## 5. Sprite Packing (Core)

- [x] 5.1 Implement drag-and-drop file upload (PNG, WebP, GIF first frame, JPEG) onto canvas and via file picker
- [x] 5.2 Integrate maxrects-packer: pack sprites on upload/config change, render packed result to canvas
- [x] 5.3 Implement transparent pixel trimming via Canvas getImageData() — scan borders, crop, record sourceSize/spriteSourceSize
- [x] 5.4 Implement configurable atlas parameters: max width/height, padding, border, POT alignment, allow rotation
- [x] 5.5 Implement multi-bin support: bin selector UI when sprites overflow single atlas
- [x] 5.6 Implement Web Worker for packing computation on large sprite sets (>50 sprites)
- [x] 5.7 Implement sprite reorder (drag in list) and removal with auto-repack
- [x] 5.8 Implement selection sync: clicking sprite in list highlights corresponding cell on canvas

## 6. Export Engine

- [x] 6.1 Implement PixiJS JSON Hash export (frames, animations, meta sections)
- [x] 6.2 Implement Phaser 3 Atlas JSON export
- [x] 6.3 Implement CSS Sprites export (PNG + CSS file with background-position classes)
- [x] 6.4 Implement Unity JSON export
- [x] 6.5 Implement Godot .tres AtlasTexture export
- [x] 6.6 Implement Generic JSON Array export
- [x] 6.7 Implement trim metadata in exports (trimmed, sourceSize, spriteSourceSize fields)
- [x] 6.8 Implement engine code snippet generation (Phaser, PixiJS, Unity C#, Godot GDScript) — PRO/TEAM only
- [x] 6.9 Implement FREE tier watermark ("Made with SpriteForge") on exported atlas PNG
- [x] 6.10 Implement batch/multi-bin ZIP export
- [x] 6.11 Implement tier-based format gating (FREE: JSON + CSS only, PRO/TEAM: all formats)

## 7. Animation Workflow

- [x] 7.1 Build bottom timeline strip showing animation frames with thumbnails
- [x] 7.2 Implement animation preview canvas with Play/Pause controls
- [x] 7.3 Implement FPS slider (1-60, default 12) for playback speed control
- [x] 7.4 Implement frame drag-to-reorder in timeline with export sequence update
- [x] 7.5 Implement loop and ping-pong playback modes
- [x] 7.6 Implement onion skin overlay (previous/next frame at 30% opacity) — PRO/TEAM only

## 8. AI Sprite Generation

- [x] 8.1 Create Next.js API route `/api/ai/generate` — proxy to Stability AI with API key, validate quota, stream response
- [x] 8.2 Build AI generation modal/panel: text prompt input, style selector, frame count, Generate button
- [x] 8.3 Implement generation progress indicator (non-blocking, user can continue editing)
- [x] 8.4 Implement daily quota tracking in AiUsage table (FREE 3/day, PRO 50/day, TEAM unlimited, reset at midnight UTC)
- [x] 8.5 Implement context menu AI operations: AI Variants, AI Recolor, AI Upscale 2×, AI Remove BG, AI Extend Frames
- [x] 8.6 Wire generated sprites into editor state (add to sprite list, trigger repack)

## 9. Project Storage

- [x] 9.1 Implement "Save Project" — upload sprites to Vercel Blob, save metadata to Project + ProjectAsset tables — PRO/TEAM only
- [x] 9.2 Implement "Load Project" — fetch from database, download assets, restore editor state
- [x] 9.3 Build project browser UI (card grid with thumbnails, name, sprite count, last modified)
- [x] 9.4 Implement project delete with confirmation dialog and asset cleanup
- [x] 9.5 Implement local .spriteforge JSON export/import as offline backup (all tiers)

## 10. Subscription & Payments

- [ ] 10.1 Create Stripe products and prices for PRO ($9.99/mo) and TEAM ($29.99/mo)
- [ ] 10.2 Implement `/api/stripe/checkout` — create Stripe Checkout session, redirect to Stripe
- [ ] 10.3 Implement `/api/webhooks/stripe` — handle checkout.session.completed, subscription.updated, subscription.deleted, invoice.payment_failed
- [ ] 10.4 Implement subscription status sync: update User tier on webhook events
- [ ] 10.5 Implement feature gating utility: check user tier, show upgrade modal for gated features
- [ ] 10.6 Add "Manage Subscription" link to profile dropdown (Stripe Customer Portal redirect)

## 11. Polish & Deploy

- [x] 11.1 Implement keyboard shortcuts (⌘D duplicate, F2 rename, ⌫ delete, ⌘Z undo, ⌘⇧Z redo)
- [x] 11.2 Add prefers-reduced-motion support, focus states, aria-labels for accessibility
- [x] 11.3 Add loading skeletons for editor initial load and project browser
- [x] 11.4 Configure Vercel deployment: environment variables, domain, build settings
- [x] 11.5 Set up Prisma migrations and seed script for initial database setup
- [x] 11.6 End-to-end smoke test: upload → pack → export flow, AI generation, auth, payment
