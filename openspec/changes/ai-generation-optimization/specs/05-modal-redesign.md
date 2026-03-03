# SPEC-05: AiGenerateModal 重设计

## 能力描述

重新设计 AI 生成 Modal，加入模板选择、目标尺寸、生成历史，适配新的 sprite sheet 生成流程。

## 需求

### REQ-05-1: Modal 布局

**Given** 用户点击 AI Generate 按钮
**When** Modal 打开
**Then** 从上到下显示：
1. 标题栏 + 关闭按钮
2. 模板选择卡片网格（2×4），每个卡片带图标+名称
3. Prompt 输入框（可编辑，模板可填充）
4. 风格选择按钮行（保留现有 8 种风格）
5. 目标尺寸选择（32/64/128/256px）
6. 帧数滑块（1-10）
7. 可折叠的 Recent Generations 区域
8. 生成按钮

### REQ-05-2: 目标尺寸选择

**Given** Modal 显示尺寸选项
**When** 用户选择尺寸
**Then**
- 提供 4 个选项：32×32 / 64×64 / 128×128 / 256×256
- 默认选中 64×64
- 选中尺寸传递给后端，用于切割后 resize

### REQ-05-3: 生成流程对接

**Given** 用户点击生成按钮
**When** 触发生成
**Then**
- 关闭 Modal
- 调用 /api/ai/generate（传 prompt, style, frameCount, targetSize）
- 接收 spriteSheet → 调用切割 → 调用去背景 → addSprites + 设置动画帧
- 全程通过 AiProgressToast 显示进度
