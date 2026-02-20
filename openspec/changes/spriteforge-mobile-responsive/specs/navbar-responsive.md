# Spec: Responsive Navbar

## REQ-NAV-1: Mobile Hamburger Menu

**Given** viewport width < 768px (md breakpoint)
**When** the page loads
**Then** nav links and "Launch Editor" button are hidden, replaced by a hamburger icon button

## REQ-NAV-2: Mobile Menu Toggle

**Given** viewport width < 768px
**When** user taps the hamburger icon
**Then** a full-width dropdown menu appears with all nav links stacked vertically

## REQ-NAV-3: Desktop Unchanged

**Given** viewport width >= 768px
**When** the page loads
**Then** navbar renders exactly as current (horizontal links + button)
