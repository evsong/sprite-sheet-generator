# Sprite Sheet Generator — Brainstorming Results

> 日期: 2026-02-16
> 关键词: sprite sheet generator (480K/月, KD 20%)

## 竞品格局

| 工具 | 类型 | 价格 | 核心优势 | 核心劣势 |
|------|------|------|---------|---------|
| TexturePacker | 桌面应用 | $49.99 买断 | 48+引擎格式、MaxRects/多边形打包、裁剪、CLI/CI | 收费、需安装 |
| Piskel | 浏览器+桌面 | 免费开源 | 像素画创作+动画 | 导出弱、技术老旧、无智能打包 |
| CodeShack | 浏览器 | 免费 | 拖拽上传、纯客户端 | 网格排列only、无数据文件、无裁剪 |
| TP Online | 浏览器 | 免费 | CodeAndWeb 品牌 | 功能极度阉割 |
| ShoeBox | 桌面(AIR) | 免费 | 曾经不错 | Adobe AIR 已死 |
| AI工具(Rosebud/Ludo/Pixa) | 浏览器 | 免费增值 | 文字生成精灵图 | 质量不稳定、不是打包工具 |

### 市场空白
免费在线工具太基础（只能网格排列）。专业工具要 $50+ 且需安装桌面端。
没有一个免费 Web 工具同时提供：智能打包(MaxRects)、透明裁剪、动画预览、多引擎数据格式导出。

### 新趋势
AI 精灵图生成在 Reddit 上很火（2025-2026 多个热帖），但它是"创建"精灵图，不是"打包"。两者互补。

---

## 5 个核心决策

### D1: MVP 范围
**选择: C — 打包器 + AI 生成**
一站式工作流：文字描述 → AI 生成精灵帧 → 智能打包 → 导出精灵表+数据文件。
差异化最强，蹭 AI 热点。

### D2: 差异化策略（全部纳入 MVP）
1. **"生成即打包"一站式体验** — 输入文字 → AI 生成风格一致的精灵帧 → 自动打包 → 导出
2. **纯浏览器端、零安装** — 打包逻辑全客户端(Canvas/WASM)，图片不上传。AI 走 API
3. **游戏引擎深度集成** — 导出可直接复制的引擎代码片段(Phaser/PixiJS/Unity/Godot)
4. **动画工作流** — 帧序列预览、帧率调节、洋葱皮透视、帧重排拖拽

### D3: 技术架构
- **前端**: Next.js + TailwindCSS + Vercel
- **打包算法**: MaxRects bin packing (JS 客户端, `maxrects-packer` 库)
- **透明裁剪**: Canvas API 像素扫描
- **AI 方案**: 混合 — MVP 接第三方 API (Stability AI / DALL-E / Flux)，后续自建 (ComfyUI + ControlNet)
- **数据库**: PostgreSQL (Prisma + Neon) — 用户系统、项目保存
- **认证**: NextAuth
- **支付**: Stripe

### D4: 商业模式

| | FREE | PRO $9.99/月 | TEAM $29.99/月 |
|---|---|---|---|
| 智能打包(MaxRects) | ✅ | ✅ | ✅ |
| 透明裁剪 | ✅ | ✅ | ✅ |
| 导出格式 | JSON/CSS 仅2种 | 全部15+格式 | 全部15+格式 |
| 动画预览 | 基础 | 高级(洋葱皮/帧率) | 高级 |
| AI 精灵生成 | 3次/天 | 50次/天 | 无限 |
| 引擎代码片段 | ❌ | ✅ | ✅ |
| 批量处理 | 最多20张 | 最多200张 | 无限 |
| 项目保存/历史 | ❌ | ✅ 云端 | ✅ + 团队共享 |

### D5: SEO & 获客
- 主关键词: "sprite sheet generator" (480K/月, KD 20%)
- 长尾: "sprite sheet maker/packer", "AI sprite generator", "free texture packer alternative"
- 引擎教程博客: Phaser/PixiJS/Unity/Godot sprite sheet tutorial
- 免费工具即获客入口 → 注册 → 付费转化
- FREE 用户导出带水印 "Made with [品牌名]"，PRO 去水印
- 社区推广: Reddit r/gamedev, r/indiegaming, IndieHackers

---

## 候选产品名称
- SpriteForge
- SheetCraft
- SpritePack
- PixelForge

---

## 下一步
- [ ] GitHub 开源项目研究 (maxrects-packer, Piskel, Phaser/PixiJS sprite tools)
- [ ] SVG Logo 设计
- [ ] 前端原型设计
- [ ] OpenSpec 规格驱动变更
