# SPEC-04: Prompt 模板系统

## 能力描述

提供预设 prompt 模板和系统 prompt 增强，降低使用门槛，提高生成质量。

## 需求

### REQ-04-1: 预设模板数据

**Given** 用户打开 AI 生成 Modal
**When** 显示模板选择区域
**Then** 提供以下 8 个模板：

| 模板 | 预设 prompt | 默认帧数 |
|------|------------|---------|
| Character Walk Cycle | walking animation, side view | 6 |
| Character Attack | attack slash, wind-up to follow-through | 4 |
| Idle Breathing | subtle idle breathing, gentle movement | 4 |
| Run Cycle | running animation, full stride | 8 |
| Explosion Effect | explosion VFX, fireball to smoke | 6 |
| Coin Spin | spinning coin, 360 degree rotation | 8 |
| Chest Open | treasure chest opening | 4 |
| Death/Defeat | character defeat, falling and fading | 5 |

### REQ-04-2: 模板选择交互

**Given** 用户点击某个模板卡片
**When** 模板被选中
**Then**
- prompt 输入框自动填充模板的预设 prompt
- 帧数滑块自动设为模板默认帧数
- 用户可在此基础上自由编辑

### REQ-04-3: 系统 Prompt 增强

**Given** 用户提交生成请求
**When** 后端构造 API 请求
**Then**
- 在用户 prompt 前自动拼接系统约束
- 系统约束包含：帧数、网格排列方式、一致性要求、背景要求、禁止标签/边框
- 用户不可见系统 prompt
