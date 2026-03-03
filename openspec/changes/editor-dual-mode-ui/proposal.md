## Why

The dual-mode generation backend (sequence + atlas) was shipped but the editor UI still treats all sprites as animation frames. Atlas-generated items show irrelevant animation controls (timeline, "Add to Animation", "Extend Frames"), and there's no visual separation between animation frames and static asset collections. This creates a confusing UX where the editor's UI contradicts its own generation capabilities.

## What Changes

- Add **Frames | Assets** tab switcher to the left SpriteList panel, filtering sprites by their generation mode
- Bottom area **conditionally renders**: AnimationTimeline (Frames tab) or a new AssetGrid thumbnail browser (Assets tab)
- Right-click context menu hides animation-specific items ("Add to Animation", "AI Extend Frames") for atlas sprites
- SpriteList quick-generate area adapts placeholder text and auto-presets Modal mode based on active tab
- EditorToolbar stats text reflects active tab ("N frames" vs "N assets")
- Each `SpriteItem` gets a `mode` field ("sequence" | "atlas") assigned at generation time
- `AiGenerateModal` accepts a `defaultMode` prop so it opens in the correct mode from the active tab
- Manual imports inherit mode from the currently active tab

## Capabilities

### New Capabilities
- `editor-asset-management`: Tab-based separation of animation frames and atlas assets in the editor, including the AssetGrid bottom panel and mode-aware context menus

### Modified Capabilities
- `dual-mode-generation`: SpriteItem now carries a `mode` field; generate-sprite-sheet writes it at creation time; AiGenerateModal accepts `defaultMode` prop

## Impact

- **Store**: `editor-store.ts` — new `activeTab` state + `SpriteItem.mode` field
- **Components modified**: `SpriteList.tsx`, `EditorToolbar.tsx`, `AiGenerateModal.tsx`, editor page layout
- **New component**: `AssetGrid.tsx`
- **Components unchanged**: `AnimationTimeline.tsx`, `EditorCanvas.tsx`, `SettingsPanel.tsx`
- **No DB/API/schema changes** — purely frontend
- **Backward compatible**: existing sprites without `mode` default to `"sequence"`
