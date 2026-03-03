# SPEC-01: Gemini 原生 API 集成

## 能力描述

将后端 AI 生图 API 从 OpenAI 兼容格式切换到 Google Gemini 原生格式，通过 code.newcli.com 代理调用。

## 需求

### REQ-01-1: 文生图 API 切换

**Given** 用户提交生成请求（prompt + style + frameCount + targetSize）
**When** 后端处理 POST /api/ai/generate
**Then**
- 构造 Gemini 原生格式请求体（contents + generationConfig）
- 调用 `GEMINI_PROXY_URL/v1beta/models/gemini-3-pro-image:generateContent`
- 携带 `Authorization: Bearer GEMINI_PROXY_TOKEN` 和 `User-Agent` header
- 返回 `{ spriteSheet, frameCount, gridCols, gridRows }`

### REQ-01-2: 系统 Prompt 拼接

**Given** 用户输入 prompt 和帧数 N
**When** 后端构造请求
**Then**
- 自动计算最优网格（rows × cols）
- 在用户 prompt 前拼接系统约束模板
- 模板包含：帧数、网格排列、一致性要求、背景要求、禁止标签/边框

### REQ-01-3: 图生图 API 切换

**Given** 用户提交 transform 请求（action + imageBase64 + prompt）
**When** 后端处理 POST /api/ai/transform
**Then**
- 使用 Gemini 原生多模态格式（图片 base64 + 文本指令）
- 调用 `gemini-3-pro` 模型
- 支持 variants / recolor / upscale / extend-frames 四种操作

### REQ-01-4: 环境变量

**Given** 部署到 Vercel 或本地开发
**When** 服务启动
**Then**
- 读取 `GEMINI_PROXY_URL`（默认 https://code.newcli.com/gemini）
- 读取 `GEMINI_PROXY_TOKEN`
- 旧的 `GEMINI_FREE_API_URL` / `GEMINI_FREE_API_KEY` 不再使用
