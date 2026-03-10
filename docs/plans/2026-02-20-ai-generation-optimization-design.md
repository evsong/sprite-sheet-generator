# SpriteForge AI 生图流程优化设计

> 日期: 2026-02-20

## 概述

将 AI 精灵图生成从"逐帧串行生成"改为"一次生成 sprite sheet + 客户端智能切割"，同时切换 API 到 code.newcli.com/gemini，提升专业度。

## 整体流程

```
用户选择模板/输入 prompt + style + 帧数 + 目标尺寸
  ↓
后端构造 Gemini 原生格式请求（系统 prompt 增强 + 网格约束）
  ↓
1次调用 code.newcli.com/gemini → 返回 1张 1024×1024 JPEG sprite sheet
  ↓
客户端智能切割：
  1. 按帧数计算最优网格（等分）
  2. 像素扫描验证分割线位置
  3. 不一致时 fallback 到纯等分
  ↓
去背景（每帧）：
  主力：棋盘格颜色检测+替换（~50ms/帧）
  备用：RMBG-1.4 模型推理（~2-3s/帧）
  ↓
按目标尺寸 resize → 自动加入 sprite 列表 + 动画时间线 → 可立即播放
```

## 后端改造

### API 切换

| 项目 | 旧 | 新 |
|------|----|----|
| Endpoint | gemini-api.inspiredjinyao.com/v1/images/generations | code.newcli.com/gemini/v1beta/models/{model}:generateContent |
| 格式 | OpenAI 兼容 | Google Gemini 原生 |
| Auth | Bearer {gemini-free-api-key} | Bearer sk-ant-oat01-6Is4V7bH... |
| 请求次数 | N次（每帧1次） | 1次（整张 sprite sheet） |
| 必须 Header | 无 | User-Agent（防 Cloudflare 1010） |

### 环境变量

```
GEMINI_PROXY_URL=https://code.newcli.com/gemini
GEMINI_PROXY_TOKEN=sk-ant-oat01-6Is4V7bHAAgdDdQg6xHfmhNyLhRKM8lCzX-qYiJ9cayWAVVGEs9YFhp_xx8UofWrctoLRzONGYxdXmqxkxUeKWHJDRGThAA
```

### /api/ai/generate/route.ts

请求格式：
```json
{
  "contents": [{"parts": [{"text": "系统prompt + 用户prompt"}]}],
  "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
}
```

响应格式：
```json
{
  "candidates": [{
    "content": {
      "parts": [
        {"inlineData": {"mimeType": "image/jpeg", "data": "base64..."}}
      ]
    }
  }]
}
```

返回给前端：
```json
{
  "spriteSheet": "data:image/jpeg;base64,...",
  "frameCount": 6,
  "gridCols": 3,
  "gridRows": 2
}
```

### /api/ai/transform/route.ts

同步切换到 Gemini 原生格式，图生图用 gemini-3-pro 多模态。

### 系统 Prompt 模板

```
Create a sprite sheet with exactly {N} animation frames arranged in
a {rows}×{cols} grid. Each frame must be exactly the same size.
Frames should flow left-to-right, top-to-bottom.
Keep consistent character proportions across all frames.
{style} style, suitable for game engine import.
Use a solid checkerboard gray-white background behind the character.
DO NOT add labels, numbers, or borders between frames.

User request: {userPrompt}
```

## 客户端新模块

### src/lib/sprite-sheet-splitter.ts

**Step 1 — 等分网格计算**

帧数到网格映射：
- 2帧→2×1, 3帧→3×1, 4帧→2×2
- 5帧→3×2, 6帧→3×2, 8帧→4×2
- 9帧→3×3, 10帧→5×2

**Step 2 — 智能验证**

- 沿每条预期分割线扫描像素
- 大部分像素是背景色 → 确认分隔线
- 检测到偏移 → 微调位置（±几像素）
- 完全检测不到 → fallback 纯等分

**Step 3 — Canvas 切割**

- 对每个 cell drawImage 到独立 canvas
- 输出 HTMLImageElement 数组

### src/lib/bg-removal.ts — 新增 removeCheckerboard

**检测逻辑**：
1. 采样四角各 8×8 区域像素
2. 检测交替两种颜色（典型：#C0C0C0 + #FFFFFF）
3. 提取两种颜色，遍历所有像素，容差 ±30 内设 alpha=0
4. 边缘像素半透明过渡（anti-aliasing）
5. 检测不到棋盘格 → fallback 到 removeBackground（RMBG-1.4）

## 前端改造

### AiGenerateModal 重设计

```
[标题 + 关闭]
─────────────────────────
[模板选择卡片网格 2×4]
  点击自动填充 prompt + 帧数
─────────────────────────
[Prompt 输入框]（模板填充后可编辑）
[风格选择] [目标尺寸选择]
[帧数滑块]
─────────────────────────
▾ Recent Generations
  缩略图卡片 × 最近10条 [Reuse]
─────────────────────────
[生成按钮]
```

### 预设模板

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

### 目标尺寸选择

| 选项 | 说明 |
|------|------|
| 32×32 | 复古像素风 |
| 64×64 | 标准像素风 |
| 128×128 | 高清像素/手绘 |
| 256×256 | 大尺寸精灵 |

### AiProgressToast 多阶段

显示三阶段进度：生成中 → 切割中 → 去背景中 → 完成

### 生成历史

- localStorage 存最近 10 条
- 每条：{ prompt, style, frameCount, targetSize, thumbnail(~5KB), timestamp }
- 缩略图压缩到 128×128 JPEG quality 60
- 点 Reuse 重新填充设置

## 文件改动清单

| 文件 | 操作 | 说明 |
|------|------|------|
| src/app/api/ai/generate/route.ts | 改写 | OpenAI→Gemini原生，1次请求 |
| src/app/api/ai/transform/route.ts | 改写 | 同步切换Gemini原生 |
| src/lib/sprite-sheet-splitter.ts | 新建 | 智能切割算法 |
| src/lib/bg-removal.ts | 扩展 | 新增 removeCheckerboard |
| src/components/editor/AiGenerateModal.tsx | 重写 | 模板+尺寸+历史+新流程 |
| src/components/editor/AiProgressToast.tsx | 改写 | 多阶段进度 |
| src/lib/prompt-templates.ts | 新建 | 模板数据+系统prompt |
| src/lib/generation-history.ts | 新建 | localStorage 历史管理 |
| .env.local / Vercel 环境变量 | 更新 | GEMINI_PROXY_URL + TOKEN |

## 可用模型

| 模型 | 用途 | 用户层级 |
|------|------|---------|
| gemini-3-pro-image | 标准生图 | FREE |
| gemini-3-pro-image-2k | 2K高清 | PRO |
| gemini-3-pro-image-4k | 4K超高清 | TEAM |
| gemini-3-pro | 图生图(variants/recolor/extend) | 全部 |
