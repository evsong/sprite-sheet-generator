## ADDED Requirements

### Requirement: Multi-format export
The system SHALL export sprite sheets in the following formats: PixiJS JSON Hash, Phaser 3 Atlas JSON, CSS Sprites, Unity JSON, Godot .tres, Generic JSON Array. FREE tier SHALL be limited to JSON and CSS only. PRO/TEAM SHALL access all formats.

#### Scenario: Export PixiJS JSON Hash
- **WHEN** user selects PixiJS format and clicks Export
- **THEN** system downloads a PNG atlas image and a JSON file with frames, animations, and meta sections matching PixiJS Spritesheet spec

#### Scenario: Export CSS Sprites
- **WHEN** user selects CSS format and clicks Export
- **THEN** system downloads a PNG atlas and a CSS file with `.sprite-<name>` classes containing background-position, width, and height

#### Scenario: Free user selects Unity format
- **WHEN** FREE user selects Unity from the format dropdown
- **THEN** system shows PRO upgrade prompt and does not export

### Requirement: Engine code snippets
The system SHALL generate copy-paste code snippets for loading the exported sprite sheet in Phaser 3, PixiJS, Unity C#, and Godot GDScript. PRO/TEAM feature only.

#### Scenario: Copy Phaser snippet
- **WHEN** PRO user clicks "Copy Code" on Phaser tab after export
- **THEN** system copies a working `this.load.atlas(...)` code block to clipboard

### Requirement: Export with trim metadata
When transparent trimming is enabled, exported data files SHALL include `trimmed`, `sourceSize`, and `spriteSourceSize` fields for each frame so engines can reconstruct original positioning.

#### Scenario: Trimmed sprite export
- **WHEN** user exports a trimmed sprite sheet in PixiJS format
- **THEN** each frame entry includes `"trimmed": true`, `"sourceSize"`, and `"spriteSourceSize"` fields

### Requirement: Watermark on FREE tier
FREE tier exports SHALL include a small "Made with SpriteForge" watermark in the bottom-right corner of the atlas image. PRO/TEAM exports SHALL have no watermark.

#### Scenario: Free export watermark
- **WHEN** FREE user exports a sprite sheet
- **THEN** the PNG atlas contains a semi-transparent "Made with SpriteForge" text in the bottom-right

### Requirement: Batch export
The system SHALL support exporting multiple bins in a single ZIP archive. FREE tier max 20 sprites, PRO max 200, TEAM unlimited.

#### Scenario: Multi-bin ZIP export
- **WHEN** packing produces 3 bins and user clicks Export All
- **THEN** system downloads a ZIP containing atlas-0.png, atlas-0.json, atlas-1.png, atlas-1.json, atlas-2.png, atlas-2.json
