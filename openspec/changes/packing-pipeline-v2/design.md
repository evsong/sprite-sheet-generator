# Packing Pipeline v2 - Design

## Data Model Changes

### SpriteItem (editor-store.ts)
```typescript
export interface SpriteItem {
  // ... existing fields ...
  group?: string;  // NEW: folder/group name from directory import
}
```

### PackedRect (editor-store.ts)
```typescript
export interface PackedRect {
  // ... existing fields ...
  binIndex: number;  // NEW: which atlas page this rect is packed into
}
```

### PackingConfig (editor-store.ts)
```typescript
export interface PackingConfig {
  // ... existing fields ...
  maxPages: number;  // NEW: 0 = unlimited, >0 = cap atlas page count
}
```

## Phase 1: Trim + Offset Metadata

The existing `trimTransparency()` in packer.ts already computes trimRect and sourceSize. The packer uses trimmed dimensions for layout while preserving source offsets. Export templates already include spriteSourceSize and sourceSize fields. This phase is already implemented in the codebase.

## Phase 2: Multi-Atlas Pagination

### Packer Changes
- Both main-thread `packSprites()` and the web worker respect `maxPages`
- maxrects-packer naturally produces multiple bins when sprites overflow; we slice to maxPages
- Each PackedRect now carries its binIndex

### BinPageTabs Component
- Renders a tab bar when bins.length >= 2
- Each tab shows the page number and switches activeBin
- Positioned between the usage bar and checkerboard in EditorCanvas

### Export Changes
- Multi-bin exports include `related_multi_packs` array in JSON meta
- Each page's JSON references all other pages (TexturePacker format)

## Phase 3: Smart Folder Scan

### folder-scanner.ts
- Uses `webkitGetAsEntry()` API from DataTransferItem
- `scanDataTransfer()`: recursively reads directory trees, returns ScannedFile[]
- `detectSequenceGroups()`: identifies folders with 2+ images as animation sequences
- Files sorted by numeric suffix within groups for proper frame ordering

### SpriteList Integration
- Drop zone detects directory entries via webkitGetAsEntry
- Falls back to flat file handling when no directories present
- Group headers shown in sprite list when sprites have group labels
- Auto-adds sequence group frames to animation timeline

### EditorCanvas Integration
- Canvas drop handler also supports directory drops
- Same folder-scanner logic applied for consistency
