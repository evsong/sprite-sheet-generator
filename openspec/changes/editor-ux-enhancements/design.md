# Editor UX Enhancements - Design

## Phase 1: Pivot Point Editor

### Data Model
- `SpriteItem.pivot: { x: number, y: number }` - normalized 0..1, default `{ x: 0.5, y: 0.5 }` (center)
- `EditorState.pivotEditMode: boolean` - toggles overlay visibility

### Components
- **PivotOverlay** (`src/components/editor/PivotOverlay.tsx`) - Transparent div over canvas with draggable crosshair, pointer capture for smooth drag
- **EditorCanvas** - Renders small pivot crosshairs on all sprites when pivotEditMode active (dimmed for unselected, bright cyan for selected)
- **AnimationPreview** - Shows pivot crosshair on current frame when pivotEditMode active
- **SettingsPanel** - Pivot section with toggle, X/Y numeric inputs, and 9-point preset grid (TL/TC/TR/ML/C/MR/BL/BC/BR)
- **EditorToolbar** - Crosshair icon button to toggle pivotEditMode

### Export
- JSON Array/Hash templates include `"pivot": { "x": ..., "y": ... }` per frame
- Phaser 3 template includes pivot
- Unity .tpsheet uses actual pivot values instead of hardcoded 0.5
- Generic XML uses pivot values for pX/pY attributes

## Phase 2: Filename Auto-Tagging

### Parser (`src/lib/filename-parser.ts`)
- `parseFilename(filename, pattern)` - Applies regex with named capture groups
- `groupByTag(sprites, tagKey)` / `groupByTags(sprites)` - Group sprites by extracted tags
- Built-in presets: `name_action_index`, `name-index`, `action_index`, custom

### Integration
- `SpriteItem.tags?: Record<string, string>` - parsed tag data
- `EditorState.filenamePattern: string` - current regex pattern
- `EditorState.autoTagOnImport: boolean` - toggle for automatic parsing
- Tags displayed as purple badges in sprite list
- Pattern configuration in SettingsPanel with preset dropdown + custom input

## Phase 3: Visual Atlas Diff

### Dependencies
- `pixelmatch` (MIT) - pixel-level image comparison

### Data Model
- `DiffState { active, before, after, diff: ImageData, viewMode, mismatchCount }`

### Components
- **AtlasDiffViewer** (`src/components/editor/AtlasDiffViewer.tsx`) - Full-screen modal with side-by-side and overlay views
- **CompareButton** - Toolbar button that opens file picker for "before" atlas image

### Flow
1. User clicks "Compare" in toolbar
2. File picker opens for previous atlas PNG
3. Current atlas rendered via `renderBinToCanvas()`
4. `pixelmatch()` computes pixel diff
5. Results shown in modal with view mode toggle and mismatch stats
