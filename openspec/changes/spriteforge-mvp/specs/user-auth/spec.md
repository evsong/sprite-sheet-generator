## ADDED Requirements

### Requirement: OAuth authentication
The system SHALL support sign-in via GitHub OAuth and Google OAuth using NextAuth. Users SHALL be able to sign in with one click from the landing page or editor.

#### Scenario: GitHub sign-in
- **WHEN** user clicks "Sign in with GitHub"
- **THEN** system redirects to GitHub OAuth, authenticates, creates/updates user record, and redirects back to editor

#### Scenario: Google sign-in
- **WHEN** user clicks "Sign in with Google"
- **THEN** system redirects to Google OAuth, authenticates, creates/updates user record, and redirects back to editor

### Requirement: Guest mode
The system SHALL allow unauthenticated users to use the editor with FREE tier limits. No data SHALL be persisted for guest sessions.

#### Scenario: Guest uses editor
- **WHEN** unauthenticated user opens the editor
- **THEN** all FREE tier features work but project save is disabled with a "Sign in to save" prompt

### Requirement: Session management
The system SHALL maintain user sessions via secure HTTP-only cookies. Sessions SHALL expire after 30 days of inactivity.

#### Scenario: Session expiry
- **WHEN** user returns after 31 days without activity
- **THEN** system requires re-authentication and redirects to sign-in

### Requirement: User profile
The system SHALL store user profile data: display name, email, avatar URL, subscription tier, and creation date.

#### Scenario: View profile
- **WHEN** authenticated user clicks their avatar in the navbar
- **THEN** system displays profile dropdown with name, email, tier badge, and sign-out option
