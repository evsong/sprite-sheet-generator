## Why

SpriteForge MVP 已完成 53/73 任务，但部分功能（去背景、onion skin、导出格式扩展、大批量打包性能）是自建实现。GitHub 上有成熟的 MIT/Apache 开源项目可以直接复用，减少代码量、提升质量、扩展功能覆盖面。

核心机会：
- `addyosmani/bg-remove` (MIT) 提供纯客户端去背景，可替代 Stability AI API 调用，零成本、零延迟
- `odrick/free-tex-packer-core` (MIT) 有 15 种 Mustache 导出模板，我们只有 6 种
- `piskelapp/piskel` (Apache 2.0) 有成熟的 onion skin 渲染架构可参考

## What Changes

- **新增客户端去背景**: 集成 Transformers.js + RMBG-1.4 模型，替代 AI Remove BG 的 API 调用
- **扩展导出格式**: 从 6 种 → 15+ 种，复用 free-tex-packer-core 的 Mustache 模板（Spine, Starling, Cocos2d, Unreal, UIKit, Egret2D, XML）
- **实现 Onion Skin**: 参考 Piskel 的 OnionSkinRenderer 模式，在编辑器画布上叠加前后帧半透明预览
- **Web Worker 打包**: 将 maxrects-packer 调用移入 Web Worker，避免大批量精灵（>50）阻塞 UI

## Capabilities

### New Capabilities
- `client-bg-removal`: 浏览器端背景移除，使用 Transformers.js + RMBG-1.4，不依赖外部 API
- `onion-skin`: 动画编辑时显示前后帧半透明叠加层，辅助动画制作

### Modified Capabilities
- `export-engine`: 新增 9 种导出格式（Spine, Starling, Cocos2d, Unreal, UIKit, Egret2D, GodotTileset, XML, OldCss），改用 Mustache 模板引擎
- `sprite-packing`: 大批量打包（>50 sprites）移入 Web Worker 执行

## Impact

- 新增依赖: `mustache` (~3KB), `@huggingface/transformers` (~50KB + 模型按需下载)
- 修改文件: `src/lib/exporter.ts`, `src/hooks/use-auto-pack.ts`, `src/components/editor/EditorCanvas.tsx`, `src/components/editor/AnimationTimeline.tsx`
- 新增文件: Web Worker 脚本, bg-removal 工具函数, Mustache 模板文件, onion skin 组件
- 模型文件: RMBG-1.4 (~40MB) 首次使用时按需下载并缓存到 IndexedDB
