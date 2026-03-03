# SPEC-02: Sprite Sheet 智能切割

## 能力描述

客户端接收 Gemini 生成的 sprite sheet 图片，智能检测帧边界并切割为独立帧。

## 需求

### REQ-02-1: 网格计算

**Given** 帧数 N
**When** 计算最优网格
**Then**
- 2→2×1, 3→3×1, 4→2×2, 5→3×2, 6→3×2
- 8→4×2, 9→3×3, 10→5×2
- cellW = imageWidth / cols, cellH = imageHeight / rows

### REQ-02-2: 智能验证

**Given** 一张 sprite sheet 和预期网格
**When** 执行分割线验证
**Then**
- 沿每条预期分割线（水平/垂直）扫描像素
- 如果该线上 >70% 像素是背景色 → 确认分隔线
- 如果检测到偏移 → 微调位置（±10px 范围内搜索最佳分割线）
- 完全检测不到分隔 → fallback 到纯等分

### REQ-02-3: Canvas 切割

**Given** 确定的网格边界
**When** 执行切割
**Then**
- 对每个 cell 用 drawImage 绘制到独立 canvas
- 输出 HTMLImageElement 数组
- 按左到右、上到下顺序编号
