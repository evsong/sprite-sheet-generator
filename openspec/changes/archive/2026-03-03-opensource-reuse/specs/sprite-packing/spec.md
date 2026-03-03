# Sprite Packing — Web Worker (Delta)

## Overview
Move maxrects-packer computation into a Web Worker for sprite sets >50 to prevent UI blocking.

## Changes to Existing Requirements

### REQ-PK-WW-1: Worker Threshold
- Sprite count <= 50: pack on main thread (current behavior, fast enough)
- Sprite count > 50: offload to Web Worker
- Threshold configurable but default 50

### REQ-PK-WW-2: Worker Communication
- Post message: sprite dimensions array + packing config
- Receive message: packed bin results (rects with x, y, width, height, rot, spriteId)
- Worker imports maxrects-packer directly

### REQ-PK-WW-3: Progress Feedback
- Show packing progress indicator when using worker
- Cancel previous worker if config changes mid-pack
- Debounce pack requests (300ms) to avoid worker spam

### REQ-PK-WW-4: Fallback
- If Web Worker fails to initialize, fall back to main thread packing
- Log warning but don't break functionality

## Scenarios

```gherkin
Scenario: Large sprite set packing
  Given user has uploaded 100 sprites
  When packing triggers
  Then computation runs in Web Worker
  And UI remains responsive during packing
  And progress indicator shows

Scenario: Small sprite set
  Given user has 20 sprites
  When packing triggers
  Then packing runs on main thread (no worker overhead)
```
