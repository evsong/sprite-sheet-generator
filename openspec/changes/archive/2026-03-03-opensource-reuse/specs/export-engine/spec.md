# Export Engine — Format Extension (Delta)

## Overview
Extend export engine from 6 formats to 15+ by adopting Mustache template-based export system from free-tex-packer-core.

## Changes to Existing Requirements

### REQ-EX-NEW-1: Mustache Template Engine
- Replace hardcoded format functions with Mustache templates
- Each format = one `.mst` template file + metadata
- Template receives standardized context: rects, config, appInfo

### REQ-EX-NEW-2: Additional Export Formats
New formats (from free-tex-packer-core MIT templates):
- Spine JSON
- Starling XML
- Cocos2d plist
- Unreal Paper2D JSON
- UIKit plist
- Egret2D JSON
- Godot Tileset .tres
- Generic XML
- Legacy CSS

### REQ-EX-NEW-3: Backward Compatibility
- Existing 6 formats (PixiJS, Phaser, CSS, Unity, Godot Atlas, JSON Array) must produce identical output
- Migrate existing formats to Mustache templates
- Export API signature unchanged

### REQ-EX-NEW-4: Format Selection UI
- Update SettingsPanel export format dropdown to show all available formats
- Group formats by engine/platform in dropdown
- Show format description tooltip on hover

## Scenarios

```gherkin
Scenario: Export with new format
  Given user has packed sprites
  When user selects "Spine" from export format dropdown
  And clicks Export
  Then downloads Spine-compatible JSON + PNG

Scenario: Existing format unchanged
  Given user selects "PixiJS JSON Hash"
  When export runs
  Then output is identical to pre-migration format
```
