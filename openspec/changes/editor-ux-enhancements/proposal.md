# Editor UX Enhancements

## Summary
Add three major UX improvements to the SpriteForge editor: pivot point editing, filename auto-tagging on import, and visual atlas diff comparison.

## Motivation
Game developers need per-sprite pivot points for correct rotation/animation origins, batch-import organization through filename conventions, and visual diffing when iterating on atlas layouts.

## Scope
- **Phase 1: Pivot Point Editor** - Per-sprite pivot (normalized 0..1), visual crosshair overlay, export in JSON/XML formats
- **Phase 2: Filename Auto-Tagging** - Regex-based filename parsing with named capture groups, auto-grouping by tags
- **Phase 3: Visual Atlas Diff** - pixelmatch-based comparison of before/after atlas PNGs, side-by-side and overlay views
