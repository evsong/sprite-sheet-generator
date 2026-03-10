# Missing Frontend UI — Design

## Design System Reference
- Background: `var(--bg)` (#0A0A0A), `var(--bg-panel)`, `var(--bg-elevated)`
- Border: `var(--border)` (#1a1a1a)
- Text: `var(--text)` (white), `var(--text-dim)`, `var(--text-muted)`
- Accent: `var(--cyan)` (#06B6D4)
- Font: `var(--font-mono)` (JetBrains Mono)
- Section style: `{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }`

---

## 1. Normal Map Preview Toggle

### Location
- **AnimationPreview.tsx** — Add a small toggle button in the top-right corner label area
- **AssetPreview.tsx** — Same toggle for atlas mode

### Component Changes
- Modify `AnimationPreview.tsx`: Add a `[N]` toggle button next to the "Preview" label. When active, render `currentSprite.normalMap` instead of `currentSprite.image`.
- Modify `AssetPreview.tsx`: Same toggle. When active, render `selectedSprite.normalMap` instead of `selectedSprite.image`.
- Use local component state (`useState`) for the toggle — no store changes needed.

### Visual Design
- Toggle button: 16x16px, font-mono 7px, text "N", border 1px solid var(--border)
- Active state: cyan border, cyan text, rgba(6,182,212,0.1) background
- Inactive state: var(--border) border, var(--text-muted) text
- Position: absolute top-right of preview area, next to the label
- When normalMap is null: show "No normal map" message in checkerboard area

---

## 2. Trim Metadata Display

### Location
- **SpriteList.tsx** — Inline trim badge on each trimmed sprite row
- **SettingsPanel.tsx** — Trim info section when a trimmed sprite is selected

### Component Changes

**SpriteList.tsx:**
- After the dimension display (`{sprite.width}x{sprite.height}`), show a trim badge when `sprite.trimmed && sprite.trimRect`.
- Badge format: small "TRIM" label with savings percentage, styled like the existing AI/tag badges.

**SettingsPanel.tsx:**
- Add a "Selected Sprite" section below Sheet Stats (only visible when a sprite is selected).
- Show: original size (sourceSize), trimmed rect (trimRect coordinates), trimmed size, and savings percentage.

### Visual Design
- Trim badge in SpriteList: fontSize 6, color #22C55E (green), background rgba(34,197,94,0.12), padding "0 3px"
- SettingsPanel trim info: standard `S.row` layout with `S.label` and `S.val` styles

---

## 3. Plugin Download Buttons

### Location
- **SettingsPanel.tsx** — Inside the "Engine Sync" section, below the status indicator

### Component Changes
- Add two download buttons to the Engine Sync section in SettingsPanel.
- Each button triggers a client-side ZIP generation of the plugin files.
- Since plugin files are static assets, serve them from `/public/plugins/` and download via fetch + JSZip.

### Implementation Approach
- Create a new API route `/api/plugins/[engine]` that serves the plugin files as a zip.
- Or simpler: bundle the plugin text content and generate zips client-side.
- Chosen approach: Inline the plugin content and generate a zip on-demand. This avoids API routes and keeps it simple.
- Create a utility `src/lib/plugin-bundler.ts` that contains the plugin file contents and can produce a Blob zip.

### Visual Design
- Two buttons side by side under "Download Plugins" sub-header
- Button style: height 20px, padding 0 6px, fontSize 9px, font-mono, border 1px solid var(--border)
- Godot button: shows engine icon + "Godot Plugin"
- Unity button: shows engine icon + "Unity Plugin"
- Hover: border-color var(--text), color var(--text)

---

## 4. CLI Config Export

### Location
- **SettingsPanel.tsx** — Inside the "Export" section, as a secondary button below "Download .zip"

### Component Changes
- Add a "Export CLI Config" button in the Export section.
- On click: read current `packingConfig`, `normalMapEnabled/AutoGenerate/Strength`, and `compressionConfig` from the store, build a `SpriteForgeConfig` JSON object, and download it as `.spriteforge.json`.
- Utility function: `generateCliConfig()` in `src/lib/config-export.ts`.

### Visual Design
- Button: width 100%, height 20px, fontSize 9px, font-mono, uppercase, letter-spacing 0.05em
- Style: border 1px solid var(--border), color var(--text-dim), background transparent
- Hover: border-color var(--text), color var(--text)
- Text: "Export .spriteforge.json"

---

## Files to Create
1. `src/lib/plugin-bundler.ts` — Plugin content + zip generation
2. `src/lib/config-export.ts` — CLI config JSON generation

## Files to Modify
1. `src/components/editor/AnimationPreview.tsx` — Normal map toggle
2. `src/components/editor/AssetPreview.tsx` — Normal map toggle
3. `src/components/editor/SpriteList.tsx` — Trim badge
4. `src/components/editor/SettingsPanel.tsx` — Trim info, plugin downloads, CLI config export
