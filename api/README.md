# 边缘函数部署指南

本目录包含人生 K 线应用的边缘函数配置。

## 📁 目录结构

```
api/
├── functions/          # 边缘函数源代码
│   └── klineAnalysis.js
├── wrangler.toml      # Cloudflare Workers 配置
└── README.md          # 本文档
```

## 🚀 部署方式

### 方式一: Cloudflare Workers

#### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare

```bash
wrangler login
```

#### 3. 配置 wrangler.toml

编辑 `wrangler.toml`,设置:

```toml
name = "life-kline-edge-functions"
main = "functions/klineAnalysis.js"
compatibility_date = "2024-01-01"

[[routes]]
pattern = "https://your-domain.com/api/*"
zone_name = "your-domain.com"
```

#### 4. 部署

```bash
# 开发环境
wrangler dev

# 生产环境
wrangler publish
```

#### 5. 配置环境变量

在 Cloudflare Dashboard 中配置密钥:

1. 进入 Cloudflare Dashboard
2. 选择你的 Workers 项目
3. Settings → Variables and Secrets
4. 添加环境变量或密钥

### 方式二: ESA Edge Functions

#### 1. 准备工作

确保你已启用阿里云 ESA Pages 服务。

#### 2. 创建边缘函数

在 ESA Pages 控制台:

1. 进入项目设置 → 边缘函数
2. 创建新函数: `klineAnalysis`
3. 粘贴 `functions/klineAnalysis.js` 的内容
4. 设置路由: `/api/kline-analysis`

#### 3. 配置环境变量

在边缘函数设置中:

```bash
# 环境变量
ENVIRONMENT=production
API_VERSION=v1

# 密钥（在控制台配置,不要写在代码中）
AI_API_KEY=your-actual-api-key
```

#### 4. 部署

保存配置后自动部署到 ESA 边缘节点。

## 🔧 API 接口说明

### POST /api/kline-analysis

八字分析和 K 线图数据生成。

#### 请求体

```json
{
  "name": "张三",
  "birthDate": "1990-01-01",
  "birthTime": "12:30",
  "gender": "male"
}
```

#### 响应

```json
{
  "id": "uuid",
  "name": "张三",
  "birthData": {
    "birthDate": "1990-01-01",
    "birthTime": "12:30",
    "gender": "male"
  },
  "bazi": {
    "year": "甲子",
    "month": "乙丑",
    "day": "丙寅",
    "hour": "丁卯",
    "wuxing": {
      "year": "金",
      "month": "木",
      "day": "火",
      "hour": "火"
    }
  },
  "klineData": [...],
  "dimensions": {
    "career": 75,
    "wealth": 68,
    "health": 82,
    "love": 71,
    "study": 79
  }
}
```

## 🔒 安全最佳实践

### 1. 环境变量隔离

**❌ 错误做法**:
```javascript
const apiKey = 'sk-1234567890abcdef';
```

**✅ 正确做法**:
```javascript
// Cloudflare Workers
const apiKey = env.AI_API_KEY;

// ESA Edge Functions
const apiKey = process.env.AI_API_KEY;
```

### 2. CORS 配置

边缘函数已配置 CORS 头:

```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

生产环境建议限制具体域名:

```javascript
const ALLOWED_ORIGINS = [
  'https://your-domain.com',
  'https://your-app.pages.dev',
];

const origin = request.headers.get('Origin');
if (ALLOWED_ORIGINS.includes(origin)) {
  headers['Access-Control-Allow-Origin'] = origin;
}
```

### 3. 请求限流

建议添加限流中间件:

```javascript
// 伪代码示例
const rateLimit = new Map();

function checkRateLimit(ip) {
  const key = `${ip}:${Math.floor(Date.now() / 60000)}`;
  const count = rateLimit.get(key) || 0;

  if (count > 100) { // 每分钟 100 次
    throw new Error('Rate limit exceeded');
  }

  rateLimit.set(key, count + 1);
}
```

## 📊 性能优化

### 1. 缓存策略

使用 KV 或 D1 存储计算结果:

```javascript
async function getCachedResult(key) {
  const cached = await env.CACHE.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

async function setCachedResult(key, value, ttl = 3600) {
  await env.CACHE.put(key, JSON.stringify(value), {
    expirationTtl: ttl,
  });
}
```

### 2. CDN 缓存

设置合适的缓存头:

```javascript
headers: {
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  'CDN-Cache-Control': 'public, max-age=86400',
}
```

## 🧪 测试

### 本地测试

使用 Wrangler 本地开发:

```bash
wrangler dev
```

测试 API:

```bash
curl -X POST http://localhost:8787/api/kline-analysis \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","birthDate":"1990-01-01"}'
```

### 远程测试

部署后测试:

```bash
curl -X POST https://your-worker.workers.dev/api/kline-analysis \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","birthDate":"1990-01-01"}'
```

## 📝 开发指南

### 添加新函数

1. 在 `functions/` 目录创建新文件
2. 导出 `fetch` 函数:

```javascript
export default {
  async fetch(request, env, ctx) {
    // 处理请求
    return new Response('Hello');
  },
};
```

3. 在 `wrangler.toml` 添加路由配置

### 本地开发

```bash
# 启动开发服务器
wrangler dev --local

# 监听文件变化自动重启
wrangler dev --local --watch
```

## 🚨 故障排查

### 常见问题

**Q: 部署失败**

A: 检查 `wrangler.toml` 配置,确保名称唯一,路由正确。

**Q: 请求 404**

A: 确认路由配置正确,检查 `pattern` 匹配规则。

**Q: 环境变量未生效**

A: 确保在控制台配置,而不是写在代码中。检查变量名称大小写。

**Q: CORS 错误**

A: 检查响应头是否包含正确的 CORS 头。确认请求的 `Origin` 在允许列表中。

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [ESA Pages 文档](https://www.aliyun.com/product/esa-pages)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
