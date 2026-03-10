## MODIFIED Requirements

### Requirement: Context menu adapts to sprite mode
The right-click context menu SHALL organize actions into three visual sections: basic operations, client-side tools, and server-side AI actions. The menu SHALL hide animation-specific items for atlas sprites.

#### Scenario: Context menu on a sequence sprite
- **WHEN** user right-clicks a sprite with `mode === "sequence"` or `mode === undefined`
- **THEN** the context menu shows basic items: Duplicate, Rename, Delete
- **THEN** a separator and "Tools" group follows with: Recolor, Upscale 2x, Remove BG (cyan accent color, no "AI" prefix)
- **THEN** a separator and "AI" group follows with: AI Variants (amber accent color)
- **THEN** a separator follows with: Add to Animation, AI Extend Frames (amber accent color)

#### Scenario: Context menu on an atlas sprite
- **WHEN** user right-clicks a sprite with `mode === "atlas"`
- **THEN** the context menu shows basic items: Duplicate, Rename, Delete
- **THEN** a separator and "Tools" group follows with: Recolor, Upscale 2x, Remove BG (cyan accent color)
- **THEN** a separator and "AI" group follows with: AI Variants (amber accent color)
- **THEN** the menu does NOT show "Add to Animation" or "AI Extend Frames"

#### Scenario: Context menu in AssetGrid
- **WHEN** user right-clicks a sprite in the AssetGrid bottom panel
- **THEN** the context menu shows: Delete
- **THEN** a separator and "Tools" group follows with: Recolor, Upscale 2x, Remove BG (cyan accent color)
- **THEN** a separator and "AI" group follows with: AI Variants (amber accent color)

#### Scenario: Tool items use cyan accent
- **WHEN** the context menu renders tool items (Recolor, Upscale 2x, Remove BG)
- **THEN** the items SHALL use cyan accent color (`var(--cyan)`) instead of amber
- **THEN** the items SHALL NOT have the "AI" prefix in their labels

#### Scenario: AI items retain amber accent
- **WHEN** the context menu renders AI items (AI Variants, AI Extend Frames)
- **THEN** the items SHALL continue to use amber accent color (`var(--amber)`)
- **THEN** the items SHALL retain the "AI" prefix in their labels
