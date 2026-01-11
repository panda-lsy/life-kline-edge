# Edge Functions (边缘函数)

此目录包含阿里云 ESA 边缘函数代码。

## 边缘函数列表

- `calculate-bazi.ts` - 八字排盘计算
- `ai-analyze.ts` - AI 分析代理
- `history.ts` - 历史记录管理
- `cache-proxy.ts` - 缓存代理

## 规范

- 兼容 Cloudflare Workers API
- 使用 TypeScript 编写
- 导出 `onRequest` 处理函数
- 环境变量通过 `env` 参数访问

## 部署

```bash
# 部署到 ESA
esa deploy edge-functions/
```
