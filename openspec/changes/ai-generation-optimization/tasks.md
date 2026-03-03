# Tasks: AI 生图流程优化

## 阶段 1: 基础设施

- [x] 1.1 更新环境变量：.env.local 添加 GEMINI_PROXY_URL 和 GEMINI_PROXY_TOKEN，移除旧的 GEMINI_FREE_API_URL/KEY
- [ ] 1.2 更新 Vercel 环境变量：添加 GEMINI_PROXY_URL 和 GEMINI_PROXY_TOKEN

## 阶段 2: 后端 API 改造

- [x] 2.1 改写 /api/ai/generate/route.ts：切换到 Gemini 原生格式，1次请求生成 sprite sheet
- [x] 2.2 实现系统 prompt 拼接逻辑：网格计算 + 约束模板 + 用户 prompt 组合
- [x] 2.3 改写 /api/ai/transform/route.ts：切换到 Gemini 原生多模态格式
- [ ] 2.4 验证 code.newcli.com API 连通性：测试生图请求，确认 User-Agent header 防 Cloudflare 1010

## 阶段 3: Prompt 模板系统

- [x] 3.1 新建 src/lib/prompt-templates.ts：8 个预设模板数据（名称、prompt、默认帧数、图标）
- [x] 3.2 实现系统 prompt 构造函数：buildSystemPrompt(userPrompt, frameCount, style)
- [x] 3.3 实现网格计算函数：getOptimalGrid(frameCount) → { rows, cols }

## 阶段 4: Sprite Sheet 智能切割

- [x] 4.1 新建 src/lib/sprite-sheet-splitter.ts：模块骨架和类型定义
- [x] 4.2 实现等分网格计算：frameCount → cellW/cellH
- [x] 4.3 实现分割线像素扫描验证：沿预期分割线检测背景色占比
- [x] 4.4 实现分割线微调：偏移时在 ±10px 范围搜索最佳位置
- [x] 4.5 实现 Canvas 切割：drawImage 到独立 canvas，输出 HTMLImageElement[]
- [x] 4.6 实现 fallback 逻辑：智能检测失败时回退到纯等分

## 阶段 5: 棋盘格去背景

- [x] 5.1 在 src/lib/bg-removal.ts 新增 detectCheckerboard：四角 8×8 采样检测
- [x] 5.2 实现 removeCheckerboard：颜色替换（容差 ±30）+ 边缘 anti-aliasing
- [x] 5.3 实现 fallback 逻辑：检测不到棋盘格时调用现有 removeBackground (RMBG-1.4)
- [x] 5.4 实现批量处理函数：processFrames(images[]) → 逐帧去背景 + 进度回调

## 阶段 6: 前端生成流程串联

- [x] 6.1 实现 generateSpriteSheet 主流程函数：API调用 → 切割 → 去背景 → addSprites → setAnimationFrames
- [x] 6.2 实现目标尺寸 resize：切割后每帧按 targetSize 缩放
- [x] 6.3 对接 editor-store：批量添加帧到 sprite 列表和动画时间线

## 阶段 7: AiGenerateModal 重设计

- [x] 7.1 重写 Modal 布局：标题栏 + 模板区 + 输入区 + 设置区 + 历史区 + 生成按钮
- [x] 7.2 实现模板选择卡片网格（2×4）：点击填充 prompt + 帧数
- [x] 7.3 新增目标尺寸选择 UI：4 个选项（32/64/128/256），默认 64
- [x] 7.4 对接新的 generateSpriteSheet 流程替代旧的 generateInBackground

## 阶段 8: 多阶段进度

- [x] 8.1 改写 AiProgressToast：支持 stage 字段（generating/splitting/removing-bg/done）
- [x] 8.2 更新 editor-store aiProgress 类型：新增 stage 和 stageLabel
- [x] 8.3 各阶段进度回调对接：生成→切割→去背景逐帧进度

## 阶段 9: 生成历史

- [x] 9.1 新建 src/lib/generation-history.ts：localStorage CRUD（save/load/delete）
- [x] 9.2 实现缩略图压缩：sprite sheet → 128×128 JPEG quality 60
- [x] 9.3 在 AiGenerateModal 底部添加可折叠 Recent Generations 区域
- [x] 9.4 实现 Reuse 功能：点击历史记录填充表单设置

## 阶段 10: 集成测试与部署

- [ ] 10.1 本地端到端测试：生成 → 切割 → 去背景 → 播放完整流程
- [ ] 10.2 验证棋盘格去背景效果：多种风格图片测试
- [ ] 10.3 验证 fallback 路径：棋盘格失败 → RMBG-1.4，智能切割失败 → 等分
- [ ] 10.4 部署到 Vercel 生产环境：更新环境变量 + 推送代码
