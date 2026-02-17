## ADDED Requirements

### Requirement: Frame sequence preview
The system SHALL display a bottom timeline strip showing all frames in the current animation sequence. Clicking a frame SHALL select it on canvas and in the sprite list.

#### Scenario: Preview animation
- **WHEN** user selects multiple sprites as an animation sequence and clicks Play
- **THEN** system plays the frames in order on a preview canvas at the configured FPS

### Requirement: Playback speed control
The system SHALL provide an FPS slider (1-60 FPS) to control animation playback speed. Default SHALL be 12 FPS.

#### Scenario: Adjust FPS
- **WHEN** user drags FPS slider to 24
- **THEN** animation preview updates to play at 24 frames per second in real-time

### Requirement: Frame reorder via drag
The system SHALL allow users to reorder animation frames by dragging them in the timeline strip. Reorder SHALL update the export animation sequence.

#### Scenario: Swap frames
- **WHEN** user drags frame 3 before frame 1 in the timeline
- **THEN** animation sequence updates to reflect new order and preview plays in new order

### Requirement: Onion skin overlay
The system SHALL support onion skin mode that overlays the previous and next frames at reduced opacity on the current frame view. PRO/TEAM feature only.

#### Scenario: Enable onion skin
- **WHEN** PRO user enables onion skin while viewing frame 5
- **THEN** frame 4 displays at 30% opacity behind and frame 6 at 30% opacity ahead

#### Scenario: Free user attempts onion skin
- **WHEN** FREE user clicks onion skin toggle
- **THEN** system shows PRO upgrade prompt

### Requirement: Loop modes
The system SHALL support loop and ping-pong playback modes for animation preview.

#### Scenario: Ping-pong mode
- **WHEN** user selects ping-pong mode on a 4-frame animation
- **THEN** preview plays 1→2→3→4→3→2→1→2→... continuously
