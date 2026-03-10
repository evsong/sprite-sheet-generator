## 1. Client-side Recolor Module

- [x] 1.1 Create `src/lib/recolor.ts` with `extractPalette(image: HTMLImageElement, maxColors?: number): string[]` — iterate Canvas ImageData, collect non-transparent pixel colors into a frequency map, deduplicate, sort by frequency descending, apply maxColors limit, return hex array
- [x] 1.2 Implement `applyRecolor(image: HTMLImageElement, colorMap: Map<string, string>): Promise<{ image: HTMLImageElement; blob: Blob }>` — iterate pixels, replace matching colors per colorMap, preserve alpha, return new Image + Blob from canvas.toBlob
- [x] 1.3 Implement `autoRecolor(image: HTMLImageElement): Promise<{ image: HTMLImageElement; blob: Blob }>` — call extractPalette, generate a random hue-shifted color map (rotate each color's hue by a random offset in HSL space), call applyRecolor with the generated map

## 2. Client-side Upscale Module

- [x] 2.1 Create `src/lib/upscale.ts` with `upscaleNearest(image: HTMLImageElement, factor?: number): Promise<{ image: HTMLImageElement; blob: Blob }>` — create canvas at `width * factor` x `height * factor`, set `imageSmoothingEnabled = false`, drawImage scaled, return new Image + Blob

## 3. Context Menu Restructuring — SpriteList

- [x] 3.1 In `SpriteList.tsx`, add `handleToolAction` callback for `"recolor" | "upscale"` — import `autoRecolor` from recolor.ts and `upscaleNearest` from upscale.ts, call the appropriate function, create a new SpriteItem with `isAi: false`, add via `addSprites()`, no quota check, no AiProgress
- [x] 3.2 Narrow `handleAiAction` in SpriteList to only accept `"variants" | "extend-frames"` — remove the `"recolor"` and `"upscale"` branches from the label/total maps and the function signature
- [x] 3.3 Restructure the SpriteList context menu JSX: group Duplicate/Rename/Delete, then separator + Tools section (Recolor, Upscale 2x, Remove BG) using cyan accent (not `ai` prop), then separator + AI section (AI Variants with `ai` prop), then conditional separator + Add to Animation / AI Extend Frames
- [x] 3.4 Update `CtxItem` calls: Remove BG calls existing `handleRemoveBg`, Recolor calls `handleToolAction(id, "recolor")`, Upscale 2x calls `handleToolAction(id, "upscale")`, AI Variants calls `handleAiAction(id, "variants")`, AI Extend Frames calls `handleAiAction(id, "extend-frames")`

## 4. Context Menu Restructuring — AssetGrid

- [x] 4.1 In `AssetGrid.tsx`, add `handleToolAction` callback for `"recolor" | "upscale"` — same pattern as SpriteList but sets `mode: "atlas"` on new sprites
- [x] 4.2 Narrow `handleAiAction` in AssetGrid to only accept `"variants"` — remove `"recolor"` and `"upscale"` branches
- [x] 4.3 Restructure the AssetGrid context menu JSX: Delete, then separator + Tools section (Recolor, Upscale 2x, Remove BG) using cyan accent, then separator + AI section (AI Variants with `ai` prop)
- [x] 4.4 Update CtxItem calls to route to the correct handlers (same pattern as SpriteList task 3.4)

## 5. Context Menu Styling

- [x] 5.1 Add a `tool` prop option to `CtxItem` in both SpriteList and AssetGrid — when `tool` is true, use cyan accent color (`var(--cyan)`) for text and hover, instead of amber. Items with `tool` prop should NOT show "AI" prefix.
- [x] 5.2 Remove "AI" prefix from labels: "AI Recolor" → "Recolor", "AI Upscale 2×" → "Upscale 2×", "AI Remove BG" → "Remove BG"

## 6. Server Route Cleanup

- [x] 6.1 In `src/app/api/ai/transform/route.ts`, change `Action` type from `"variants" | "recolor" | "upscale" | "extend-frames"` to `"variants" | "extend-frames"`
- [x] 6.2 Remove `recolor` and `upscale` entries from the `promptMap` object
- [x] 6.3 Add validation after parsing the request body: if `action` is not `"variants"` or `"extend-frames"`, return `NextResponse.json({ error: "Invalid action" }, { status: 400 })`

## 7. Verification

- [x] 7.1 Run `npm run build` — verify no TypeScript errors from the narrowed Action types and new module imports
- [x] 7.2 Manual test: right-click a sprite → "Recolor" → verify new sprite appears instantly with shifted colors, no network call in DevTools Network tab, quota indicator unchanged
- [x] 7.3 Manual test: right-click a sprite → "Upscale 2x" → verify new sprite is exactly 2x dimensions, pixels are crisp (no blur), no network call, quota indicator unchanged
- [x] 7.4 Manual test: right-click a sprite → "Remove BG" → verify background is removed client-side (WASM or chroma key), no call to `/api/ai/transform`, quota indicator unchanged
- [x] 7.5 Manual test: right-click a sprite → "AI Variants" → unchanged, still calls `/api/ai/transform` (code path verified, not triggered to avoid quota spend)
- [x] 7.6 Manual test: right-click a sequence sprite → "AI Extend Frames" → unchanged, still calls `/api/ai/transform` (code path verified)
- [x] 7.7 Verify context menu visual styling: Recolor/Upscale/Remove BG items show in cyan, AI Variants/Extend Frames show in amber
