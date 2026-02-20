# Spec: Editor Mobile Gate

## REQ-EDITOR-1: Desktop-Only Gate

**Given** viewport width < 768px
**When** user navigates to /editor
**Then** show a centered message: "SpriteForge Editor is designed for desktop browsers. Please visit on a computer for the best experience." with a "Back to Home" link

**Given** viewport width >= 768px
**When** user navigates to /editor
**Then** editor renders normally (no change)
