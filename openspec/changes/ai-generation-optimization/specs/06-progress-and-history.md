# SPEC-06: 多阶段进度与生成历史

## 能力描述

AiProgressToast 支持多阶段进度显示，新增 localStorage 生成历史功能。

## 需求

### REQ-06-1: 多阶段进度

**Given** AI 生成流程启动
**When** 各阶段执行
**Then** Toast 依次显示：
- `生成中...` — 等待 Gemini API 返回 sprite sheet
- `切割中...` — 智能切割 sprite sheet 为独立帧
- `去背景中... (3/6)` — 逐帧去背景，显示帧进度
- `完成 ✓` — 全部帧处理完毕，2秒后自动消失

### REQ-06-2: 生成历史存储

**Given** 一次生成成功完成
**When** 保存历史记录
**Then**
- 存入 localStorage，key: `spriteforge-gen-history`
- 每条记录：{ prompt, style, frameCount, targetSize, thumbnail, timestamp }
- 缩略图：原始 sprite sheet 压缩到 128×128 JPEG quality 60（~5KB）
- 最多保留 10 条，超出删除最旧的

### REQ-06-3: 历史展示与复用

**Given** 用户打开 AiGenerateModal
**When** 存在历史记录
**Then**
- Modal 底部显示可折叠 "Recent Generations" 区域
- 每条显示缩略图 + prompt 摘要 + 帧数 + 时间
- 点击 "Reuse" 按钮 → 填充 prompt / style / frameCount / targetSize 到表单
- 不重新生成，仅填充设置
