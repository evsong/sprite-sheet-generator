## ADDED Requirements

### Requirement: Save project to cloud
The system SHALL allow authenticated users to save their current editor state (sprites, packing config, animation sequences) to the cloud. PRO/TEAM feature only.

#### Scenario: Save project
- **WHEN** PRO user clicks "Save Project" with 15 sprites loaded
- **THEN** system uploads sprite images to cloud storage and saves project metadata (layout, config, animations) to database

#### Scenario: Free user attempts save
- **WHEN** FREE user clicks "Save Project"
- **THEN** system shows PRO upgrade prompt

### Requirement: Load project from cloud
The system SHALL allow users to load previously saved projects. Loading SHALL restore all sprites, packing configuration, and animation sequences.

#### Scenario: Load existing project
- **WHEN** user selects a project from their project list
- **THEN** editor loads all sprites, applies saved packing config, and restores animation timeline

### Requirement: Project list
The system SHALL display a list of saved projects with name, thumbnail, sprite count, last modified date, and creation date. Sorted by last modified descending.

#### Scenario: View project list
- **WHEN** user opens the project browser
- **THEN** system displays all saved projects as cards with thumbnails and metadata

### Requirement: Delete project
The system SHALL allow users to delete saved projects. Deletion SHALL remove all associated assets from cloud storage.

#### Scenario: Delete with confirmation
- **WHEN** user clicks delete on a project
- **THEN** system shows confirmation dialog; on confirm, deletes project and all assets

### Requirement: Local export fallback
The system SHALL allow all users (including FREE) to export the current editor state as a local .spriteforge JSON file for offline backup.

#### Scenario: Local save
- **WHEN** user clicks "Download Project File"
- **THEN** system downloads a .spriteforge JSON file containing all sprite data and configuration
