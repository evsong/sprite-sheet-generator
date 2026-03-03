# Onion Skin Overlay

## Overview
Animation editing aid that displays semi-transparent previous/next frames behind the current frame on the editor canvas. Helps animators see motion continuity. PRO/TEAM feature.

## Requirements

### REQ-OS-1: Overlay Rendering
- Show previous frame at 30% opacity behind current frame
- Show next frame at 15% opacity behind current frame
- Render on a separate canvas layer above grid but below current frame
- Use different tint colors: previous = blue tint, next = red tint

### REQ-OS-2: Toggle Control
- Add onion skin toggle button in animation timeline controls
- Keyboard shortcut: `O` to toggle on/off
- Persist preference in editor state (Zustand)
- Default: off

### REQ-OS-3: Performance
- Only render when animation has 2+ frames
- Cache rendered onion frames, invalidate on frame content change
- Skip rendering when animation is playing (only show when paused)

### REQ-OS-4: Tier Gating
- PRO and TEAM tiers only
- FREE tier: button visible but shows upgrade prompt on click

## Scenarios

```gherkin
Scenario: Enable onion skin
  Given animation has 3+ frames and playback is paused
  When user clicks onion skin toggle or presses O
  Then previous frame renders at 30% opacity with blue tint
  And next frame renders at 15% opacity with red tint

Scenario: Onion skin during playback
  Given onion skin is enabled
  When user plays animation
  Then onion skin overlay is hidden
  When user pauses animation
  Then onion skin overlay reappears

Scenario: Edge frames
  Given current frame is the first frame
  Then only next frame onion skin is shown (no previous)
```
