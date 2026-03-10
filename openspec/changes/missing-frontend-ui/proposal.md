# Missing Frontend UI Elements

## Problem
Several recently implemented features lack proper frontend UI, making them invisible or inaccessible to users despite the backend logic being complete.

## Missing UI Elements

### 1. Normal Map Preview
**Current state:** SettingsPanel has toggles for enabling normal maps, auto-generate, and strength slider. However, there is no way to **see** the generated normal map. The `SpriteItem.normalMap` field exists but is never rendered in any preview component.

**What's needed:** A toggle in AssetPreview/AnimationPreview to switch between viewing the diffuse texture and the normal map. Users need visual feedback that normal maps are being generated correctly.

### 2. Trim Metadata Display
**Current state:** `SpriteItem.trimRect` and `SpriteItem.sourceSize` are populated when trim is enabled, and used correctly in rendering and export. However, the SpriteList only shows `width x height` — it never shows the trim rect coordinates or how much was trimmed.

**What's needed:** When a sprite is trimmed, show the trim dimensions and savings in the sprite list item and/or a detail section in SettingsPanel.

### 3. Plugin Download Buttons
**Current state:** Godot and Unity plugins exist as files under `/plugins/godot/` and `/plugins/unity/`. The Engine Sync section in SettingsPanel lets users configure the WebSocket connection, but there's no way to download the actual plugin files from the UI.

**What's needed:** Download buttons in the Engine Sync section of SettingsPanel for both Godot and Unity plugins.

### 4. CLI Config Export
**Current state:** A CLI skeleton exists at `src/cli/index.ts` with `SpriteForgeConfig` type defined in `src/lib/core-types.ts`. The CLI reads `.spriteforge.json` files. But there's no way to generate this config from the current editor settings.

**What's needed:** A button in SettingsPanel (Export section) or EditorToolbar to export the current packing/compression/normalmap settings as a `.spriteforge.json` config file.

## Non-Issues (Already Complete)
- Multi-atlas pagination: BinPageTabs in EditorCanvas
- Folder scanning: drag-drop + group headers in SpriteList
- Pivot editor: PivotOverlay + settings in SettingsPanel
- Filename auto-tagging: SettingsPanel auto-tag section
- Atlas diff viewer: CompareButton in EditorToolbar
- RGBA4444 compression: Full toggle + preview in SettingsPanel
- WebSocket sync: SyncStatusIndicator + Engine Sync in SettingsPanel
