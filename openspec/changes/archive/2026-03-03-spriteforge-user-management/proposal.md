## Why

SpriteForge has a working auth system (GitHub OAuth, Magic Link, Credentials) but zero post-login user management. Users can't edit their profile, reset passwords, or upgrade to paid tiers. The Pricing page CTAs link to `#`, Stripe integration is database-ready but has no API routes, and the UserMenu only offers sign-out. This blocks monetization and creates a dead-end user experience.

## What Changes

- Add `/settings` page with profile editing (name, avatar), password change, and account deletion
- Add `/settings/billing` section showing current tier, subscription status, and upgrade/downgrade controls
- Integrate Stripe Checkout for Pro/Team tier purchases and Stripe Customer Portal for subscription management
- Add Stripe webhook handler for subscription lifecycle events (created, updated, deleted, payment failed)
- Wire Pricing page CTAs to Stripe Checkout sessions
- Expand UserMenu dropdown with Profile/Settings/Billing links
- Add forgot-password flow (reset via email token)

## Capabilities

### New Capabilities
- `user-settings`: Profile editing (name, avatar), password change, account deletion
- `stripe-billing`: Stripe Checkout integration, webhook handling, subscription management, Customer Portal
- `password-reset`: Forgot password flow with email token and reset page

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **New pages**: `/settings`, `/settings/billing`, `/auth/reset-password`, `/auth/new-password`
- **New API routes**: `/api/stripe/checkout`, `/api/stripe/webhook`, `/api/stripe/portal`, `/api/user/profile`, `/api/user/password`, `/api/user/delete`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- **Modified components**: `UserMenu.tsx` (add menu items), `Pricing.tsx` (wire CTAs)
- **New dependencies**: `stripe`, `@stripe/stripe-js`
- **Database**: Add `passwordResetToken`/`passwordResetExpires` fields to User model
- **Env vars**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID`
