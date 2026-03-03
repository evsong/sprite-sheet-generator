## ADDED Requirements

### Requirement: User can subscribe to Pro or Team tier
The system SHALL create a Stripe Checkout session when a user clicks a pricing CTA, redirecting them to Stripe-hosted payment.

#### Scenario: Free user upgrades to Pro
- **WHEN** authenticated free-tier user clicks "Upgrade to Pro" on pricing page
- **THEN** system creates a Stripe Checkout session for the Pro price and redirects to Stripe

#### Scenario: Free user upgrades to Team
- **WHEN** authenticated free-tier user clicks "Upgrade to Team"
- **THEN** system creates a Stripe Checkout session for the Team price and redirects to Stripe

#### Scenario: Unauthenticated user clicks upgrade
- **WHEN** unauthenticated user clicks a pricing CTA
- **THEN** system redirects to `/auth/signin` with callback to pricing

### Requirement: Stripe webhook updates subscription state
The system SHALL process Stripe webhook events to keep subscription data in sync.

#### Scenario: Checkout completed
- **WHEN** `checkout.session.completed` webhook fires
- **THEN** system updates user's tier, creates Subscription record, and stores stripeCustomerId

#### Scenario: Subscription canceled
- **WHEN** `customer.subscription.deleted` webhook fires
- **THEN** system sets user tier to FREE and updates subscription status to CANCELED

#### Scenario: Payment failed
- **WHEN** `invoice.payment_failed` webhook fires
- **THEN** system updates subscription status to PAST_DUE

### Requirement: User can manage subscription via Stripe Portal
The system SHALL provide access to Stripe Customer Portal for subscription management.

#### Scenario: Access billing portal
- **WHEN** subscribed user clicks "Manage Subscription" in settings/billing
- **THEN** system creates a Stripe Portal session and redirects to it

### Requirement: Pricing page CTAs are functional
The system SHALL wire pricing page buttons to Stripe Checkout.

#### Scenario: Pro CTA creates checkout
- **WHEN** user clicks Pro tier CTA on `/pricing` or landing page
- **THEN** system initiates Stripe Checkout for Pro price

#### Scenario: Free tier shows current plan
- **WHEN** authenticated free user views pricing
- **THEN** Free tier shows "Current Plan" instead of a CTA button
