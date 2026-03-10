# Packing Pipeline v2 - Tasks

## Phase 1: Trim + Offset Metadata
- [x] Verify trimRect, sourceSize fields on SpriteItem interface (already present)
- [x] Verify trimTransparency() scans alpha boundaries correctly (already present)
- [x] Verify packer uses trimmed dimensions for layout (already present)
- [x] Verify export JSON includes spriteSourceSize, sourceSize, trimmed fields (already present)

## Phase 2: Multi-Atlas Pagination
- [x] Add `binIndex` to PackedRect interface in editor-store.ts
- [x] Add `maxPages` to PackingConfig interface in editor-store.ts (default: 0 = unlimited)
- [x] Update packSprites() in packer.ts to include binIndex and respect maxPages
- [x] Update packer.worker.ts to include binIndex and maxPages support
- [x] Update use-auto-pack.ts to pass maxPages to worker
- [x] Create BinPageTabs component for switching between atlas pages
- [x] Integrate BinPageTabs into EditorCanvas layout
- [x] Add Max Pages select control to SettingsPanel
- [x] Add Pages count to SettingsPanel stats section
- [x] Update StatusBar to show current page when multiple bins exist
- [x] Update export templates (JSON Array, JSON Hash) to include related_multi_packs
- [x] Update exporter.ts buildTemplateContext() to support relatedPacks parameter
- [x] Update exportSpriteSheet() to generate cross-references between pages

## Phase 3: Smart Folder Scan
- [x] Create src/lib/folder-scanner.ts with webkitGetAsEntry() API support
- [x] Implement recursive directory scanning (scanDataTransfer)
- [x] Implement sequence group detection (detectSequenceGroups)
- [x] Add `group` field to SpriteItem interface
- [x] Update SpriteList drop handler to detect and handle directory drops
- [x] Add handleDirectoryDrop callback to SpriteList
- [x] Update drop zone text to mention folder support
- [x] Add group headers in SpriteList for folder-grouped sprites
- [x] Auto-create animation sequences from subfolder groupings
- [x] Update EditorCanvas drop handler to use folder scanner
- [x] Import React for Fragment usage in SpriteList

## Verification
- [x] TypeScript compilation passes (npx tsc --noEmit)
- [x] Next.js build succeeds (npx next build)
