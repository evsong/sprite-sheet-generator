# Editor UX Enhancements - Tasks

## Phase 1: Pivot Point Editor
- [x] Add `PivotPoint` interface and `pivot` field to `SpriteItem` (default `{x: 0.5, y: 0.5}`)
- [x] Add `pivotEditMode` boolean + `setPivotEditMode` action to store
- [x] Create `PivotOverlay` component with draggable crosshair
- [x] Render pivot crosshairs on `EditorCanvas` when pivotEditMode active
- [x] Show pivot in `AnimationPreview`
- [x] Add pivot toggle button to `EditorToolbar`
- [x] Add pivot edit section to `SettingsPanel` (toggle, X/Y inputs, 9-point presets)
- [x] Export pivot data in JSON Array, JSON Hash, Phaser 3, Unity, XML templates
- [x] Include pivot in template context builder (`exporter.ts`)
- [x] Add pivot to all sprite creation sites (demo, AI generate, file import, canvas drop)
- [x] Save/restore pivot in project files

## Phase 2: Filename Auto-Tagging
- [x] Create `src/lib/filename-parser.ts` with `parseFilename()` using regex named capture groups
- [x] Add `groupByTag()` and `groupByTags()` utility functions
- [x] Add `FILENAME_PRESETS` with common patterns
- [x] Add `tags` field to `SpriteItem`
- [x] Add `filenamePattern` and `autoTagOnImport` to store
- [x] Integrate parsing into `SpriteList` file upload handler
- [x] Display tag badges (purple) in sprite list items
- [x] Add pattern config UI in `SettingsPanel` (toggle, preset dropdown, custom input)
- [x] Save/restore tags in project files

## Phase 3: Visual Atlas Diff
- [x] Install `pixelmatch` dependency
- [x] Create `AtlasDiffViewer` component with side-by-side and overlay views
- [x] Create `CompareButton` component for toolbar
- [x] Add `DiffState` interface and state to store
- [x] Implement diff computation using `pixelmatch`
- [x] Add overlay opacity slider for overlay mode
- [x] Display mismatch pixel count and percentage
- [x] Integrate into `EditorToolbar` and `editor/page.tsx`
