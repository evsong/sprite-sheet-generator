## ADDED Requirements

### Requirement: SpriteItem carries generation mode
Each SpriteItem SHALL have an optional `mode` field of type `"sequence" | "atlas"`. When `mode` is absent, it SHALL be treated as `"sequence"` for all filtering and display purposes.

#### Scenario: AI generation assigns mode
- **WHEN** generateSpriteSheet creates sprites
- **THEN** each SpriteItem receives `mode` matching the generation options mode parameter

#### Scenario: Legacy sprites without mode
- **WHEN** a sprite has no `mode` field (from old project files or pre-existing data)
- **THEN** the sprite is treated as `mode === "sequence"` in all tab filtering and context menu logic

### Requirement: AiGenerateModal accepts default mode
AiGenerateModal SHALL accept an optional `defaultMode` prop of type `GenerationMode`. The modal's initial mode state SHALL use `defaultMode` when provided, falling back to `"sequence"`.

#### Scenario: Modal opened from Frames tab
- **WHEN** AiGenerateModal opens with `defaultMode="sequence"`
- **THEN** the mode toggle is set to "Animation" and sequence templates are shown

#### Scenario: Modal opened from Assets tab
- **WHEN** AiGenerateModal opens with `defaultMode="atlas"`
- **THEN** the mode toggle is set to "Icon Set" and atlas templates are shown

#### Scenario: User overrides default mode
- **WHEN** user manually clicks the other mode toggle inside the modal
- **THEN** the mode switches regardless of the defaultMode prop
