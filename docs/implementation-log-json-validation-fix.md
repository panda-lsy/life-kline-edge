# AI 输出格式验证问题修复

## 变更日期
2026-01-10

## 变更概述
修复 AI 输出格式验证失败的问题，通过增加 `max_tokens` 和添加详细的调试日志，帮助诊断和解决 JSON 解析错误。

## 问题描述

### 用户报告
```
AI 输出格式不正确，重新生成... (1/3)
```

### 根本原因

1. **max_tokens 太小**：设置为 8192，不足以生成 100 年的 K 线数据（约 100 个对象）+ 六个维度分析 + 3-5 个转折点
2. **缺少调试信息**：验证失败时无法查看 AI 实际返回的内容，难以诊断问题
3. **响应可能被截断**：当 max_tokens 不够时，AI 返回的 JSON 会被截断，导致解析失败

## 修复方案

### 1. 增加 max_tokens

**文件**: `src/services/aiClient.ts`

**修改前**:
```typescript
max_tokens: 8192,
```

**修改后**:
```typescript
max_tokens: 16384, // 增加到 16384，确保有足够空间生成 100 年 K 线数据
```

**行号**: 第 219 行

**理由**:
- 100 年 K 线数据约需 10,000+ tokens（100 个对象 × 约 100 tokens/对象）
- 六个维度分析约需 2,000+ tokens
- JSON 结构和标点约需 1,000+ tokens
- 总计约需 13,000+ tokens
- 16384 提供足够的安全边际

### 2. 添加详细的调试日志

**文件**: `src/services/aiClient.ts`

**新增日志**（第 317-330 行）:
```typescript
// 验证失败，生成重试 Prompt
if (attempt < this.config.maxRetries) {
  const errorMsg = validation.error || '格式错误';
  console.warn(`⚠️ AI 输出格式不正确，重新生成... (${attempt + 1}/${this.config.maxRetries})`);
  console.warn(`📋 错误原因: ${errorMsg}`);
  console.warn(`📄 AI 响应内容（前500字符）:`, rawOutput.slice(0, 500));
  console.warn(`📊 完整响应长度: ${rawOutput.length} 字符`);

  // 检查是否被截断
  if (!rawOutput.trim().endsWith('}')) {
    console.warn('✂️  响应可能被截断（没有以 } 结尾），尝试增加 max_tokens');
  }

  prompt = generateRetryPrompt(prompt, errorMsg, rawOutput);
}
```

**失败时输出完整响应**（第 340-354 行）:
```typescript
// 所有尝试都失败
const finalError = validation.error || 'AI 输出验证失败';
console.error('❌ 所有重试都失败');
console.error('📋 最终错误:', finalError);
console.error('📄 最后一次 AI 响应:');
console.error('--- 开始 ---');
console.error(rawOutput);
console.error('--- 结束 ---');
```

### 3. 日志输出示例

**验证失败时**:
```
⚠️ AI 输出格式不正确，重新生成... (1/3)
📋 错误原因: K线数据必须是100年
📄 AI 响应内容（前500字符）: {
  "klineData": [
    {"year": 1990, "open": 65, "close": 68, "high": 75, "low": 60},
    {"year": 1991, "open": 68, "close": 72, "high": 78, "low": 65},
...
📊 完整响应长度: 12458 字符
```

**响应被截断时**:
```
⚠️ AI 输出格式不正确，重新生成... (2/3)
📋 错误原因: 解析失败
📄 AI 响应内容（前500字符）: {...}
📊 完整响应长度: 15800 字符
✂️  响应可能被截断（没有以 } 结尾），尝试增加 max_tokens
```

**所有重试失败时**:
```
❌ 所有重试都失败
📋 最终错误: K线数据必须是100年
📄 最后一次 AI 响应:
--- 开始 ---
{
  "klineData": [
    {"year": 1990, ...},
    ...
    {"year": 2089, ...}
  ],
  "dimensions": {...}
}
--- 结束 ---
```

## 设计原则应用

### 可调试性（Debuggability）
- 添加详细的错误日志，帮助快速定位问题
- 输出 AI 响应的前 500 字符，提供上下文
- 输出完整响应长度，判断是否被截断
- 检查 JSON 是否完整（以 `}` 结尾）

### YAGNI（精益求精）
- 仅在验证失败时输出详细日志（正常运行时不输出）
- 避免不必要的性能开销

### KISS（简单至上）
- 使用简单的 console.log/warn/error 输出
- 不引入额外的日志库或复杂的日志系统

## 使用建议

### 查看 AI 响应

当看到"AI 输出格式不正确"时，打开浏览器控制台（F12），查看详细的错误信息：

1. **错误原因**: 了解为什么验证失败
2. **响应内容**: 查看 AI 实际返回的内容
3. **响应长度**: 判断是否被截断
4. **截断提示**: 如果看到"✂️ 响应可能被截断"，需要增加 max_tokens

### 常见问题排查

**问题 1**: `K线数据必须是100年`
- **原因**: AI 生成的数据少于 100 年
- **解决**: 优化提示词，明确要求生成 100 年数据

**问题 2**: `解析失败` + `响应可能被截断`
- **原因**: max_tokens 不够，JSON 被截断
- **解决**: 增加 max_tokens（在 aiClient.ts:219）
- **当前值**: 16384
- **建议值**: 如果仍截断，增加到 32768

**问题 3**: `缺少xxx维度分析`
- **原因**: AI 没有生成某个维度的分析
- **解决**: 优化提示词，强调必须包含所有维度

**问题 4**: 响应包含额外文字
- **原因**: AI 没有返回纯 JSON，包含了说明文字
- **解决**: 优化提示词，强调"仅输出 JSON"

## 性能影响

### 内存占用
- 增加 max_tokens 到 16384 会略微增加内存占用
- 对于大多数现代浏览器，这是可接受的

### 响应时间
- 更长的输出可能导致 AI 响应时间增加 5-10 秒
- 这是生成完整数据所需的时间，无法避免

## 未来改进

- [ ] 添加流式 API 支持（Server-Sent Events），实时接收响应
- [ ] 实现增量验证：在生成过程中验证 JSON 格式
- [ ] 添加数据压缩：减少传输的数据量
- [ ] 分离 API 调用：将 K 线数据和维度分析分两次生成
- [ ] 添加缓存：相同的八字数据不重复调用 API
- [ ] 优化提示词：减少冗余说明，提高 AI 生成准确率

## 相关文档

- [AI 客户端实现](../src/services/aiClient.ts)
- [Prompt 模板](../src/services/prompts.ts)
- [API 超时修复](./implementation-log-api-timeout-fix.md)

---

**状态**: ✅ 已完成
**测试**: ⏳ 待验证
**文档**: ✅ 完整
