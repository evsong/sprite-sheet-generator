# Packing Pipeline v2

## Problem
The current packing pipeline has three limitations:
1. **Trim metadata** is computed but not fully exposed in all export formats (spriteSourceSize, sourceSize, trimmed fields for TexturePacker compatibility)
2. **Single atlas only** - when sprites overflow a single texture, there is no multi-atlas pagination with cross-referencing
3. **No folder/directory import** - users must manually drag individual files; there is no way to drop a folder and have subfolders auto-detected as animation groups

## Solution
Three-phase enhancement to the packing pipeline:

### Phase 1: Trim + Offset Metadata
- trimRect and sourceSize already exist on SpriteItem; ensure all export templates include spriteSourceSize, sourceSize, and trimmed fields
- The trimTransparency function scans alpha boundaries and produces correct offset metadata

### Phase 2: Multi-Atlas Pagination
- Add binIndex to PackedRect for tracking which page each sprite lands on
- Add maxPages to PackingConfig for capping the number of atlas pages
- Add BinPageTabs UI component for switching between pages
- Export JSON includes related_multi_packs array (TexturePacker-compatible)

### Phase 3: Smart Folder Scan
- Create folder-scanner.ts using webkitGetAsEntry() File System Access API
- Recursively scan dropped directories, preserving subfolder structure
- Add group field to SpriteItem for folder-based grouping
- Auto-create animation sequences from subfolder groupings
- Show group headers in sprite list

## Impact
- Full TexturePacker-compatible JSON export with trim metadata
- Support for large sprite sets that span multiple atlas pages
- Drag-and-drop workflow for entire asset folders with auto-sequencing
