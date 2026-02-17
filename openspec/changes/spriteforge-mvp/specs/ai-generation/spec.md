## ADDED Requirements

### Requirement: Text-to-sprite generation
The system SHALL generate sprite frames from a text prompt via third-party AI APIs (Stability AI / DALL-E / Flux). Generated sprites SHALL be style-consistent within a single generation batch.

#### Scenario: Generate walk cycle
- **WHEN** user enters "pixel art knight walk cycle, 4 frames" and clicks Generate
- **THEN** system calls AI API and returns 4 style-consistent sprite frames added to the sprite list

### Requirement: AI generation quota per tier
The system SHALL enforce daily AI generation limits: FREE 3/day, PRO 50/day, TEAM unlimited. Usage counter SHALL reset at midnight UTC.

#### Scenario: Free user exceeds quota
- **WHEN** a FREE user has used 3 generations today and requests another
- **THEN** system displays upgrade prompt with remaining time until reset

#### Scenario: PRO user within quota
- **WHEN** a PRO user has used 20/50 generations and requests another
- **THEN** system processes the request and updates counter to 21/50

### Requirement: AI sprite modification
The system SHALL support context-menu AI operations on existing sprites: Generate Variants, Recolor, Upscale 2×, Remove Background, Extend Frames. Each operation counts as one generation toward quota.

#### Scenario: AI Upscale
- **WHEN** user right-clicks a 32×32 sprite and selects "AI Upscale 2×"
- **THEN** system generates a 64×64 upscaled version and replaces the original in the sprite list

#### Scenario: AI Extend Frames
- **WHEN** user right-clicks a single sprite and selects "AI Extend Frames"
- **THEN** system generates additional animation frames matching the sprite's style and adds them to the list

### Requirement: Generation progress feedback
The system SHALL display a progress indicator during AI generation. The UI SHALL remain interactive (non-blocking) while generation is in progress.

#### Scenario: Long generation
- **WHEN** AI generation takes 8 seconds
- **THEN** user sees a progress bar/spinner and can continue editing other sprites during the wait
