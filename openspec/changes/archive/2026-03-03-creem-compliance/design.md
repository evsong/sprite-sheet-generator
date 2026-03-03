## Context

SpriteForge 需要通过 Creem 支付平台账户审核，需补齐法律页面和修复 Footer。

## Goals
- 创建 Privacy Policy 和 Terms of Service 页面
- 修复 Footer 假链接，添加法律页面链接和客服邮箱
- 页面风格与现有网站一致（暗色主题，使用 CSS 变量）

## Non-Goals
- 不涉及支付集成代码
- 不修改现有功能页面

## Decisions

1. **法律页面用静态服务端组件** — 纯文本内容，无需客户端交互，SEO 友好
2. **复用网站现有样式变量** — `var(--bg)`, `var(--font-display)`, `var(--font-mono)` 等
3. **客服邮箱用 `support@spriteforge.dev`** — 需要用户确认实际邮箱地址
4. **Footer 只保留真实链接** — Editor、Pricing 是真实页面保留，其余假链接移除，替换为法律页面链接

## Risks
- 客服邮箱需要用户自行配置域名邮箱，确保能收到邮件
