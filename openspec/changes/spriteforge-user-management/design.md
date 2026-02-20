## Context

SpriteForge is a Next.js app with NextAuth v5 (JWT strategy), Prisma 6 on Neon PostgreSQL, and Vercel deployment. Auth works (GitHub OAuth, Magic Link, Credentials) but there's no post-login user management. The database already has `tier`, `stripeCustomerId`, and `Subscription` models but no Stripe API integration. The UI style is dark/industrial with cyan accents, monospace fonts, and uppercase labels.

## Goals / Non-Goals

**Goals:**
- Users can manage their profile, password, and account from `/settings`
- Stripe Checkout enables Pro/Team purchases; webhooks keep state in sync
- Pricing CTAs are functional end-to-end
- Password reset via email for credential users

**Non-Goals:**
- Team management / invite system (future)
- Usage analytics dashboard
- Custom avatar upload (URL-only for now)
- Stripe invoices / receipts page (Portal handles this)
- Free trial period

## Decisions

### 1. Stripe Checkout (hosted) over embedded payment form
**Choice**: Stripe-hosted Checkout
**Why**: Zero PCI scope, handles 3DS/SCA automatically, minimal frontend code. Stripe Customer Portal for subscription management eliminates building billing UI.
**Alternative**: Embedded Stripe Elements — more control but significant frontend work and PCI considerations.

### 2. Server-side settings page over client-side SPA
**Choice**: Next.js Server Component for `/settings` with Server Actions or API routes for mutations
**Why**: Consistent with existing app patterns. Auth check happens server-side. Form submissions use API routes (same pattern as `/api/auth/register`).

### 3. Password reset tokens in User model over separate table
**Choice**: Add `passwordResetToken` and `passwordResetExpires` fields to User model
**Why**: Simpler than a separate table. Only one active reset token per user. Token is hashed before storage (same as verification tokens).

### 4. Resend for reset emails (reuse existing provider)
**Choice**: Use Resend API directly (already configured for magic links)
**Why**: No new dependency. Same `RESEND_API_KEY` and verified domain.

## Risks / Trade-offs

- **[Webhook reliability]** → Stripe webhooks can fail/retry. Use idempotent handlers keyed on event ID. Verify webhook signature with `STRIPE_WEBHOOK_SECRET`.
- **[Race condition on tier update]** → Checkout success redirect may arrive before webhook. Show "processing" state; poll or use `checkout.session.completed` event as source of truth.
- **[Account deletion is irreversible]** → Require typing "DELETE" confirmation. Delete Stripe subscription first, then database records.
- **[Reset token brute force]** → Use crypto.randomUUID() (128-bit), hash before storage, 1-hour expiry, single-use.

## Open Questions

- Stripe price IDs need to be created in Stripe Dashboard — document in env setup
- Whether to show billing history (defer to Stripe Portal for now)
