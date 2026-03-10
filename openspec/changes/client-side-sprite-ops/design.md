## Context

SpriteForge's editor provides five AI transform actions accessible via right-click context menu on sprites in both `SpriteList.tsx` (frames/assets list) and `AssetGrid.tsx` (bottom asset grid). All five actions currently call `POST /api/ai/transform` which sends the sprite as base64 to Gemini 3 Pro Image via a self-hosted proxy (`GEMINI_PROXY_URL`). Each call takes 30-90 seconds, consumes daily AI quota (tracked by `checkQuota`/`recordUsage`), and requires authentication.

Three of these operations — Recolor, Upscale 2x, Remove BG — are deterministic image manipulations that don't benefit from generative AI. For pixel art sprites (typically 32-128px), the AI model actively degrades quality by introducing sub-pixel artifacts, breaking grid alignment, and altering palette consistency.

The existing codebase already has a client-side background removal pipeline in `src/lib/bg-removal.ts` (RMBG-1.4 WASM + green screen + checkerboard detection), but it is only used in the AI generation post-processing flow, not exposed to the context menu. The context menu's "AI Remove BG" currently goes through the server, which is redundant.

**Key source files:**
- `src/app/api/ai/transform/route.ts` — server endpoint, Action type union, promptMap, geminiImageToImage
- `src/components/editor/SpriteList.tsx` — SpriteList context menu with `handleAiAction` and `handleRemoveBg`
- `src/components/editor/AssetGrid.tsx` — AssetGrid context menu with `handleAiAction` and `handleRemoveBg`
- `src/lib/bg-removal.ts` — RMBG-1.4 WASM, green screen, checkerboard removal
- `src/stores/editor-store.ts` — `AiProgress` state, `SpriteItem` type
- `src/components/editor/AiQuotaIndicator.tsx` — `mutateQuota()` for refreshing quota display

## Goals / Non-Goals

**Goals:**
- Recolor, Upscale 2x, and Remove BG execute entirely client-side with zero network calls
- Response time drops from 30-90s to <100ms (Recolor, Upscale) or <3s (Remove BG with WASM model load)
- No AI quota consumption for these three operations
- Pixel art quality is preserved or improved (no dirty pixels, grid stays aligned)
- Context menu visually distinguishes local "Tools" from server-side "AI" actions
- Server-side API route is simplified (fewer branches, cleaner Action type)

**Non-Goals:**
- Advanced recolor UI (HSL sliders, gradient maps, multi-palette presets) — future enhancement
- xBRZ or HQx upscale algorithms — nearest-neighbor is correct for pixel art; xBRZ can be added later
- Bilinear/bicubic upscale option for non-pixel-art — out of scope
- Batch tool operations (apply recolor to all sprites) — future enhancement
- Removing the `/api/ai/transform` endpoint entirely — it is still needed for Variants and Extend Frames

## Decisions

### Decision 1: Client-side Recolor via Canvas pixel manipulation

**Approach:** Extract all unique colors from the sprite by iterating ImageData pixels (ignoring fully transparent pixels). Present a palette swatch UI where the user can click a source color and pick a replacement color. Apply replacement by iterating pixels again and swapping matching colors (with optional tolerance for anti-aliased edges).

**Why not WebGL shader:** Sprites are tiny (32-128px). A shader is overkill and adds WebGL context management complexity. Canvas ImageData iteration on a 128x128 sprite (16K pixels) completes in <1ms.

**Why not HSL shift:** HSL shifting affects all colors uniformly and can't selectively remap individual palette entries. Pixel art typically uses deliberate per-color palettes where each color has semantic meaning.

**Module:** New file `src/lib/recolor.ts` exporting:
- `extractPalette(image: HTMLImageElement, maxColors?: number): string[]` — returns hex color array (deduped, sorted by frequency, alpha > 0 only)
- `applyRecolor(image: HTMLImageElement, colorMap: Map<string, string>): { image: HTMLImageElement; blob: Blob }` — pixel-level replacement

**UX flow:** User right-clicks → "Recolor" → a small popover/modal appears showing extracted palette → user clicks source color → color picker opens for target color → applies immediately → new sprite added to list.

For the initial implementation, a simpler approach: auto-generate a random palette shift (rotate hue by random offset per color) to match the current "one-click" UX. The interactive palette-mapping UI can be a follow-up.

### Decision 2: Client-side Upscale via nearest-neighbor Canvas scaling

**Approach:** Create a canvas at 2x dimensions. Draw the source sprite scaled up with `imageSmoothingEnabled = false` (nearest-neighbor). This preserves every pixel as a crisp 2x2 block — the correct behavior for pixel art.

**Why not xBRZ:** xBRZ is a more sophisticated pixel art scaler that smooths edges intelligently, but it adds complexity (need a JS/WASM implementation) and some artists prefer the raw nearest-neighbor look. xBRZ can be added as an option later.

**Module:** New file `src/lib/upscale.ts` exporting:
- `upscaleNearest(image: HTMLImageElement, factor?: number): { image: HTMLImageElement; blob: Blob }` — defaults to 2x

### Decision 3: Reuse existing bg-removal.ts for Remove BG

**Approach:** `SpriteList.tsx` already has a `handleRemoveBg` function that calls `removeBackground()` from `src/lib/bg-removal.ts`. The `AssetGrid.tsx` has an identical implementation. The context menu currently labels this "AI Remove BG" which is misleading since `removeBackground` uses client-side RMBG-1.4 WASM (not the server Gemini API).

The only change needed: rename the menu label from "AI Remove BG" to "Remove BG" and move it into the "Tools" section. No code changes to `bg-removal.ts` itself. The existing `handleRemoveBg` callback already works correctly.

Note: `handleRemoveBg` in both SpriteList and AssetGrid already calls `removeBackground()` client-side. The server-side transform route doesn't even have a "remove-bg" action — it was never routed through Gemini. This is purely a UX relabeling to correctly categorize it as a local tool.

### Decision 4: Context menu restructuring

Current menu structure (SpriteList):
```
Duplicate | Rename | Delete
---
AI Variants | AI Recolor | AI Upscale 2x | AI Remove BG
---
Add to Animation | AI Extend Frames
```

New structure:
```
Duplicate | Rename | Delete
--- [Tools section header] ---
Recolor | Upscale 2x | Remove BG          (cyan accent, no "AI" prefix)
--- [AI section header] ---
AI Variants                                 (amber accent)
---
Add to Animation | AI Extend Frames         (amber accent)
```

For AssetGrid (no animation items):
```
Delete
--- [Tools section header] ---
Recolor | Upscale 2x | Remove BG
--- [AI section header] ---
AI Variants
```

Section headers are optional tiny labels (like the existing "Import" / "AI Generate" headers in SpriteList) to visually group items. The key visual distinction is color: cyan for instant tools, amber for AI.

### Decision 5: Handler split — handleToolAction vs handleAiAction

**SpriteList.tsx:**
- `handleAiAction` narrows to only `"variants" | "extend-frames"`. Removes `"recolor"` and `"upscale"` cases. Still does quota pre-check, calls `/api/ai/transform`, shows `AiProgress`, calls `mutateQuota()`.
- New `handleToolAction` callback for `"recolor" | "upscale"`. Calls the new client-side modules directly. No quota check, no network call, no AiProgress. Just creates the result sprite and calls `addSprites()`.
- `handleRemoveBg` stays as-is (already client-side).

**AssetGrid.tsx:**
- Same split. `handleAiAction` narrows to `"variants"` only. New `handleToolAction` for `"recolor" | "upscale"`.
- `handleRemoveBg` stays as-is.

### Decision 6: Server route cleanup

`src/app/api/ai/transform/route.ts`:
- `Action` type changes from `"variants" | "recolor" | "upscale" | "extend-frames"` to `"variants" | "extend-frames"`
- Remove `recolor` and `upscale` entries from `promptMap`
- Add validation: if action is not in the new set, return 400

## Risks / Trade-offs

**[Risk] Initial recolor UX is simplistic (auto hue-shift)** → Mitigation: Ship auto-recolor first as a quick win matching the current one-click pattern. Interactive palette picker is a natural follow-up that doesn't require architectural changes.

**[Risk] RMBG-1.4 WASM first-load is slow (~2-5s to download and initialize model)** → Mitigation: This is the existing behavior — `handleRemoveBg` already triggers WASM load on first use. No regression. The model is cached after first load. Can add a pre-warm strategy later.

**[Risk] Breaking change to /api/ai/transform if external consumers exist** → Mitigation: This is an internal-only API with no known external consumers. The Action type narrowing will return a 400 for removed actions, which is a clear error rather than silent failure.

**[Risk] Nearest-neighbor upscale may not suit all art styles** → Mitigation: Nearest-neighbor is universally correct for pixel art (SpriteForge's primary audience). For non-pixel-art use cases, bilinear upscale or xBRZ can be added as options in a future change.
