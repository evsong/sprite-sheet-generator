# Design: AI 生图流程优化

## 架构概览

```
[AiGenerateModal] → POST /api/ai/generate
                         ↓
                   code.newcli.com/gemini (Gemini 原生格式)
                         ↓
                   返回 { spriteSheet, frameCount, gridCols, gridRows }
                         ↓
[sprite-sheet-splitter.ts] → 智能切割为 N 帧
                         ↓
[bg-removal.ts] → 棋盘格替换(主力) / RMBG-1.4(备用)
                         ↓
[editor-store] → addSprites + setAnimationFrames → 可播放
```

## 文件结构

### 新建文件
- `src/lib/sprite-sheet-splitter.ts` — 切割算法
- `src/lib/prompt-templates.ts` — 模板数据 + 系统 prompt 构造
- `src/lib/generation-history.ts` — localStorage 历史管理

### 改写文件
- `src/app/api/ai/generate/route.ts` — Gemini 原生 API
- `src/app/api/ai/transform/route.ts` — Gemini 原生多模态
- `src/components/editor/AiGenerateModal.tsx` — 完整重设计
- `src/components/editor/AiProgressToast.tsx` — 多阶段进度
- `src/lib/bg-removal.ts` — 新增 removeCheckerboard
