## Context

SpriteForge 的生图管线（prompt-templates → API → generate-sprite-sheet → AiGenerateModal）当前全链路硬编码为"序列帧动画"语义。Prompt 强制注入 "Frames flow left-to-right" / "consistent character proportions"，API 只收 `{prompt, style, count}`，生成结束后无条件调用 `setAnimationFrames()` 写入时间线。这意味着用户无法用该工具生成"一组不同药水"这类图集需求——AI 会试图画出"药水变形动画"。

现有代码量小（5 个核心文件共 ~350 行），改动集中，风险可控。

## Goals / Non-Goals

**Goals:**
- 支持 `sequence`（连续动画帧）和 `atlas`（独立图标/资产集合）两种生成模式
- 全链路透传 mode：UI → API → Prompt → 生成后行为分流
- 100% 向后兼容：旧客户端不传 mode 默认 sequence，旧 localStorage 历史不崩
- 零数据库迁移

**Non-Goals:**
- 不改切图算法（sprite-sheet-splitter.ts 继续用 Grid+fallback）
- 不做全仓库 `frameCount` → `itemCount` 硬重命名（UI 层动态文案即可）
- 不引入自由布局智能切图
- 不改动画时间线组件本身的逻辑
- 不改 bg-removal.ts / ai-quota.ts
- 不处理现有 lint 问题

## Decisions

### D1: mode 类型定义位置 → prompt-templates.ts

**决定**: 在 `src/lib/prompt-templates.ts` 中导出 `GenerationMode = "sequence" | "atlas"`。

**理由**: prompt-templates.ts 已经是生成参数的权威来源（模板、网格计算、Prompt 构建都在这里），mode 是 Prompt 构建的核心入参，放在这里最自然。不值得为一个两值类型单独建文件。

### D2: Prompt 策略 → 正面描述为主 + 反向约束为辅

**决定**: atlas 模式 Prompt 以正面描述为主（"Each cell MUST contain a DISTINCT item"），辅以一条明确禁止（"Do NOT create animation sequences"）。

**替代方案**: 纯负面约束（"DO NOT make consistent, DO NOT animate"）——但对 Gemini 模型来说，正面描述效果更可靠，负面约束有时被忽略。

**理由**: Codex 和 Gemini 讨论均建议以正面指令为主。反向约束只用一条兜底即可。

### D3: 变量命名 → 内部保持 frameCount/count，UI 层动态切换

**决定**: 后端、API、store 继续使用 `frameCount` / `count`。前端 UI 根据 mode 动态显示 "Frames" 或 "Items"。API 额外接受 `itemCount` 作为 `count` 的别名。

**替代方案**: 全仓库重命名 frameCount → itemCount——但涉及 splitter、bg-removal、editor-store 等大量文件，风险远超收益。

**理由**: 最小改动原则。内部变量名是实现细节，用户看到的标签才重要。

### D4: 生成后行为分流 → 在 AiGenerateModal.handleGenerate() 中分支

**决定**: 在 `AiGenerateModal.tsx` 的 `handleGenerate()` 中判断 mode：
- `sequence`: `addSprites(sprites)` + `setAnimationFrames(sprites.map(s => s.id))`（现有行为）
- `atlas`: 仅 `addSprites(sprites)`，不写动画时间线

**替代方案**: 在 generate-sprite-sheet.ts 中返回 mode 并在调用端分流——但 generate-sprite-sheet 是纯管线函数（获取图 → 切割 → 去背景 → resize），不应该知道 editor store 的语义。行为分流属于 UI 层职责。

### D5: 历史记录兼容 → loadHistory() 自动补 mode

**决定**: `HistoryEntry` 新增可选字段 `mode?: GenerationMode`。`loadHistory()` 在返回前对缺少 mode 的旧记录自动补 `mode: "sequence"`。

**理由**: 最简洁的兼容方案，无需迁移脚本，无需版本号。JSON.parse 后 map 一遍即可。

### D6: sprite 命名 → atlas 模式使用 "item-N" 前缀

**决定**: `generate-sprite-sheet.ts` 根据 mode 决定 sprite name：
- `sequence`: `frame-${i+1}`（现有）
- `atlas`: `item-${i+1}`

**理由**: 用户在编辑器和导出 JSON 中会看到这个名字，语义正确有助于理解。改动极小（一个三元表达式）。

## Risks / Trade-offs

**[Risk] AI 在 atlas 模式下仍生成连贯图片** → Prompt 中同时用正面描述（"distinct items"）和反向约束（"do NOT create animation"）双重保障。如果仍有问题，后续可在 Prompt 中追加更强的约束词（如 "ABSOLUTELY NO visual continuity between cells"）。这是 Prompt 调优问题，不影响架构。

**[Risk] 旧客户端缓存了不含 mode 的 JS bundle** → API 默认 mode="sequence"，行为与改动前一致，不会破坏任何东西。

**[Trade-off] 不做 frameCount 重命名** → 代码内部语义略有不一致（atlas 模式下 "frame" 含义模糊），但降低了改动范围和回归风险。

**[Trade-off] atlas 仍强制网格布局** → 对于大小不一的图标集（如一把大剑和一瓶小药水），网格切割会留白。但 Prompt 约束 AI 画等大格子，加上网格切割的稳定性，这是 MVP 阶段的最优解。后续可考虑智能切图。
