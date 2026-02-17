## ADDED Requirements

### Requirement: Three subscription tiers
The system SHALL offer three tiers: FREE ($0), PRO ($9.99/month), TEAM ($29.99/month). Tier determines feature access and usage limits.

#### Scenario: Tier feature matrix
- **WHEN** system checks user tier for feature access
- **THEN** the following limits apply:
  - FREE: 2 export formats (JSON/CSS), 3 AI generations/day, 20 sprites max, no cloud save, watermark on export
  - PRO: All 6+ export formats, 50 AI generations/day, 200 sprites max, cloud save, no watermark, engine code snippets, onion skin
  - TEAM: All PRO features + unlimited AI generations, unlimited sprites, team project sharing

### Requirement: Stripe checkout
The system SHALL integrate Stripe Checkout for subscription purchases. Users SHALL be redirected to Stripe's hosted checkout page.

#### Scenario: Upgrade to PRO
- **WHEN** FREE user clicks "Upgrade to PRO" on pricing page
- **THEN** system creates a Stripe Checkout session and redirects user to complete payment

### Requirement: Subscription management
The system SHALL allow users to manage their subscription (cancel, change tier) via Stripe Customer Portal.

#### Scenario: Cancel subscription
- **WHEN** PRO user clicks "Manage Subscription" and cancels
- **THEN** subscription remains active until end of billing period, then downgrades to FREE

### Requirement: Stripe webhook handling
The system SHALL process Stripe webhooks for: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed.

#### Scenario: Payment failure
- **WHEN** Stripe sends invoice.payment_failed webhook
- **THEN** system marks subscription as past_due and shows payment update prompt to user

#### Scenario: Successful checkout
- **WHEN** Stripe sends checkout.session.completed webhook
- **THEN** system upgrades user tier immediately and unlocks all tier features

### Requirement: Feature gating
The system SHALL check user tier before allowing access to gated features. Gated actions SHALL show an upgrade prompt with the required tier.

#### Scenario: Gated feature access
- **WHEN** FREE user attempts to use engine code snippets
- **THEN** system displays modal: "Upgrade to PRO to unlock engine code snippets" with upgrade button
