## 1. Store Layer

- [x] 1.1 Add `activeTab: "frames" | "assets"` state and `setActiveTab` action to `editor-store.ts`
- [x] 1.2 Add optional `mode?: "sequence" | "atlas"` field to `SpriteItem` interface
- [x] 1.3 Update `generate-sprite-sheet.ts` to write `mode` into each created SpriteItem based on generation options

## 2. SpriteList Tab Switcher

- [x] 2.1 Add Frames/Assets tab bar to top of `SpriteList.tsx` (amber highlight style, matching AiGenerateModal toggle)
- [x] 2.2 Filter sprite list by `activeTab` — Frames shows `mode !== "atlas"`, Assets shows `mode === "atlas"`
- [x] 2.3 Update sprite count header to reflect filtered list ("Frames (N)" / "Assets (N)")

## 3. SpriteList Contextual Adaptation

- [x] 3.1 Adapt quick-generate textarea placeholder based on `activeTab` ("Pixel knight, 8 frames..." vs "Potion set, 4 items...")
- [x] 3.2 Adapt import drop zone text based on `activeTab` ("Drop PNG / JPG frames" vs "Drop PNG / JPG assets")
- [x] 3.3 Assign `mode` to manually imported sprites based on `activeTab`
- [x] 3.4 Hide "Add to Animation" and "AI Extend Frames" from context menu when sprite `mode === "atlas"`

## 4. AiGenerateModal Default Mode

- [x] 4.1 Add `defaultMode?: GenerationMode` prop to `AiGenerateModal`
- [x] 4.2 Initialize modal mode state from `defaultMode` prop (fallback to "sequence")
- [x] 4.3 Pass `activeTab`-derived mode from SpriteList when opening the modal

## 5. AssetGrid Component

- [x] 5.1 Create `src/components/editor/AssetGrid.tsx` — flex-wrap grid of 48x48 thumbnails for atlas sprites
- [x] 5.2 Implement click-to-select with cyan highlight border
- [x] 5.3 Implement right-click context menu (reuse SpriteList menu logic, without animation items)
- [x] 5.4 Add empty state message: "Generate or import assets to see them here"

## 6. Editor Layout Integration

- [x] 6.1 Update editor page layout to conditionally render `AnimationTimeline` or `AssetGrid` based on `activeTab`
- [x] 6.2 Update `EditorToolbar.tsx` stats to show "N frames" or "N assets" based on `activeTab`

## 7. Backward Compatibility

- [x] 7.1 Verify old project files (no `mode` field) load correctly — all sprites appear in Frames tab
- [x] 7.2 Verify generation history entries without `mode` default to "sequence"
