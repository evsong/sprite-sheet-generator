# Client Background Removal

## Overview
Browser-side image background removal using Transformers.js and the RMBG-1.4 model. Replaces server-side API calls for the "AI Remove BG" context menu action.

## Requirements

### REQ-BG-1: Model Loading
- On first use, download RMBG-1.4 model (~40MB) via Transformers.js
- Cache model in browser (IndexedDB/Cache API) for subsequent uses
- Show download progress indicator during first load

### REQ-BG-2: Background Removal
- Accept any loaded sprite image (PNG/WebP/JPEG)
- Process entirely client-side using ONNX Runtime WebAssembly
- Return transparent PNG with background removed
- Support optional WebGPU acceleration when available

### REQ-BG-3: Editor Integration
- Trigger via right-click context menu → "Remove Background"
- Replace original sprite in-place with processed result
- Show processing spinner on the sprite thumbnail during operation
- Auto-repack after replacement

### REQ-BG-4: No Quota Consumption
- Background removal does NOT count against AI daily quota
- Works for all tiers (FREE/PRO/TEAM) since it's client-side

## Scenarios

```gherkin
Scenario: First-time background removal
  Given user has never used bg removal before
  When user right-clicks a sprite and selects "Remove Background"
  Then model download progress is shown
  And background is removed after download completes
  And sprite is replaced with transparent version

Scenario: Subsequent background removal
  Given model is cached in browser
  When user selects "Remove Background"
  Then processing starts immediately (no download)
  And completes within 5 seconds for typical game sprites

Scenario: WebGPU acceleration
  Given browser supports WebGPU
  When background removal runs
  Then it uses GPU acceleration for faster processing
```
