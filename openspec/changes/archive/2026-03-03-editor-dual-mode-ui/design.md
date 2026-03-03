## Context

The editor currently has a single-list model: all sprites go into one `SpriteList`, one `AnimationTimeline` at the bottom, and one set of context menu actions. After dual-mode generation (sequence + atlas) shipped, atlas-generated items land in this same pipeline and get exposed to irrelevant animation controls.

Current layout: `EditorToolbar` (top) → `SpriteList` (left) + `EditorCanvas` (center) + `SettingsPanel` (right) → `AnimationTimeline` (bottom).

Editor state lives in Zustand (`editor-store.ts`). No routing or server state involved — purely client-side.

## Goals / Non-Goals

**Goals:**
- Visually separate animation frames from atlas assets via tabs in the left panel
- Bottom area adapts: timeline for frames, grid browser for assets
- Context menus show only relevant actions per sprite mode
- Quick-generate area and Modal auto-adapt to the active tab
- Zero breaking changes to existing sequence workflow

**Non-Goals:**
- No separate packing/export pipelines per mode — all sprites still pack into the same bins
- No DB schema changes or new API endpoints
- No drag-and-drop between tabs (frames ↔ assets transfer)
- No atlas-specific export formats (future work)

## Decisions

### 1. Tab state in Zustand store (not URL/route)

**Choice**: `activeTab: "frames" | "assets"` in `editor-store.ts`

**Why**: Tab is ephemeral UI state, not a navigational concern. No need for URL persistence. Keeps it simple — one `set()` call, components subscribe via selector.

**Alternative considered**: React local state in SpriteList — rejected because the bottom area (AnimationTimeline vs AssetGrid) also needs to read the active tab, and it lives in a sibling component.

### 2. SpriteItem.mode field (not a separate collection)

**Choice**: Add optional `mode?: "sequence" | "atlas"` to `SpriteItem`. Filter in the view layer.

**Why**: Minimal store change. `addSprites` stays the same. The `sprites[]` array remains the single source of truth. Filtering is cheap — we never have >100 sprites.

**Alternative considered**: Two separate arrays (`frames[]` + `assets[]`) — rejected because it would require duplicating every sprite action (add, remove, reorder, select, update) and complicate packing which operates on all sprites.

### 3. AssetGrid as a new component (not a mode of AnimationTimeline)

**Choice**: New `src/components/editor/AssetGrid.tsx`, conditionally rendered in place of `AnimationTimeline`.

**Why**: The two components share almost no logic. Timeline has playback, FPS, onion skin, frame ordering. AssetGrid is a static thumbnail grid. Forcing them into one component would create a messy branching mess.

### 4. AiGenerateModal defaultMode via prop (not store read)

**Choice**: Pass `defaultMode` prop from SpriteList based on `activeTab`.

**Why**: Modal is controlled (open/close via store), but its initial mode should reflect where the user clicked from. A prop is explicit and testable. User can still override mode inside the Modal.

## Risks / Trade-offs

- **[Mixed sprites after tab switch]** User generates atlas items, switches to Frames tab, generates sequence frames — both coexist in the `sprites[]` array. → **Mitigation**: Each tab filters by `mode`. Packing includes all sprites regardless. This is by design.

- **[Manual imports lack mode]** User drags in PNGs — what mode? → **Mitigation**: Inherit from `activeTab`. Frames tab → `mode: "sequence"`, Assets tab → `mode: "atlas"`. Sensible default.

- **[Old projects have no mode field]** Loading a `.spriteforge` project file saved before this change → **Mitigation**: `mode` is optional, defaults to `"sequence"` everywhere. Old sprites appear in Frames tab.
