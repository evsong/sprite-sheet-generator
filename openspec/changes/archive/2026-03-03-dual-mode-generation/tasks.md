## 1. Types & Prompt Layer (prompt-templates.ts)

- [x] 1.1 Export `GenerationMode = "sequence" | "atlas"` type
- [x] 1.2 Add `mode: GenerationMode` field to `PromptTemplate` interface, tag existing 8 templates as `mode: "sequence"`
- [x] 1.3 Add 3 atlas templates: Potion Set (`id: "potions"`, icon: "🧪", defaultFrames: 4), Weapon Set (`id: "weapons"`, icon: "⚔️", defaultFrames: 4), Elemental Icons (`id: "elements"`, icon: "🔥", defaultFrames: 4)
- [x] 1.4 Refactor `buildSystemPrompt(userPrompt, frameCount, style, mode)` — extract common base rules, add mode-specific branch: sequence emphasizes consistency/continuous motion/frame flow; atlas emphasizes distinct items/variety/prohibition on animation sequences

## 2. API Layer (route.ts)

- [x] 2.1 Destructure `mode` and `itemCount` from request body alongside existing `prompt, style, count`
- [x] 2.2 Resolve frame count as `count ?? itemCount ?? 1`, validate mode falls back to `"sequence"` if missing or invalid
- [x] 2.3 Pass `mode` to `buildSystemPrompt()` call
- [x] 2.4 Include `mode` in JSON response alongside existing `spriteSheet, frameCount, gridCols, gridRows`

## 3. Generation Pipeline (generate-sprite-sheet.ts)

- [x] 3.1 Add optional `mode?: GenerationMode` to `GenerateOptions` interface (default `"sequence"`)
- [x] 3.2 Include `mode` in the fetch request body to `/api/ai/generate`
- [x] 3.3 Use mode-based sprite naming: `sequence` → `frame-${i+1}`, `atlas` → `item-${i+1}`

## 4. UI Layer (AiGenerateModal.tsx)

- [x] 4.1 Add `mode` state (default `"sequence"`) and segmented toggle UI (Animation / Icon Set) between header and template cards
- [x] 4.2 Filter `PROMPT_TEMPLATES` by current `mode` in template grid
- [x] 4.3 When template is selected via `handleTemplate`, also set mode to the template's mode
- [x] 4.4 Dynamic labels: frame count label shows "Frames (N)" vs "Items (N)", generate button shows "Generate N Frames" vs "Generate N Items", prompt placeholder switches accordingly
- [x] 4.5 Pass `mode` into `generateSpriteSheet()` call
- [x] 4.6 Post-generation behavior split: if `mode === "sequence"` call `addSprites + setAnimationFrames` (current); if `mode === "atlas"` call `addSprites` only
- [x] 4.7 Include `mode` when calling `saveHistory()`

## 5. History Compatibility (generation-history.ts)

- [x] 5.1 Add optional `mode?: GenerationMode` to `HistoryEntry` interface
- [x] 5.2 In `loadHistory()`, map parsed entries to auto-fill `mode: "sequence"` for entries lacking the field
- [x] 5.3 In `handleReuse()` in AiGenerateModal, restore `mode` from history entry (defaulting to `"sequence"`)

## 6. Verification

- [x] 6.1 Run `npm run build` — must pass with zero TypeScript errors
- [ ] 6.2 Manual test: sequence mode generates animation frames, calls setAnimationFrames, behavior identical to pre-change
- [ ] 6.3 Manual test: atlas mode generates distinct items, does NOT write to animation timeline
- [ ] 6.4 Manual test: old localStorage history loads without errors, entries show with mode="sequence"
- [ ] 6.5 Manual test: API call without `mode` param returns sequence behavior
