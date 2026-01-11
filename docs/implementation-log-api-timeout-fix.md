# AI 客户端 API 超时问题修复

## 变更日期
2026-01-10

## 变更概述
修复 AI 客户端调用 OpenAI 兼容 API 时的超时问题，将默认超时时间从 30 秒增加到 120 秒，并添加详细的调试日志。

## 问题描述

### 错误日志
```
AI 调用失败，1000ms 后重试 (1/3)... Error: 请求超时（30000ms）
AI 调用失败，2000ms 后重试 (2/3)... Error: 请求超时（30000ms）
```

### 根本原因

1. **超时时间太短**：默认 30 秒超时不足以处理复杂的 AI 分析任务
2. **提示词过长**：generateAnalysisPrompt 生成约 3000+ 字符的提示词
3. **输出数据量大**：AI 需要生成 100 年的 K 线数据（100 个 JSON 对象）+ 六个维度分析 + 3-5 个转折点
4. **智谱 AI 响应慢**：glm-4-flash 模型处理复杂提示词需要较长时间

## 修复方案

### 1. 增加超时时间

**文件**: `src/services/aiClient.ts`

**修改前**:
```typescript
const DEFAULT_CONFIG = {
  maxRetries: 3,
  timeout: 30000, // 30 秒
  retryDelay: 1000,
};
```

**修改后**:
```typescript
const DEFAULT_CONFIG = {
  maxRetries: 3,
  timeout: 120000, // 120 秒 - AI 分析可能需要较长时间
  retryDelay: 1000,
};
```

**行号**: 第 71-75 行

### 2. 添加详细调试日志

**文件**: `src/services/aiClient.ts`

**新增日志**:
```typescript
// 发送请求前
console.log(`📤 发送 AI 请求到: ${endpoint}`);
console.log(`🔑 使用模型: ${model}`);
console.log(`⏱️  超时设置: ${timeout}ms (${timeout / 1000}秒)`);
console.log(`📝 Prompt 长度: ${prompt.length} 字符`);

// 响应成功
console.log(`✅ AI 响应成功，内容长度: ${content.length} 字符`);

// 超时错误提示
console.error(`⏰ 请求超时 (${timeoutSec}秒)，请尝试：`);
console.error('   1. 检查网络连接');
console.error('   2. 增加超时时间（修改 aiClient.ts 中的 timeout 配置）');
console.error('   3. 使用更快的模型或简化提示词');
```

**行号**: 第 160-203 行

### 3. 简化 AI 客户端（仅支持 OpenAI 兼容模式）

**修改内容**:
- ❌ 移除 Gemini API 支持
- ❌ 移除 DeepSeek API 支持
- ❌ 移除 GPT-4o 单独模式
- ✅ 仅保留 OpenAI 兼容模式
- ✅ 统一使用 `VITE_` 前缀的环境变量

**好处**:
- 代码更简洁，易于维护
- 减少了模型选择逻辑的复杂性
- 统一的错误处理和日志输出

### 4. 环境变量配置修复

**文件**: `.env.local`

**问题**: 原配置使用 `OPENAI_API_KEY`，缺少 `VITE_` 前缀

**修复后**:
```bash
VITE_OPENAI_API_KEY=3e477c124cff4ace9781036ec6a9539a.JD2LjE68x00gcWRq
VITE_OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
VITE_OPENAI_MODEL=glm-4-flash
```

**原因**: Vite 中只有 `VITE_` 前缀的环境变量才能在客户端访问

## 设计原则应用

### KISS（简单至上）
- 移除了多种模型支持，代码更简洁
- 统一使用 OpenAI 兼容格式
- 减少了配置选项的复杂性

### YAGNI（精益求精）
- 删除了未使用的 Gemini、DeepSeek 等模型代码
- 减少了维护成本和潜在 bug

### DRY（杜绝重复）
- 统一使用 OpenAI 兼容格式
- 所有请求使用相同的处理逻辑

## 测试建议

### 功能测试
- [ ] 使用智谱 AI 的 glm-4-flash 模型测试完整分析流程
- [ ] 验证 120 秒超时是否足够
- [ ] 检查日志输出是否清晰
- [ ] 测试重试机制是否正常工作

### 性能测试
- [ ] 记录实际 API 调用耗时
- [ ] 如果仍然超时，考虑：
  - 进一步增加超时时间
  - 简化提示词（减少示例和说明）
  - 减少生成的数据量（如从 100 年减少到 50 年）

### 错误处理测试
- [ ] 测试网络错误时的提示信息
- [ ] 测试 API 响应错误（401, 429, 500 等）的处理
- [ ] 测试 JSON 解析失败时的重试机制

## 已知限制

1. **超时时间较长**：120 秒对于用户体验来说较长，但这是处理复杂 AI 任务的必要时间
2. **重试机制**：如果每次都超时，3 次重试会导致最长 6 分钟的等待时间
3. **提示词优化空间**：当前提示词较长，可以进一步优化以减少 AI 处理时间

## 未来改进

- [ ] 添加进度指示器，显示 AI 分析进度
- [ ] 考虑使用流式 API（Server-Sent Events）实现实时响应
- [ ] 优化提示词，减少冗余说明
- [ ] 考虑将 K 线数据生成和维度分析分两次 API 调用
- [ ] 添加缓存机制，相同八字数据不重复调用 API
- [ ] 实现后台分析，用户可以离开页面后继续处理

## 相关文档

- [AI 客户端实现](../src/services/aiClient.ts)
- [Prompt 模板](../src/services/prompts.ts)
- [环境变量配置](../.env.local)

---

**状态**: ✅ 已完成
**测试**: ⏳ 待验证
**文档**: ✅ 完整
