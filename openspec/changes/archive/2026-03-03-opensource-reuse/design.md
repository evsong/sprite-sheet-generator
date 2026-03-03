## Context

SpriteForge MVP has 53/73 tasks complete. This change integrates open-source libraries to implement 4 remaining features more efficiently than building from scratch.

Key constraint: All image processing stays client-side (privacy, zero server cost).

## Goals / Non-Goals

**Goals:**
- Replace server-side AI Remove BG with client-side Transformers.js (zero API cost)
- Expand export formats from 6 → 15+ using Mustache templates from free-tex-packer-core
- Implement onion skin overlay referencing Piskel's proven architecture
- Move packing to Web Worker for large sprite sets

**Non-Goals:**
- Replacing maxrects-packer (it works well, free-tex-packer-core uses the same lib)
- Building a full pixel art editor (Piskel territory)
- Server-side background removal

## Decisions

### D1: Transformers.js for Background Removal (not imgly)

Two options:
- `imgly/background-removal-js` (6.9k⭐) — AGPL-3.0 license, incompatible with commercial SaaS
- `addyosmani/bg-remove` (922⭐) — MIT license, uses same Transformers.js + RMBG-1.4

Choose: **Transformers.js directly** (the underlying lib bg-remove uses). We only need the inference call, not the full React app. Install `@huggingface/transformers` and call the pipeline directly.

Model: RMBG-1.4 (~40MB, cached in IndexedDB after first download).

### D2: Mustache Templates for Export (not full free-tex-packer-core)

free-tex-packer-core depends on Jimp (Node.js image processing) — too heavy for browser. But its `.mst` template files are pure Mustache strings, zero dependencies.

Approach: Copy the 15 `.mst` template files, install `mustache` (~3KB gzipped), build a template renderer that maps our PackedBin data to the template context format.

### D3: Onion Skin — Separate Canvas Layer

Reference Piskel's OnionSkinRenderer: render previous/next frames on a dedicated canvas element positioned behind the main canvas. Use `globalAlpha` for opacity control.

Implementation: Add `<canvas>` element in EditorCanvas component, z-indexed between grid background and main sprite canvas. Only render when paused + onion skin enabled.

### D4: Web Worker — Conditional Offload

Create `src/workers/packer.worker.ts`. Import maxrects-packer inside worker. Post sprite dimensions + config, receive packed bins.

Use `useAutoPack` hook to decide: count > 50 → worker, else → main thread. Terminate previous worker on config change.

## Architecture

```
src/
├── lib/
│   ├── exporter.ts          # Refactor: Mustache template renderer
│   ├── bg-removal.ts        # NEW: Transformers.js wrapper
│   └── templates/            # NEW: .mst files from free-tex-packer-core
│       ├── JsonHash.mst
│       ├── Phaser3.mst
│       ├── Spine.mst
│       ├── Starling.mst
│       ├── Cocos2d.mst
│       ├── Unity3D.mst
│       ├── GodotAtlas.mst
│       ├── GodotTileset.mst
│       ├── Unreal.mst
│       ├── UIKit.mst
│       ├── Egret2D.mst
│       ├── Css.mst
│       ├── XML.mst
│       └── ...
├── workers/
│   └── packer.worker.ts     # NEW: Web Worker for maxrects-packer
├── hooks/
│   └── use-auto-pack.ts     # MODIFY: conditional worker offload
├── components/editor/
│   ├── EditorCanvas.tsx      # MODIFY: add onion skin canvas layer
│   ├── OnionSkinLayer.tsx    # NEW: onion skin rendering component
│   ├── SettingsPanel.tsx     # MODIFY: expanded format dropdown
│   └── SpriteList.tsx        # MODIFY: "Remove Background" uses client-side
└── stores/
    └── editor-store.ts       # MODIFY: onionSkinEnabled state
```

## Dependencies

| Package | Size (gzip) | Purpose |
|---------|-------------|---------|
| `mustache` | ~3KB | Template rendering for export formats |
| `@huggingface/transformers` | ~50KB + model | Client-side ML inference |

Note: maxrects-packer already installed. No other new deps needed.
