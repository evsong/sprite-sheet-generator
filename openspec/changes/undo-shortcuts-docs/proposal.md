# Undo/Redo, Keyboard Shortcuts & Documentation Accuracy

## Summary
Implement real undo/redo using zundo (zustand undo middleware), implement all missing keyboard shortcuts (Cmd+Z, Cmd+Shift+Z, Cmd+E, Cmd+A), fix EditorToolbar undo/redo buttons, and rewrite the Documentation page to accurately list ALL real shortcuts while removing all placeholder/fake elements.

## Motivation
The editor currently has non-functional undo/redo buttons (the undo button incorrectly calls `handleNew`, the redo button has no handler at all), and no undo/redo history stack exists. The Documentation page at `/docs` lists shortcuts that are not implemented (Cmd+Z, Cmd+Shift+Z, Cmd+E, Cmd+A "Select all") while omitting many real shortcuts that do exist (Cmd+D, Escape, Space, Cmd+=/-, O, Cmd+Shift+S). This creates a confusing experience for users.

## Scope
- **Phase 1: Undo/Redo** - Integrate zundo temporal middleware into the Zustand store, wire toolbar buttons, add Cmd+Z / Cmd+Shift+Z shortcuts
- **Phase 2: Missing Shortcuts** - Implement Cmd+E (export), Cmd+A (add all sprites to animation frames)
- **Phase 3: Documentation** - Complete rewrite of keyboard shortcuts section with ALL real shortcuts grouped by category, fix AI quotas to match current limits
