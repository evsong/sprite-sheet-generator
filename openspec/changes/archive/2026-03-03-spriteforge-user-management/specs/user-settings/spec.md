## ADDED Requirements

### Requirement: User can view and edit profile
The system SHALL provide a `/settings` page where authenticated users can view and update their name and avatar URL.

#### Scenario: View profile
- **WHEN** authenticated user navigates to `/settings`
- **THEN** system displays current name, email (read-only), avatar, and tier

#### Scenario: Update name
- **WHEN** user submits a new name via the profile form
- **THEN** system updates the user's name in the database and reflects it in the session

#### Scenario: Update avatar
- **WHEN** user submits a new avatar URL
- **THEN** system updates the user's avatar in the database

### Requirement: User can change password
The system SHALL allow credential-based users to change their password from the settings page.

#### Scenario: Successful password change
- **WHEN** user provides correct current password and a valid new password (≥6 chars)
- **THEN** system updates the password hash and returns success

#### Scenario: Wrong current password
- **WHEN** user provides incorrect current password
- **THEN** system rejects the request with an error message

#### Scenario: OAuth user has no password option
- **WHEN** user logged in via OAuth visits settings
- **THEN** password change section is hidden

### Requirement: User can delete account
The system SHALL allow users to permanently delete their account from the settings page.

#### Scenario: Account deletion with confirmation
- **WHEN** user confirms account deletion by typing "DELETE"
- **THEN** system deletes user record, all projects, assets, and signs them out

### Requirement: Unauthenticated users are redirected
The system SHALL redirect unauthenticated users from `/settings` to `/auth/signin`.

#### Scenario: Unauthenticated access
- **WHEN** unauthenticated user navigates to `/settings`
- **THEN** system redirects to `/auth/signin?callbackUrl=/settings`
