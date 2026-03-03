## Why

SpriteForge 目前的生图流程完全围绕"序列帧动画"设计：Prompt 硬编码了连续性/一致性指令，API 不区分生成模式，生成后强制写入动画时间线。当用户想生成"一组药水瓶"或"武器图标集"时，AI 会错误地画出"药水瓶在变身的动画"，而不是 4 个不同的药水。这导致工具只能覆盖动画场景，丢失了图集/图标集这一高频需求（游戏开发中 UI 图标、道具集、环境资产的需求量不亚于角色动画）。

## What Changes

- 新增 `GenerationMode` 类型（`"sequence" | "atlas"`），贯穿前后端全链路
- 重构 `buildSystemPrompt()`：根据 mode 注入不同的 AI 指令——sequence 强调一致性和连续动作，atlas 强调多样性并明确禁止动画连贯
- `PROMPT_TEMPLATES` 增加 `mode` 字段，现有 8 个模板标记为 sequence，新增 3 个 atlas 模板（Potion Set / Weapon Set / Elemental Icons）
- `/api/ai/generate` 接收 `mode` 参数，缺省回退 `"sequence"`（向后兼容），同时接受 `itemCount` 作为 `count` 的别名
- `AiGenerateModal` 增加模式切换 UI（Animation / Icon Set），模板按 mode 过滤，文案动态切换 Frames↔Items
- `generate-sprite-sheet.ts` 透传 mode 到 API；生成后行为分流：sequence 走 addSprites + setAnimationFrames（现有行为），atlas 只走 addSprites 不写时间线
- `generation-history.ts` 的 HistoryEntry 增加可选 `mode` 字段，loadHistory() 对旧记录自动补 `mode="sequence"`

## Capabilities

### New Capabilities
- `dual-mode-generation`: 支持 sequence（连续动画帧）和 atlas（独立图集）两种生成模式，包括类型定义、模式感知的 Prompt 构建、模板分类、API 参数扩展、UI 模式切换、生成后行为分流、历史记录兼容

### Modified Capabilities
（无现有 spec 需修改）

## Impact

- **必须修改的文件**（5 个）：
  - `src/lib/prompt-templates.ts` — 类型定义 + buildSystemPrompt 重构 + 模板扩展
  - `src/app/api/ai/generate/route.ts` — 接收并透传 mode
  - `src/components/editor/AiGenerateModal.tsx` — 模式切换 UI + 模板过滤 + 文案切换
  - `src/lib/generate-sprite-sheet.ts` — GenerateOptions 增加 mode + 生成后行为分流
  - `src/lib/generation-history.ts` — HistoryEntry 增加 mode + 旧数据兼容
- **不改的文件**：
  - `src/lib/sprite-sheet-splitter.ts` — 网格切割算法不变，sequence 和 atlas 都用 Grid+fallback
  - `src/lib/bg-removal.ts` — 背景移除逻辑与模式无关
  - `src/lib/ai-quota.ts` — 配额计费不区分模式
  - Prisma schema — 无数据库迁移
- **不做的事**：
  - 不做全仓库 `frameCount` → `itemCount` 硬重命名（内部继续用 count/frameCount，仅 UI 层显示切换）
  - 不引入自由布局智能切图（继续用 Prompt 约束保证网格可切）
  - 不改动画时间线组件本身的逻辑
- **兼容性**：旧前端不传 mode 仍可用（默认 sequence）；旧 localStorage 历史不崩（自动补 mode）
