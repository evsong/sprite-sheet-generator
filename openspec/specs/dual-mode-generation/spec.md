# dual-mode-generation Specification

## Purpose
TBD - created by archiving change dual-mode-generation. Update Purpose after archive.
## Requirements
### Requirement: GenerationMode type definition
The system SHALL export a type `GenerationMode = "sequence" | "atlas"` from `src/lib/prompt-templates.ts`.

#### Scenario: Type is importable
- **WHEN** any module imports `GenerationMode` from `@/lib/prompt-templates`
- **THEN** the type resolves to the union `"sequence" | "atlas"`

### Requirement: Mode-aware system prompt construction
The `buildSystemPrompt` function SHALL accept a `mode: GenerationMode` parameter (defaulting to `"sequence"`) and produce mode-specific AI instructions.

#### Scenario: Sequence mode prompt
- **WHEN** `buildSystemPrompt` is called with `mode="sequence"` (or mode omitted)
- **THEN** the returned prompt SHALL include instructions for continuous animation: frame consistency, continuous motion, left-to-right flow, and consistent character proportions

#### Scenario: Atlas mode prompt
- **WHEN** `buildSystemPrompt` is called with `mode="atlas"`
- **THEN** the returned prompt SHALL include instructions for independent items: each cell contains a distinct item, variety is maximized, and an explicit prohibition against animation sequences ("Do NOT create animation sequences")

#### Scenario: Common rules in both modes
- **WHEN** `buildSystemPrompt` is called with any valid mode
- **THEN** the prompt SHALL include grid layout specification, style directive, checkerboard background instruction, and prohibition on labels/numbers/text

### Requirement: PromptTemplate includes mode field
Each `PromptTemplate` object SHALL include a `mode: GenerationMode` property.

#### Scenario: Existing templates tagged as sequence
- **WHEN** the PROMPT_TEMPLATES array is loaded
- **THEN** the existing 8 templates (walk, attack, idle, run, explosion, coin, chest, death) SHALL each have `mode: "sequence"`

#### Scenario: New atlas templates added
- **WHEN** the PROMPT_TEMPLATES array is loaded
- **THEN** it SHALL contain at least 3 atlas-mode templates: Potion Set, Weapon Set, and Elemental Icons, each with `mode: "atlas"` and appropriate `defaultFrames`, `icon`, and `prompt`

### Requirement: API accepts mode parameter
The `/api/ai/generate` POST endpoint SHALL accept an optional `mode` field in the request body.

#### Scenario: Mode is passed and valid
- **WHEN** the request body includes `mode: "atlas"`
- **THEN** the API SHALL pass `mode` to `buildSystemPrompt` and include `mode` in the JSON response

#### Scenario: Mode is missing
- **WHEN** the request body does not include `mode`
- **THEN** the API SHALL default to `mode: "sequence"` and behave identically to the pre-change behavior

#### Scenario: Mode is invalid
- **WHEN** the request body includes a `mode` value other than `"sequence"` or `"atlas"`
- **THEN** the API SHALL fall back to `mode: "sequence"`

#### Scenario: itemCount alias
- **WHEN** the request body includes `itemCount` but not `count`
- **THEN** the API SHALL use `itemCount` as the frame count value

### Requirement: GenerateOptions includes mode
The `GenerateOptions` interface in `generate-sprite-sheet.ts` SHALL include an optional `mode: GenerationMode` field (defaulting to `"sequence"`).

#### Scenario: Mode is forwarded to API
- **WHEN** `generateSpriteSheet` is called with `mode: "atlas"`
- **THEN** the fetch request body to `/api/ai/generate` SHALL include `mode: "atlas"`

#### Scenario: Sprite naming by mode
- **WHEN** mode is `"sequence"`
- **THEN** generated sprites SHALL be named `frame-1`, `frame-2`, etc.

#### Scenario: Sprite naming in atlas mode
- **WHEN** mode is `"atlas"`
- **THEN** generated sprites SHALL be named `item-1`, `item-2`, etc.

### Requirement: UI mode toggle in AiGenerateModal
The `AiGenerateModal` component SHALL provide a mode toggle allowing users to switch between Animation and Icon Set modes.

#### Scenario: Default mode
- **WHEN** the modal opens
- **THEN** the mode SHALL be `"sequence"` (Animation) by default

#### Scenario: Mode switch filters templates
- **WHEN** the user switches to Icon Set mode
- **THEN** only atlas-mode templates SHALL be displayed in the template grid

#### Scenario: Mode switch updates labels
- **WHEN** the user switches to Icon Set mode
- **THEN** the frame count label SHALL display "Items (N)" instead of "Frames (N)", and the generate button SHALL display "Generate N Items" instead of "Generate N Frames"

#### Scenario: Mode switch updates placeholder
- **WHEN** the user is in Icon Set mode
- **THEN** the prompt placeholder SHALL display "e.g. a set of medieval weapons" instead of "e.g. a warrior character walking animation"

### Requirement: Post-generation behavior branches by mode
After successful generation, the behavior SHALL differ based on mode.

#### Scenario: Sequence mode post-generation
- **WHEN** generation completes in `sequence` mode
- **THEN** the system SHALL call `addSprites(sprites)` AND `setAnimationFrames(sprites.map(s => s.id))` (existing behavior)

#### Scenario: Atlas mode post-generation
- **WHEN** generation completes in `atlas` mode
- **THEN** the system SHALL call `addSprites(sprites)` only, and SHALL NOT call `setAnimationFrames()`

### Requirement: History entry includes mode
The `HistoryEntry` interface SHALL include an optional `mode?: GenerationMode` field.

#### Scenario: New history entries include mode
- **WHEN** a generation completes and is saved to history
- **THEN** the saved `HistoryEntry` SHALL include the `mode` used for that generation

#### Scenario: Old history entries are migrated on load
- **WHEN** `loadHistory()` reads entries that lack a `mode` field (pre-change data)
- **THEN** those entries SHALL be returned with `mode: "sequence"` automatically applied

#### Scenario: Reuse restores mode
- **WHEN** the user clicks "Reuse" on a history entry
- **THEN** the modal SHALL restore the entry's `mode` along with prompt, style, frameCount, and targetSize

### Requirement: Backward compatibility
The system SHALL maintain full backward compatibility with clients that do not send a `mode` parameter.

#### Scenario: Old client API request
- **WHEN** an API request is received with `{prompt, style, count}` and no `mode`
- **THEN** the system SHALL behave identically to the pre-change implementation (sequence mode, animation prompt, setAnimationFrames called)

#### Scenario: Old localStorage data
- **WHEN** the application loads with localStorage containing history entries without `mode`
- **THEN** the history SHALL load without errors and entries SHALL display correctly with `mode: "sequence"` assumed

#### Scenario: Build passes
- **WHEN** `npm run build` is executed after all changes
- **THEN** the build SHALL complete without TypeScript errors

