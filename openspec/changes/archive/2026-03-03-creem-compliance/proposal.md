## Why

SpriteForge 需要接入 Creem 支付平台收款，但当前网站缺少 Creem 账户审核所需的必要页面（Privacy Policy、Terms of Service）、客服联系方式，且 Footer 包含大量指向 `#` 的假链接，违反 Creem "无虚假信息"政策。审核不通过需等数月才能重新申请，必须一次性准备充分。

## What Changes

- 新增 `/privacy` 隐私政策页面
- 新增 `/terms` 服务条款页面
- 在网站上添加客服邮箱（Footer + Contact 页面）
- 修复 Footer 中所有假链接：移除不存在的页面链接，保留真实链接
- Footer 底部添加 Privacy Policy 和 Terms of Service 链接

## Capabilities

### New Capabilities
- `legal-pages`: Privacy Policy 和 Terms of Service 页面
- `footer-cleanup`: 修复 Footer 假链接，添加法律页面和客服邮箱链接

### Modified Capabilities

## Impact

- 新增文件: `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`
- 修改文件: `src/components/landing/Footer.tsx`
- 无 API 变更，无数据库变更，无依赖变更
