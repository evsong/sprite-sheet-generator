# Proposal: AI 生图流程优化

## 问题陈述

当前 SpriteForge AI 生图存在以下问题：

1. **API 不稳定** — 使用 macmini Gemini Free API（cookie 认证），频繁 500/400 错误
2. **效率低** — 生成 N 帧需要 N 次 API 请求（串行），10 帧动画等待时间极长
3. **格式不匹配** — 代码用 OpenAI 兼容格式，无法使用更稳定的 code.newcli.com Gemini 原生代理
4. **缺乏后处理** — Gemini 返回 JPEG 棋盘格背景，标记为 PNG 但实际不透明
5. **用户体验差** — 无 prompt 模板、无尺寸选择、无生成历史、Modal UI 简陋

## 解决方案

### 核心改造
- 切换到 `code.newcli.com/gemini` Gemini 原生 API
- 1 次请求生成整张 sprite sheet（含 N 帧），替代 N 次请求
- 客户端智能切割 sprite sheet 为独立帧
- 棋盘格检测+颜色替换去背景（主力），RMBG-1.4 备用

### 专业度提升
- 预设 prompt 模板（8 种常见游戏动画类型）
- 系统 prompt 增强（自动拼接网格约束）
- 目标尺寸选择（32/64/128/256px）
- 生成历史（localStorage，最近 10 条）
- AiGenerateModal UI 重设计

## 范围

### 包含
- 后端 API 路由改写（generate + transform）
- 客户端 sprite sheet 切割算法
- 棋盘格去背景算法
- Prompt 模板系统
- AiGenerateModal 重设计
- AiProgressToast 多阶段进度
- 生成历史功能
- 环境变量更新

### 不包含
- Stripe 支付集成
- 用户层级限制调整
- 新的导出格式
- 编辑器移动端适配
