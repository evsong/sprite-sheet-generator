## ADDED Requirements

### Requirement: Quota API endpoint
The system SHALL expose a `GET /api/ai/quota` endpoint that returns the authenticated user's current AI usage quota for today.

The response SHALL include:
- `used`: number of AI generations consumed today
- `limit`: daily limit for the user's tier
- `tier`: the user's current tier name (FREE/PRO/TEAM)
- `resetsAt`: ISO 8601 timestamp of next daily reset (midnight UTC)
- `history`: array of last 7 days `{ date: string, count: number }`

The endpoint SHALL return 401 if the user is not authenticated.

#### Scenario: Authenticated user with usage
- **WHEN** a PRO user who has used 3 AI generations today calls `GET /api/ai/quota`
- **THEN** the response SHALL be `{ used: 3, limit: 10, tier: "PRO", resetsAt: "<next-midnight-utc>", history: [...] }` with status 200

#### Scenario: Unauthenticated request
- **WHEN** an unauthenticated user calls `GET /api/ai/quota`
- **THEN** the response SHALL be `{ error: "Authentication required" }` with status 401

#### Scenario: User with no usage today
- **WHEN** an authenticated user with no AI usage records for today calls `GET /api/ai/quota`
- **THEN** the response SHALL return `used: 0` with the correct `limit` for their tier

---

### Requirement: Settings page AI usage section
The Settings page SHALL display an "AI Usage" section between the Profile and Billing sections showing:
- A text label showing `{used} / {limit} generations used today`
- A visual progress bar filled proportionally to `used / limit`
- The user's tier badge
- Text showing when the quota resets (e.g., "Resets at 00:00 UTC")
- A 7-day usage history displayed as a bar chart with labeled dates

#### Scenario: PRO user views usage
- **WHEN** a PRO user with 7/10 used today navigates to `/settings`
- **THEN** the page SHALL show "7 / 10 generations used today", a progress bar at 70%, tier badge "PRO", and 7 bars for the last 7 days

#### Scenario: FREE user at limit
- **WHEN** a FREE user who has used 1/1 today navigates to `/settings`
- **THEN** the progress bar SHALL be at 100% with a red/warning color, and text SHALL indicate "Daily limit reached"

#### Scenario: Empty history
- **WHEN** a new user with no AI usage history navigates to `/settings`
- **THEN** all 7 history bars SHALL render at zero height with 0 labels

---

### Requirement: Editor toolbar quota indicator
The editor toolbar SHALL display a compact quota indicator showing the user's remaining AI generations in the format `{remaining}/{limit} AI`.

The indicator SHALL:
- Display in the editor toolbar area, visible at all times while editing
- Update automatically after each AI generation or transform completes
- Show a warning state (amber color) when remaining is 25% or less of the limit
- Show an exhausted state (red color) when remaining is 0
- Be hidden when the user is not authenticated

#### Scenario: Normal usage state
- **WHEN** a PRO user has used 3/10 AI generations
- **THEN** the indicator SHALL display "7/10 AI" in default styling

#### Scenario: Low usage warning
- **WHEN** a PRO user has used 8/10 AI generations
- **THEN** the indicator SHALL display "2/10 AI" with amber warning styling

#### Scenario: Quota exhausted
- **WHEN** a user has used all their daily AI generations
- **THEN** the indicator SHALL display "0/{limit} AI" with red styling

#### Scenario: Unauthenticated user
- **WHEN** a user is not signed in
- **THEN** the quota indicator SHALL not be rendered

#### Scenario: Refresh after AI action
- **WHEN** a user completes an AI generation or transform
- **THEN** the indicator SHALL refetch quota data and update the display

---

### Requirement: AI Transform quota pre-check
When a user triggers an AI Transform action (variants, recolor, upscale, extend-frames) from the context menu, the system SHALL pre-check the user's quota before making the API call.

#### Scenario: Quota available
- **WHEN** a user with remaining quota right-clicks a sprite and selects "AI Variants"
- **THEN** the system SHALL proceed with the `/api/ai/transform` API call normally

#### Scenario: Quota exhausted pre-check
- **WHEN** a user with 0 remaining quota right-clicks a sprite and selects any AI action
- **THEN** the system SHALL NOT call `/api/ai/transform`
- **AND** SHALL display an error via `setAiProgress` with message "Daily AI limit reached ({used}/{limit}). Upgrade for more."

#### Scenario: Pre-check fails gracefully
- **WHEN** the quota pre-check API call fails (network error)
- **THEN** the system SHALL proceed with the transform API call (fail-open for UX)

---

### Requirement: UserMenu link fix
The UserMenu dropdown SHALL have distinct navigation targets for "Settings" and "Billing".

#### Scenario: Settings link
- **WHEN** user clicks "Settings" in UserMenu
- **THEN** the browser SHALL navigate to `/settings`

#### Scenario: Billing link
- **WHEN** user clicks "Billing" in UserMenu
- **THEN** the browser SHALL navigate to `/settings#billing`
