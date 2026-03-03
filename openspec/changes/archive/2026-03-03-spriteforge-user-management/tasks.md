## 1. Database & Setup

- [x] 1.1 Add `passwordResetToken` (String, unique, nullable) and `passwordResetExpires` (DateTime, nullable) fields to User model in prisma/schema.prisma, run migration
- [x] 1.2 Install `stripe` package

## 2. User Settings Page

- [x] 2.1 Create `/api/user/profile` PUT route — update name and avatar, return updated user
- [x] 2.2 Create `/api/user/password` PUT route — verify current password, update to new password (≥6 chars)
- [x] 2.3 Create `/api/user/delete` DELETE route — cancel Stripe subscription if exists, delete user and all related data, sign out
- [x] 2.4 Create `/settings` page — profile form (name, avatar), password change section (hidden for OAuth users), account deletion with "DELETE" confirmation
- [x] 2.5 Add auth redirect: unauthenticated users on `/settings` redirect to `/auth/signin?callbackUrl=/settings`

## 3. Password Reset

- [x] 3.1 Create `/api/auth/forgot-password` POST route — generate hashed token with 1h expiry, send reset email via Resend
- [x] 3.2 Create `/api/auth/reset-password` POST route — validate token, update password, invalidate token
- [x] 3.3 Create `/auth/reset-password` page — email input form to request reset
- [x] 3.4 Create `/auth/new-password` page — new password form, validates token from URL query

## 4. Stripe Billing

- [x] 4.1 Create `/api/stripe/checkout` POST route — create Stripe Checkout session for Pro or Team price, redirect URL
- [x] 4.2 Create `/api/stripe/webhook` POST route — handle `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed` events with signature verification
- [x] 4.3 Create `/api/stripe/portal` POST route — create Stripe Customer Portal session for subscription management
- [x] 4.4 Create `/settings/billing` section — show current tier, subscription status, "Manage Subscription" button (Portal), upgrade button for free users

## 5. Wire Up UI

- [x] 5.1 Update `UserMenu.tsx` — add Settings and Billing links to dropdown
- [x] 5.2 Update `Pricing.tsx` — wire Pro/Team CTAs to `/api/stripe/checkout`, show "Current Plan" for active tier, redirect unauthenticated users to signin
- [x] 5.3 Add "Forgot password?" link on `/auth/signin` page pointing to `/auth/reset-password`
