# Undo/Redo, Keyboard Shortcuts & Documentation - Tasks

## Phase 1: Undo/Redo
- [x] Install `zundo` npm package
- [x] Wrap Zustand store with `temporal` middleware in `editor-store.ts`
- [x] Configure `partialize` to track only sprites, bins, animation.frames, packingConfig
- [x] Export `useTemporalStore` hook for undo/redo access
- [x] Fix undo button in `EditorToolbar.tsx` — wire to `undo()`, remove incorrect `handleNew` binding
- [x] Fix redo button in `EditorToolbar.tsx` — wire to `redo()`
- [x] Disable undo/redo buttons when history is empty

## Phase 2: Keyboard Shortcuts
- [x] Add `Cmd+Z` handler in `use-keyboard-shortcuts.ts` to call `undo()`
- [x] Add `Cmd+Shift+Z` handler to call `redo()`
- [x] Add `Cmd+E` handler to trigger export download
- [x] Add `Cmd+A` handler — add all sequence sprites to animation frames (replaces old Cmd+Shift+A behavior)
- [x] Keep `Cmd+Shift+A` — add selected sprite to animation (preserved existing behavior)

## Phase 3: Documentation
- [x] Rewrite keyboard shortcuts section in `src/app/docs/page.tsx` with all real shortcuts
- [x] Group shortcuts by category (General, Sprites, Animation, View, Engine Sync)
- [x] Update AI quotas to FREE=1/day, PRO=10/day, TEAM=500/day
- [x] Remove all placeholder/fake elements

## Verification
- [x] Run `npx next build` to confirm no type or build errors
