# 历史记录边缘函数

## 功能说明

基于阿里云 ESA Pages KV 存储实现历史记录功能。

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/history` | 获取所有历史记录 |
| POST | `/api/history` | 添加历史记录 |
| DELETE | `/api/history/:id` | 删除指定记录 |
| DELETE | `/api/history` | 清空所有记录 |

## 请求/响应格式

### 添加历史记录 (POST /api/history)

**请求体：**
```json
{
  "birthData": {
    "birthDate": "1990-01-01",
    "birthTime": "12:30",
    "gender": "male",
    "location": {
      "country": "中国",
      "province": "北京",
      "city": "北京",
      "latitude": 39.9042,
      "longitude": 116.4074,
      "timezone": "Asia/Shanghai"
    }
  },
  "baziResult": { /* 八字计算结果 */ },
  "dimensionsResult": { /* 六维度分析结果 */ },
  "klineData": [ /* K线数据数组 */ ]
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "123456789",
    "birthData": { /* ... */ },
    "baziResult": { /* ... */ },
    "dimensionsResult": { /* ... */ },
    "klineData": [ /* ... */ ],
    "createdAt": "2026-01-13T10:30:00.000Z",
    "userId": "anonymous"
  },
  "timestamp": "2026-01-13T10:30:00.000Z"
}
```

## 数据结构

### 历史记录 (HistoryRecord)
```typescript
interface HistoryRecord {
  id: string;                    // 记录 ID
  userId?: string;              // 用户 ID（可选）
  birthData: BirthData;         // 出生信息
  baziResult: BaziResult;       // 八字结果
  dimensionsResult: SixDimensions; // 六维度分析
  klineData: KLineData[];        // K线数据（前20年）
  createdAt: Date;              // 创建时间
  note?: string;               // 备注（可选）
}
```

## 存储策略

### 键命名规范
- **用户列表键**: `history:${userId}` - 存储该用户的所有历史记录 ID
- **单记录键**: `history:${userId}:${recordId}` - 存储单个历史记录完整数据
- **TTL 设置**: 30天（2592000 秒）

### 数据限制
- **记录数量**: 每用户最多 10 条记录
- **清理策略**: 添加新记录时自动删除最旧的记录
- **存储容量**: 遵循 ESA KV 存储限制

## 部署配置

### 1. 创建 KV 命名空间

1. 登录阿里云 ESA 控制台
2. 进入"边缘计算" → "边缘函数"
3. 创建 KV 命名空间：
   - 名称：`life-kline-history`
   - ID：`YOUR_KV_NAMESPACE_ID`
4. 绑定命名空间 ID 到边缘函数

### 2. 更新环境变量

在边缘函数设置中添加：
```
KV_NAMESPACE=YOUR_KV_NAMESPACE_ID
```

### 3. 创建边缘函数

1. 在 ESA Pages 控制台选择"边缘函数"
2. 创建新函数：`history`
3. 将 `api/functions/history.js` 内容粘贴到编辑器
4. 保存并部署

### 4. 配置路由

在边缘函数中配置路由规则：
```
GET /api/history → history.js → onRequest
```

## 测试方法

### 本地测试（使用 wrangler）
```bash
# 安装 wrangler
npm install -g wrangler

# 本地开发
wrangler dev

# 测试 API
curl http://localhost:8787/api/history
curl -X POST http://localhost:8787/api/history -H "Content-Type: application/json" -d '{"test": "data"}'
```

### 远程测试（部署后）
```bash
# 测试获取历史记录
curl https://your-domain.workers.dev/api/history

# 测试添加历史记录
curl -X POST https://your-domain.workers.dev/api/history \
  -H "Content-Type: application/json" \
  -d '{"birthData": {...}}'
```

## 使用说明

### 在前端调用

更新 `src/services/edgeFunctions.ts`，将 API_BASE_URL 修改为实际的边缘函数 URL。

### 用户 ID 机制

- **匿名用户**：基于地理位置生成固定 ID
- **注册用户**：前端可生成和管理自己的用户 ID
- **用户隔离**：不同用户的历史记录完全隔离

### 错误处理

- **404 Not Found**: 请求的路由不存在
- **400 Bad Request**: 请求体格式错误或缺少必填字段
- **500 Internal Server Error**: KV 存储错误或其他服务器错误
- **KV_NOT_CONFIGURED**: KV 命名空间未配置

## 性能优化

### 缓存策略
- 使用 KV 存储自动缓存到全球边缘节点
- 客户端第一次访问较慢，后续访问速度加快
- 30 天 TTL 平衡了数据新鲜度和存储成本

### 数据清理
- 自动删除超过 30 天的记录
- 自动限制每用户最多 10 条记录
- 避免 KV 存储配额超限

## 安全特性

- CORS 支持：允许前端跨域调用
- 请求验证：严格验证请求体格式和必填字段
- 用户隔离：基于地理位置或用户 ID 隔离数据
- 错误日志：详细的错误日志便于排查问题

## 扩展建议

1. **数据同步**：实现本地 localStorage 和 KV 存储的双向同步
2. **高级搜索**：支持日期范围、维度评分等高级筛选
3. **数据导入导出**：支持 JSON、CSV 格式的数据备份
4. **统计分析**：提供用户行为分析和统计功能
