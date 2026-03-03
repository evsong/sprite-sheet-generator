# SPEC-03: 棋盘格去背景

## 能力描述

检测并移除 Gemini 生成图片中的棋盘格背景，输出透明 PNG。棋盘格替换为主力方案，RMBG-1.4 为备用。

## 需求

### REQ-03-1: 棋盘格检测

**Given** 一帧切割后的图片
**When** 执行棋盘格检测
**Then**
- 采样图片四角各 8×8 区域像素
- 检测是否存在交替的两种颜色（典型：#C0C0C0 + #FFFFFF 或类似灰白交替）
- 返回 { detected: boolean, color1, color2 }

### REQ-03-2: 颜色替换

**Given** 检测到棋盘格模式，提取两种背景色
**When** 执行颜色替换
**Then**
- 遍历所有像素，颜色与两种背景色距离 ≤30（RGB 欧氏距离）→ alpha 设为 0
- 边缘像素做半透明过渡（anti-aliasing），避免硬边
- 性能目标：~50ms/帧（1024×1024 → 切割后更小）

### REQ-03-3: Fallback 到 RMBG-1.4

**Given** 四角检测不到棋盘格模式
**When** 棋盘格方案失败
**Then**
- 调用现有 removeBackground（RMBG-1.4 模型）
- 首次加载模型 ~3s，后续 ~2s/帧
