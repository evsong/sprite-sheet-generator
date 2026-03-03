## ADDED Requirements

### Requirement: Tab switcher in SpriteList panel
The SpriteList panel SHALL display a tab bar with two options: "Frames" and "Assets". The active tab SHALL be visually highlighted using the amber accent color. The default active tab SHALL be "Frames".

#### Scenario: User switches to Assets tab
- **WHEN** user clicks the "Assets" tab
- **THEN** the sprite list filters to show only sprites with `mode === "atlas"`
- **THEN** the sprite count header updates to "Assets (N)"
- **THEN** the bottom panel switches from AnimationTimeline to AssetGrid

#### Scenario: User switches to Frames tab
- **WHEN** user clicks the "Frames" tab
- **THEN** the sprite list filters to show only sprites with `mode !== "atlas"` (including sprites with no mode)
- **THEN** the sprite count header updates to "Frames (N)"
- **THEN** the bottom panel switches from AssetGrid to AnimationTimeline

### Requirement: Bottom panel conditional rendering
The editor layout SHALL render the bottom panel based on the active tab. Frames tab SHALL show AnimationTimeline. Assets tab SHALL show AssetGrid.

#### Scenario: Frames tab bottom panel
- **WHEN** activeTab is "frames"
- **THEN** the bottom area renders the existing AnimationTimeline component with all playback controls

#### Scenario: Assets tab bottom panel
- **WHEN** activeTab is "assets"
- **THEN** the bottom area renders a grid of atlas sprite thumbnails (approximately 48x48px each)
- **THEN** clicking a thumbnail selects the sprite (cyan highlight border)
- **THEN** right-clicking a thumbnail opens the context menu (without animation items)
- **THEN** if no atlas sprites exist, display "Generate or import assets to see them here"

### Requirement: Context menu adapts to sprite mode
The right-click context menu SHALL hide animation-specific items for atlas sprites.

#### Scenario: Context menu on a sequence sprite
- **WHEN** user right-clicks a sprite with `mode === "sequence"` or `mode === undefined`
- **THEN** the context menu shows all items including "Add to Animation" and "AI Extend Frames"

#### Scenario: Context menu on an atlas sprite
- **WHEN** user right-clicks a sprite with `mode === "atlas"`
- **THEN** the context menu hides "Add to Animation" and "AI Extend Frames"
- **THEN** all other items remain: Duplicate, Rename, Delete, AI Variants, AI Recolor, AI Upscale 2x, AI Remove BG

### Requirement: Quick-generate area adapts to active tab
The SpriteList quick-generate textarea and button SHALL adapt text based on the active tab.

#### Scenario: Quick-generate in Frames tab
- **WHEN** activeTab is "frames"
- **THEN** textarea placeholder reads "Pixel knight, 8 frames, walk cycle..."
- **THEN** clicking "+ Generate New..." opens AiGenerateModal with defaultMode "sequence"

#### Scenario: Quick-generate in Assets tab
- **WHEN** activeTab is "assets"
- **THEN** textarea placeholder reads "Potion set, 4 items, pixel art..."
- **THEN** clicking "+ Generate New..." opens AiGenerateModal with defaultMode "atlas"

### Requirement: Import area adapts to active tab
The file import drop zone text SHALL reflect the active tab context.

#### Scenario: Import in Frames tab
- **WHEN** activeTab is "frames"
- **THEN** drop zone text reads "Drop PNG / JPG frames"
- **THEN** imported sprites receive `mode: "sequence"`

#### Scenario: Import in Assets tab
- **WHEN** activeTab is "assets"
- **THEN** drop zone text reads "Drop PNG / JPG assets"
- **THEN** imported sprites receive `mode: "atlas"`

### Requirement: Toolbar stats adapt to active tab
The EditorToolbar statistics SHALL display context-appropriate labels.

#### Scenario: Stats in Frames tab
- **WHEN** activeTab is "frames"
- **THEN** toolbar shows "N frames · WxH · D%" where N counts only sequence sprites

#### Scenario: Stats in Assets tab
- **WHEN** activeTab is "assets"
- **THEN** toolbar shows "N assets · WxH · D%" where N counts only atlas sprites
