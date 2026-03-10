# Missing Frontend UI — Tasks

## 1. Normal Map Preview Toggle

- [ ] **AnimationPreview.tsx**: Add `showNormalMap` state, toggle button in label area, render `normalMap` when toggled
- [ ] **AssetPreview.tsx**: Add `showNormalMap` state, toggle button in label area, render `normalMap` when toggled

## 2. Trim Metadata Display

- [ ] **SpriteList.tsx**: Add inline trim badge showing "TRIM" + savings% for trimmed sprites
- [ ] **SettingsPanel.tsx**: Add "Selected Sprite" info section showing trim rect details

## 3. Plugin Download Buttons

- [ ] **src/lib/plugin-bundler.ts**: Create utility with bundled plugin contents + zip download function
- [ ] **SettingsPanel.tsx**: Add "Download Plugins" sub-section with Godot + Unity buttons in Engine Sync area

## 4. CLI Config Export

- [ ] **src/lib/config-export.ts**: Create utility to generate SpriteForgeConfig JSON from editor state
- [ ] **SettingsPanel.tsx**: Add "Export .spriteforge.json" button in Export section

## 5. Verification

- [ ] Run `npx next build` and verify no TypeScript/build errors
- [ ] Verify all new UI elements match existing dark theme + cyan accent design system
