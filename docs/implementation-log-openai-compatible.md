# OpenAI 兼容 API 配置支持 - 实现日志

## 变更日期
2026-01-10

## 变更概述
为 AI 服务客户端添加 OpenAI 兼容 API 配置支持，允许用户使用任意 OpenAI 兼容的 API（如本地模型、自定义代理、第三方服务等），而不仅限于 Gemini、DeepSeek 或 OpenAI 官方 API。

## 变更原因
用户需求：希望 AI 部分支持类似 Claude Code 的配置方式，使用标准的 OpenAI 兼容 API（`OPENAI_API_KEY` + `OPENAI_BASE_URL`），而不是默认使用 Gemini。

## 实现细节

### 1. 新增模型类型
在 `src/services/aiClient.ts` 中添加了新的模型类型 `openai-compatible`：

```typescript
export type AIModel = 'openai-compatible' | 'gpt-4o' | 'deepseek' | 'gemini';
```

### 2. 环境变量支持
支持以下环境变量配置 OpenAI 兼容 API：

- `OPENAI_API_KEY`: API 密钥（通用）
- `OPENAI_BASE_URL`: API 端点（可选）
- `OPENAI_MODEL`: 模型名称（可选，默认 gpt-4o-mini）
- `VITE_OPENAI_BASE_URL`: Vite 前缀的端点配置（备选）
- `VITE_OPENAI_MODEL`: Vite 前缀的模型配置（备选）

### 3. 优先级调整
更新了 `getDefaultClient()` 函数的模型选择优先级：

1. **OpenAI 兼容**（最高优先级）
2. OpenAI 官方 GPT-4o
3. DeepSeek
4. Gemini（最低优先级）

### 4. API 请求格式
`openai-compatible` 模型使用标准 OpenAI API 格式：

```json
{
  "model": "gpt-4o-mini",
  "messages": [{"role": "user", "content": "..."}],
  "temperature": 0.7,
  "max_tokens": 8192
}
```

### 5. 响应解析
使用 OpenAI 兼容的响应格式解析：

```typescript
data.choices?.[0]?.message?.content
```

## 文件修改

### 修改的文件

#### 1. `src/services/aiClient.ts`
- 添加 `openai-compatible` 模型类型
- 更新 `getProviderConfig()` 函数支持新模型
- 更新 `buildRequestBody()` 函数注释
- 更新 `extractContent()` 函数注释
- 更新 `getDefaultClient()` 函数优先级逻辑

#### 2. `src/services/prompts.ts`
- 更新 `AnalysisConfig` 接口的 `model` 类型定义

#### 3. `.env.example`
- 完全重写环境变量配置文件
- 添加 OpenAI 兼容 API 配置说明
- 添加多个配置方案示例（官方、国内代理、本地模型等）
- 更新优先级说明

#### 4. `src/services/__tests__/aiClient.test.ts`
- 更新测试用例支持 `openai-compatible` 模型
- 添加新模型类型测试
- 添加自定义端点测试
- 添加自定义模型名称测试

### 测试结果

所有测试通过：
- **测试文件**: 3 个
- **测试通过**: 69 个
- **测试跳过**: 8 个（与之前相同）
- **测试失败**: 0 个

### 新增测试用例

```typescript
it('应该成功调用 OpenAI 兼容 API', async () => {
  const client = createAIClient({
    model: 'openai-compatible',
    customApiKey: testApiKey,
    customEndpoint: 'https://api.example.com/v1/chat/completions',
  });
  // ... 测试逻辑
});

it('应该支持自定义模型名称（OpenAI 兼容）', async () => {
  // ... 测试逻辑
});
```

## 配置示例

### 方案一：OpenAI 官方 API
```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-4o-mini
```

### 方案二：国内代理（SiliconFlow）
```bash
OPENAI_API_KEY=sk-your-siliconflow-key
OPENAI_BASE_URL=https://api.siliconflow.cn/v1/chat/completions
OPENAI_MODEL=Qwen/Qwen2.5-72B-Instruct
```

### 方案三：本地模型（Ollama）
```bash
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1/chat/completions
OPENAI_MODEL=qwen2.5:latest
```

### 方案四：使用自定义配置
```typescript
import { createAIClient } from '@/services/aiClient';

const client = createAIClient({
  model: 'openai-compatible',
  customApiKey: 'your-api-key',
  customEndpoint: 'https://your-api-endpoint.com/v1/chat/completions',
});
```

## 向后兼容性

所有现有配置保持完全兼容：

- ✅ Gemini API (`VITE_GEMINI_API_KEY`)
- ✅ DeepSeek API (`VITE_DEEPSEEK_API_KEY`)
- ✅ OpenAI 官方 API (`VITE_OPENAI_API_KEY`)
- ✅ 新增 OpenAI 兼容 API (`OPENAI_API_KEY`)

## 设计原则

### KISS（简单至上）
- 使用标准的环境变量命名（`OPENAI_API_KEY`, `OPENAI_BASE_URL`）
- 与 OpenAI 官方 SDK 和其他工具保持一致

### DRY（杜绝重复）
- 复用现有的 OpenAI API 请求/响应处理逻辑
- `openai-compatible` 和 `gpt-4o` 使用相同的代码路径

### SOLID
- **单一职责**: `getProviderConfig()` 负责配置获取，不涉及业务逻辑
- **开闭原则**: 通过添加新的 case 分支支持新模型，无需修改现有逻辑
- **依赖倒置**: 依赖抽象的 `AIModel` 类型，而非具体实现

## 注意事项

1. **API 密钥安全**: 前端调用 API 时，密钥会暴露在客户端
2. **生产环境**: 建议使用边缘函数或后端代理保护密钥
3. **模型兼容性**: 确保使用的 API 服务完全兼容 OpenAI API 格式
4. **环境变量优先级**: `OPENAI_*` > `VITE_OPENAI_*`

## 相关文档

- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Ollama REST API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [SiliconFlow API 文档](https://docs.siliconflow.cn/)

## 未来改进

- [ ] 添加更多 OpenAI 兼容服务的预设配置
- [ ] 支持流式响应（SSE）
- [ ] 添加 API 使用量统计
- [ ] 实现请求缓存机制
- [ ] 添加更多测试用例覆盖边界情况
