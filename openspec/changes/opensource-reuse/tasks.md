## 1. Client Background Removal

- [x] 1.1 Install `@huggingface/transformers` dependency
- [x] 1.2 Create `src/lib/bg-removal.ts` — wrapper function: load RMBG-1.4 pipeline, accept HTMLImageElement, return transparent PNG Blob
- [x] 1.3 Add model download progress callback support (for UI progress indicator)
- [x] 1.4 Update SpriteList context menu: replace "AI Remove BG" API call with client-side `removeBackground()` from bg-removal.ts
- [x] 1.5 Show processing spinner on sprite thumbnail during bg removal
- [x] 1.6 Auto-repack after background removal completes

## 2. Export Engine — Mustache Templates

- [x] 2.1 Install `mustache` dependency
- [x] 2.2 Copy 15 `.mst` template files from free-tex-packer-core into `src/lib/templates/`
- [x] 2.3 Create template context mapper: convert PackedBin + SpriteItem[] to free-tex-packer template variable format (rects, config, appInfo)
- [x] 2.4 Refactor `exporter.ts`: replace hardcoded format functions with Mustache template renderer
- [x] 2.5 Verify existing 6 formats produce identical output after migration
- [x] 2.6 Update SettingsPanel export format dropdown: add all 15+ formats, grouped by engine/platform
- [x] 2.7 Update `generateCodeSnippet()` to cover new formats (Spine, Cocos2d, Starling, Unreal)

## 3. Onion Skin Overlay

- [x] 3.1 Add `onionSkinEnabled` state + toggle action to editor-store
- [x] 3.2 Create `OnionSkinLayer.tsx` component: renders previous frame (30% opacity, blue tint) and next frame (15% opacity, red tint) on a canvas
- [x] 3.3 Integrate OnionSkinLayer into EditorCanvas, z-indexed between grid and main canvas
- [x] 3.4 Add onion skin toggle button in AnimationTimeline controls
- [x] 3.5 Add keyboard shortcut `O` to toggle onion skin
- [x] 3.6 Hide onion skin during animation playback, show when paused

## 4. Web Worker Packing

- [x] 4.1 Create `src/workers/packer.worker.ts` — import maxrects-packer, listen for messages, post packed results
- [x] 4.2 Configure Next.js webpack for worker file bundling
- [x] 4.3 Modify `use-auto-pack.ts`: if sprites.length > 50, offload to worker; else pack on main thread
- [x] 4.4 Add packing progress indicator in toolbar when worker is active
- [x] 4.5 Implement worker cancellation on config change (terminate + restart)
- [x] 4.6 Add fallback: if worker fails to initialize, use main thread with console warning
