## Why

Three of the five AI sprite transform operations (Recolor, Upscale 2x, Remove BG) are being routed through a server-side Gemini generative model, costing 30-90 seconds per call and consuming AI quota, despite being simple deterministic image operations on tiny 32-128px sprites. The AI model also introduces quality regressions for pixel art: dirty pixels, broken pixel grids, and palette inconsistency. These operations should run client-side for instant results, zero quota cost, and superior pixel art fidelity.

## What Changes

- **Move Recolor to client-side**: Extract sprite palette via Canvas pixel analysis, present a color-mapping UI, and apply pixel-level color replacement entirely in-browser.
- **Move Upscale 2x to client-side**: Use nearest-neighbor Canvas scaling (preserving pixel art crispness) instead of AI upscaling. Future enhancement: xBRZ algorithm option.
- **Move Remove BG to client-side**: Reuse the existing RMBG-1.4 WASM pipeline already in `src/lib/bg-removal.ts` (currently used only in the generate flow). Add chroma key fast-path for solid-color backgrounds.
- **Keep AI Variants server-side**: Generating pose/style variations genuinely requires generative AI (Gemini image-to-image).
- **Keep AI Extend Frames server-side**: Generating next animation frames requires generative understanding of motion and character continuity.
- **Restructure context menu**: Separate client-side "Tools" (Recolor, Upscale, Remove BG — no "AI" prefix, cyan accent) from server-side "AI" actions (Variants, Extend Frames — amber accent, quota-consuming).
- **Quota indicator unchanged for client ops**: Client-side operations do not decrement the daily AI quota counter.
- **Remove 3 actions from server route**: The `/api/ai/transform` endpoint Action type narrows from `"variants" | "recolor" | "upscale" | "extend-frames"` to `"variants" | "extend-frames"`. **BREAKING** for any external consumers hitting the recolor/upscale actions directly (internal-only API, no external consumers known).

## Capabilities

### New Capabilities
- `client-sprite-tools`: Client-side sprite manipulation tools — Recolor (palette extraction + color mapping), Upscale 2x (nearest-neighbor scaling), and Remove BG (RMBG-1.4 WASM reuse + chroma key). Covers the new modules, context menu "Tools" section, and handler split (handleToolAction vs handleAiAction).

### Modified Capabilities
- `editor-asset-management`: Context menu structure changes — AI items split into "Tools" section (client-side, no quota) and "AI" section (server-side, quota-consuming). Item labels drop "AI" prefix for client-side ops. AssetGrid context menu gets the same restructuring.

## Impact

- **Frontend modules**: New `src/lib/recolor.ts`, new `src/lib/upscale.ts`, reuse existing `src/lib/bg-removal.ts`
- **Components**: `src/components/editor/SpriteList.tsx` and `src/components/editor/AssetGrid.tsx` — context menu restructuring, new `handleToolAction` handler, modified `handleAiAction` (fewer cases)
- **API route**: `src/app/api/ai/transform/route.ts` — remove `recolor` and `upscale` from Action type and promptMap
- **Store**: No changes to `editor-store.ts` (AiProgress is only used for server-side ops; client-side ops are instant and need no progress tracking)
- **Dependencies**: No new npm dependencies. Canvas API and existing WASM model are sufficient.
- **Quota system**: No changes — client-side ops simply bypass the quota check/record flow entirely
