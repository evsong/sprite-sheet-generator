## 1. Quota API Endpoint

- [x] 1.1 Create `src/app/api/ai/quota/route.ts` — GET handler: auth check → query today's AiUsage + last 7 days → return `{ used, limit, tier, resetsAt, history }`
- [x] 1.2 Fill missing dates in 7-day history with `count: 0` so frontend always gets 7 entries

## 2. Settings Page: AI Usage Section

- [x] 2.1 Update `src/app/settings/page.tsx` to fetch AI usage data (today's count + 7-day history) from Prisma and pass as props
- [x] 2.2 Add "AI Usage" section to `src/app/settings/SettingsClient.tsx` between Profile and Billing: progress bar, `{used}/{limit}` label, tier badge, reset time text
- [x] 2.3 Add 7-day usage history bar chart using CSS flexbox bars (no chart library)
- [x] 2.4 Show warning state (red bar + "Daily limit reached") when `used >= limit`

## 3. Editor Toolbar: Quota Indicator

- [x] 3.1 Create `src/components/editor/AiQuotaIndicator.tsx` — useEffect+fetch to get `/api/ai/quota`, display `{remaining}/{limit} AI` pill with color states (default/amber/red)
- [x] 3.2 Mount `AiQuotaIndicator` in `EditorToolbar.tsx`
- [x] 3.3 Export a `mutateQuota()` helper from AiQuotaIndicator for external refetch triggers
- [x] 3.4 Hide indicator when user is not authenticated (check session)

## 4. AI Transform Quota Pre-check

- [x] 4.1 Update `handleAiAction` in `SpriteList.tsx` to pre-check quota via `/api/ai/quota` before calling `/api/ai/transform` — if exhausted, show error via `setAiProgress` without making the transform call
- [x] 4.2 Update `handleAiAction` in `AssetGrid.tsx` with the same pre-check logic
- [x] 4.3 After successful AI transform/generate, call `mutateQuota()` to refresh the toolbar indicator
- [x] 4.4 Fail-open: if pre-check fetch fails (network error), proceed with transform anyway

## 5. UserMenu Link Fix

- [x] 5.1 Update `src/components/auth/UserMenu.tsx` — change Billing link from `/settings` to `/settings#billing`
- [x] 5.2 Add `id="billing"` anchor to the Billing section in `SettingsClient.tsx`

## 6. E2E Testing via Chrome DevTools

- [x] 6.1 Navigate to editor, verify demo sprites load, right-click a sprite to confirm context menu renders with AI actions
- [x] 6.2 Test AI Transform (recolor) on a sprite — verify API call, progress toast, and result sprite added to the editor
- [x] 6.3 Verify quota indicator updates after the transform completes (8/10 AI displayed)
- [x] 6.4 Verify Settings page shows updated usage count after the transform (2/10 with bar chart)
- [x] 6.5 Test quota exhausted state — verify pre-check blocks AI actions with correct error message
