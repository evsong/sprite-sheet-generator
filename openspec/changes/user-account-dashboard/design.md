## Context

SpriteForge has a working AI generation/transform pipeline (Gemini 3 Pro Image) with daily quota enforcement per tier (FREE=1, PRO=10, TEAM=500). The quota backend (`ai-quota.ts` + Prisma `AiUsage` model) works correctly but has zero frontend visibility:

- Users discover limits only via 429 errors from `/api/ai/generate` or `/api/ai/transform`
- The Settings page (`/settings`) has Profile, Password, Billing, and Delete Account sections — no usage metrics
- The editor toolbar has no quota indicator
- AI Transform (right-click context menu) doesn't pre-check quota before making API calls
- UserMenu has duplicate "Settings"/"Billing" links both pointing to `/settings`

The `AiUsage` Prisma model already tracks daily usage with a composite unique on `(userId, date)`, so historical data is available for display.

## Goals / Non-Goals

**Goals:**
- Expose a GET `/api/ai/quota` endpoint returning current usage, limit, tier, and reset time
- Add an "AI Usage" section to the Settings page with progress bar + 7-day history
- Add a compact quota indicator in the editor toolbar that updates reactively
- Pre-check quota on the client before AI Transform context menu actions
- Fix UserMenu duplicate links

**Non-Goals:**
- Admin dashboard for managing user quotas (future)
- Real-time WebSocket-based quota updates (polling/refetch is sufficient)
- Usage analytics aggregation or reporting beyond 7-day display
- Changing quota limits or tier pricing (already set)

## Decisions

### 1. Quota API: Single GET endpoint vs. embed in session

**Decision:** Dedicated `GET /api/ai/quota` endpoint.

**Rationale:** Session callbacks run on every request and should stay lightweight. Quota requires a DB query to `AiUsage` table. A dedicated endpoint allows on-demand fetching (after AI actions) without bloating every session refresh. Also enables the Settings page to fetch independently.

**Alternative rejected:** Embedding quota in the session callback — adds latency to every authenticated request, session data should be stable user metadata not ephemeral counters.

### 2. Editor quota indicator: SWR polling vs. event-driven refresh

**Decision:** Use `useSWR` with a `refreshInterval` of 0 (no polling) + manual `mutate()` after each AI action completes.

**Rationale:** AI actions are infrequent (max 10/day for PRO). Polling wastes requests. Instead, refetch quota after each successful generate/transform call. The SWR cache ensures the indicator shows correct data without redundant network calls.

**Alternative rejected:** Zustand store field — would require syncing server state to client store, creating two sources of truth. SWR handles server state caching natively.

### 3. Settings usage history: 7-day bar chart

**Decision:** Fetch last 7 days of `AiUsage` records server-side in the Settings page.tsx, pass as props to SettingsClient. Render as simple CSS bars (no chart library).

**Rationale:** Only 7 data points — a chart library (recharts, etc.) is overkill. CSS flexbox bars with percentage heights are trivial and add zero bundle size. Server-side fetch avoids CORS/auth complexity.

### 4. Client-side quota pre-check

**Decision:** Before `handleAiAction` fires the fetch to `/api/ai/transform`, call `/api/ai/quota` first. If `used >= limit`, show the error in `setAiProgress` immediately without making the transform request.

**Rationale:** Avoids wasting Gemini API calls and gives instant feedback. The server-side check remains as the authoritative guard (race conditions are acceptable — worst case a request succeeds when the indicator showed 0 remaining).

## Risks / Trade-offs

- **[Stale quota display]** → Mitigation: `mutate()` after every AI action; SWR `revalidateOnFocus` ensures tab switch refreshes.
- **[Race condition: pre-check passes but server rejects]** → Mitigation: Server-side check is authoritative; client pre-check is UX optimization only. Error from 429 is still handled gracefully.
- **[7-day history has gaps for new users]** → Mitigation: Fill missing dates with 0 count in the query, display all 7 bars consistently.
