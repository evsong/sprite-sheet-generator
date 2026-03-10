# Undo/Redo, Keyboard Shortcuts & Documentation - Design

## Phase 1: Undo/Redo with zundo

### Store Integration
- Install `zundo` npm package (zustand temporal middleware)
- Wrap the existing `create<EditorState>()` call with `temporal()` middleware
- Use `partialize` option to only track meaningful state changes:
  - `sprites` array
  - `bins` array
  - `animation.frames` (frame ordering)
  - `packingConfig`
- Exclude transient/UI state from undo tracking:
  - `selectedSpriteId`, `zoom`, `animation.playing`, `animation.currentFrame`
  - `aiProgress`, `aiModalOpen`, `activeTab`, `lastAiParams`
  - `engineSync`, `diffState`, `pivotEditMode`
  - All setter functions
- Set `limit: 50` for history depth
- Use `equality: (past, current) => JSON.stringify(past) === JSON.stringify(current)` to deduplicate

### Temporal Store Access
- `useEditorStore.temporal.getState()` provides `{ undo, redo, pastStates, futureStates }`
- Export a `useTemporalStore` hook from editor-store.ts for React component subscriptions

### Toolbar Button Wiring
- Import temporal store in `EditorToolbar.tsx`
- Wire undo button (currently incorrectly bound to `handleNew`) to `undo()`
- Wire redo button (currently has no handler) to `redo()`
- Disable buttons when `pastStates.length === 0` / `futureStates.length === 0`

## Phase 2: Missing Keyboard Shortcuts

### Cmd+Z / Cmd+Shift+Z (Undo / Redo)
- In `use-keyboard-shortcuts.ts`, import temporal store
- Call `undo()` / `redo()` on respective key combos

### Cmd+E (Export)
- Trigger the same export logic as the "Download .zip" button in SettingsPanel
- Dynamically import `exportSpriteSheet` from `@/lib/exporter`
- Read `bins`, `sprites`, `packingConfig` from store state

### Cmd+A (Add All to Animation)
- Since there's no multi-select in the current UI, Cmd+A adds all sequence-mode sprites to animation frames
- Only adds sprites not already in animation frames to avoid duplicates

## Phase 3: Documentation Rewrite

### Keyboard Shortcuts Section
Replace the current fake shortcuts listing with a comprehensive table grouped by category:
- **General**: Undo (Cmd+Z), Redo (Cmd+Shift+Z), Deselect (Escape), Export (Cmd+E)
- **Sprites**: Delete (Delete/Backspace), Duplicate (Cmd+D), Add all to animation (Cmd+A)
- **Animation**: Play/Pause (Space), Toggle onion skin (O)
- **View**: Zoom in (Cmd+=), Zoom out (Cmd+-), Reset zoom (Cmd+0)
- **Engine Sync**: Manual push (Cmd+Shift+S)

### AI Quotas
Update to match current tier limits: FREE = 1/day, PRO = 10/day, TEAM = 500/day
