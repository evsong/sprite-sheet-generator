## ADDED Requirements

### Requirement: MaxRects bin packing
The system SHALL pack uploaded sprite images into one or more atlas bins using the MaxRects algorithm (via `maxrects-packer` library) entirely on the client side. No image data SHALL be sent to the server.

#### Scenario: Basic packing
- **WHEN** user uploads 10 PNG sprites and clicks "Pack"
- **THEN** system arranges all sprites into the minimum number of bins with near-zero wasted space and displays the result on canvas

#### Scenario: Multi-bin overflow
- **WHEN** total sprite area exceeds the configured max atlas size
- **THEN** system creates additional bins and displays a bin selector to navigate between them

### Requirement: Configurable atlas parameters
The system SHALL allow users to configure: max width, max height, padding between sprites, border margin, Power-of-Two (POT) alignment, and allow rotation (90°).

#### Scenario: POT alignment enabled
- **WHEN** user enables POT and sprites pack into 900×600
- **THEN** output atlas dimensions SHALL be rounded up to 1024×1024

#### Scenario: Padding adjustment
- **WHEN** user sets padding to 4px
- **THEN** each sprite SHALL have 4px gap on all sides in the packed output

### Requirement: Transparent pixel trimming
The system SHALL scan each sprite's pixel data via Canvas API and trim fully transparent borders. The original `sourceSize` and trim offset `spriteSourceSize` SHALL be preserved in export metadata.

#### Scenario: Sprite with transparent border
- **WHEN** a 64×64 sprite has 8px transparent border on all sides
- **THEN** system trims to 48×48 for packing but records sourceSize as {w:64, h:64} and spriteSourceSize as {x:8, y:8}

### Requirement: Drag-and-drop upload
The system SHALL accept sprites via drag-and-drop onto the canvas area or via a file picker dialog. Supported formats: PNG, WebP, GIF (first frame), JPEG.

#### Scenario: Drag multiple files
- **WHEN** user drags 20 PNG files onto the editor canvas
- **THEN** all 20 sprites appear in the sprite list and auto-pack into the atlas

### Requirement: Sprite reorder and removal
The system SHALL allow users to reorder sprites in the list via drag-and-drop and remove individual sprites. Repack SHALL trigger automatically after changes.

#### Scenario: Remove sprite and repack
- **WHEN** user deletes a sprite from the list
- **THEN** remaining sprites repack automatically and canvas updates
