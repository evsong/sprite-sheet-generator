## ADDED Requirements

### Requirement: User can request password reset
The system SHALL send a password reset email when a user submits their email on the forgot-password page.

#### Scenario: Valid email request
- **WHEN** user submits a registered email on `/auth/reset-password`
- **THEN** system generates a reset token, stores it with 1-hour expiry, and sends reset link via Resend

#### Scenario: Unknown email
- **WHEN** user submits an unregistered email
- **THEN** system shows the same success message (no email enumeration)

### Requirement: User can set new password via reset link
The system SHALL allow users to set a new password using a valid reset token.

#### Scenario: Valid token
- **WHEN** user visits `/auth/new-password?token=<valid-token>` and submits new password
- **THEN** system updates password hash, invalidates token, and redirects to signin

#### Scenario: Expired or invalid token
- **WHEN** user visits reset page with expired/invalid token
- **THEN** system shows error and link to request a new reset
