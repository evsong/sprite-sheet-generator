## ADDED Requirements

### Requirement: Client-side Recolor module
The system SHALL provide a `recolor` module at `src/lib/recolor.ts` that extracts a sprite's color palette and applies pixel-level color replacement entirely in the browser with no server calls.

#### Scenario: Extract palette from sprite
- **WHEN** `extractPalette(image)` is called with an HTMLImageElement
- **THEN** the function SHALL return an array of hex color strings (e.g., `["#FF0000", "#00FF00"]`)
- **THEN** the array SHALL contain only colors with alpha > 0 (transparent pixels excluded)
- **THEN** the array SHALL be sorted by pixel frequency (most common first)
- **THEN** duplicate colors SHALL be deduplicated

#### Scenario: Extract palette with maxColors limit
- **WHEN** `extractPalette(image, 8)` is called with a maxColors parameter
- **THEN** the returned array SHALL contain at most 8 colors
- **THEN** the colors returned SHALL be the 8 most frequent colors in the sprite

#### Scenario: Apply color replacement
- **WHEN** `applyRecolor(image, colorMap)` is called with a Map of source-hex to target-hex entries
- **THEN** the function SHALL return `{ image: HTMLImageElement; blob: Blob }`
- **THEN** every pixel matching a source color in the map SHALL be replaced with the corresponding target color
- **THEN** pixels not matching any source color SHALL remain unchanged
- **THEN** alpha values SHALL be preserved unchanged for all pixels

#### Scenario: Auto-recolor generates random palette shift
- **WHEN** `autoRecolor(image)` is called without an explicit color map
- **THEN** the function SHALL extract the palette, generate a hue-shifted variant, and apply it
- **THEN** the returned image SHALL have visually different colors from the original
- **THEN** the spatial structure (shape, transparency) SHALL be identical to the original

### Requirement: Client-side Upscale module
The system SHALL provide an `upscale` module at `src/lib/upscale.ts` that scales sprites using nearest-neighbor interpolation entirely in the browser with no server calls.

#### Scenario: Upscale 2x with nearest-neighbor
- **WHEN** `upscaleNearest(image)` is called with an HTMLImageElement
- **THEN** the function SHALL return `{ image: HTMLImageElement; blob: Blob }`
- **THEN** the returned image dimensions SHALL be exactly 2x the original width and 2x the original height
- **THEN** each original pixel SHALL be rendered as a 2x2 block of identical pixels (no interpolation, no smoothing)

#### Scenario: Upscale with custom factor
- **WHEN** `upscaleNearest(image, 4)` is called with a factor parameter
- **THEN** the returned image dimensions SHALL be 4x the original width and 4x the original height
- **THEN** each original pixel SHALL be rendered as a 4x4 block of identical pixels

#### Scenario: Canvas imageSmoothingEnabled is disabled
- **WHEN** the upscale function renders to a canvas
- **THEN** `imageSmoothingEnabled` SHALL be set to `false` before drawing
- **THEN** no bilinear or bicubic filtering SHALL be applied

### Requirement: Client-side Remove BG reuses existing pipeline
The Remove BG context menu action SHALL invoke the existing `removeBackground()` function from `src/lib/bg-removal.ts` (RMBG-1.4 WASM segmentation with green screen and checkerboard fast-paths). No new module is required.

#### Scenario: Remove BG on a sprite with complex background
- **WHEN** the user triggers Remove BG on a sprite
- **THEN** the system SHALL call `removeBackground(sprite.image)` from `src/lib/bg-removal.ts`
- **THEN** the result SHALL replace the sprite's image in the store via `updateSprite()`

#### Scenario: Remove BG on a sprite with green screen background
- **WHEN** the user triggers Remove BG on a sprite whose corners are predominantly bright green
- **THEN** the existing `detectGreenScreen` → `removeGreenScreen` fast-path in `bg-removal.ts` SHALL handle it
- **THEN** no WASM model download SHALL be triggered

### Requirement: Recolor context menu action is client-side
The context menu "Recolor" action SHALL execute entirely client-side, creating a new recolored sprite without any server call or quota consumption.

#### Scenario: User triggers Recolor from SpriteList context menu
- **WHEN** the user right-clicks a sprite in SpriteList and selects "Recolor"
- **THEN** the system SHALL call `autoRecolor()` from `src/lib/recolor.ts` with the sprite's image
- **THEN** a new sprite SHALL be added to the store with name `{originalName}-recolor-1`
- **THEN** the new sprite SHALL have `isAi: false`
- **THEN** no network request SHALL be made
- **THEN** the AI quota indicator SHALL NOT change

#### Scenario: User triggers Recolor from AssetGrid context menu
- **WHEN** the user right-clicks a sprite in AssetGrid and selects "Recolor"
- **THEN** the same client-side recolor behavior SHALL apply as in SpriteList
- **THEN** the new sprite SHALL have `mode: "atlas"`

### Requirement: Upscale 2x context menu action is client-side
The context menu "Upscale 2x" action SHALL execute entirely client-side, creating a new upscaled sprite without any server call or quota consumption.

#### Scenario: User triggers Upscale 2x from SpriteList context menu
- **WHEN** the user right-clicks a sprite in SpriteList and selects "Upscale 2x"
- **THEN** the system SHALL call `upscaleNearest()` from `src/lib/upscale.ts` with the sprite's image
- **THEN** a new sprite SHALL be added to the store with name `{originalName}-2x`
- **THEN** the new sprite's width and height SHALL be exactly double the original
- **THEN** the new sprite SHALL have `isAi: false`
- **THEN** no network request SHALL be made
- **THEN** the AI quota indicator SHALL NOT change

#### Scenario: User triggers Upscale 2x from AssetGrid context menu
- **WHEN** the user right-clicks a sprite in AssetGrid and selects "Upscale 2x"
- **THEN** the same client-side upscale behavior SHALL apply as in SpriteList
- **THEN** the new sprite SHALL have `mode: "atlas"`

### Requirement: Remove BG context menu action does not consume AI quota
The context menu "Remove BG" action SHALL execute client-side using the existing RMBG-1.4 WASM pipeline and SHALL NOT consume AI quota.

#### Scenario: User triggers Remove BG
- **WHEN** the user right-clicks a sprite and selects "Remove BG"
- **THEN** no call to `/api/ai/transform` SHALL be made
- **THEN** `mutateQuota()` SHALL NOT be called
- **THEN** the AI quota indicator SHALL NOT change

### Requirement: handleToolAction handler for client-side operations
Both SpriteList and AssetGrid components SHALL implement a `handleToolAction` callback separate from `handleAiAction`, dedicated to client-side tool operations.

#### Scenario: handleToolAction for recolor
- **WHEN** `handleToolAction(spriteId, "recolor")` is called
- **THEN** the handler SHALL call the recolor module synchronously (no async fetch)
- **THEN** no `setAiProgress` SHALL be called (no progress overlay for instant ops)
- **THEN** the new sprite SHALL be added via `addSprites()`

#### Scenario: handleToolAction for upscale
- **WHEN** `handleToolAction(spriteId, "upscale")` is called
- **THEN** the handler SHALL call the upscale module synchronously
- **THEN** no `setAiProgress` SHALL be called
- **THEN** the new sprite SHALL be added via `addSprites()`

#### Scenario: handleAiAction no longer handles recolor or upscale
- **WHEN** `handleAiAction` is called in SpriteList or AssetGrid
- **THEN** it SHALL only accept `"variants"` or `"extend-frames"` as valid actions
- **THEN** it SHALL still perform quota pre-check, call `/api/ai/transform`, show AiProgress, and call `mutateQuota()`

### Requirement: Server-side transform route narrowed to AI-only actions
The `/api/ai/transform` endpoint SHALL only accept actions that require generative AI.

#### Scenario: Valid actions accepted
- **WHEN** a POST request is received with `action: "variants"` or `action: "extend-frames"`
- **THEN** the endpoint SHALL process the request as before (Gemini image-to-image)

#### Scenario: Removed actions rejected
- **WHEN** a POST request is received with `action: "recolor"` or `action: "upscale"`
- **THEN** the endpoint SHALL return HTTP 400 with error message `"Invalid action"`

#### Scenario: Action type definition
- **WHEN** the Action type is defined in the route file
- **THEN** it SHALL be `"variants" | "extend-frames"` (no longer including `"recolor"` or `"upscale"`)
