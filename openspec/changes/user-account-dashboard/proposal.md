## Why

Users have no visibility into their AI usage quota — they only discover limits when a request returns 429. The Settings page lacks any usage metrics, and the editor provides no indication of remaining AI credits before attempting an operation. Additionally, the AI Transform feature (right-click → variants/recolor/upscale/extend-frames) has never been tested end-to-end in a real browser environment.

## What Changes

- **New API endpoint `/api/ai/quota`** — GET route returning `{ used, limit, tier, resetsAt }` for the authenticated user's daily AI quota
- **Settings page: AI Usage section** — Visual progress bar showing today's usage (e.g., "3 / 10 generations used"), tier badge, daily reset time, and usage history (last 7 days bar chart)
- **Editor toolbar: Quota indicator** — Compact pill in the editor toolbar showing remaining AI credits (e.g., "7/10 AI") that updates after each generation/transform, with warning state when low
- **AI Transform context menu: quota pre-check** — Before calling the API, check quota client-side and show inline warning if limit reached instead of making a failing request
- **UserMenu: add Dashboard/Usage link** — Currently Settings and Billing both link to `/settings`; add distinct routing so Billing links to `#billing` anchor

## Capabilities

### New Capabilities
- `ai-quota-dashboard`: AI usage visibility — quota API endpoint, Settings page usage section (progress bar + 7-day history), editor toolbar quota indicator, pre-check on AI context menu actions

### Modified Capabilities
- None (existing specs unaffected — this is additive UI/API, no behavioral change to generation or transform logic)

## Impact

- **New files:**
  - `src/app/api/ai/quota/route.ts` — GET endpoint
  - `src/components/editor/AiQuotaIndicator.tsx` — toolbar quota pill
- **Modified files:**
  - `src/app/settings/page.tsx` — fetch AI usage data from DB
  - `src/app/settings/SettingsClient.tsx` — add Usage section with progress bar + history chart
  - `src/components/editor/EditorToolbar.tsx` — mount AiQuotaIndicator
  - `src/components/editor/SpriteList.tsx` — pre-check quota before `handleAiAction`
  - `src/components/editor/AssetGrid.tsx` — pre-check quota before `handleAiAction`
  - `src/components/auth/UserMenu.tsx` — fix duplicate Settings/Billing links
- **Dependencies:** None (uses existing Prisma AiUsage model + ai-quota.ts)
- **APIs:** One new GET endpoint, no breaking changes
