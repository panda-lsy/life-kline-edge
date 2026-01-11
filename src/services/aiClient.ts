/**
 * AI 服务客户端（仅支持 OpenAI 兼容 API）
 * 实现重试机制和错误处理
 *
 * 环境变量配置：
 * - VITE_OPENAI_API_KEY: OpenAI 兼容的 API 密钥
 * - VITE_OPENAI_BASE_URL: 自定义 API 端点（可选）
 * - VITE_OPENAI_MODEL: 模型名称（可选，默认 gpt-4o-mini）
 */

import { generateAnalysisPrompt, generateRetryPrompt, validateAIOutput } from './prompts';
import type { BaziResult, AIAnalysisResult } from '@/types';

/**
 * 仅支持 OpenAI 兼容模式
 * 使用标准 OpenAI API 格式，兼容所有 OpenAI-compatible 的服务
 */
export type AIModel = 'openai-compatible';

/**
 * AI 提供商配置
 */
interface AIProviderConfig {
  /** API 端点 */
  endpoint: string;
  /** API 密钥（从环境变量获取） */
  apiKey: string;
  /** 模型名称 */
  model: string;
  /** 最大重试次数 */
  maxRetries: number;
  /** 超时时间（毫秒） */
  timeout: number;
}

/**
 * AI 调用配置
 */
export interface AIClientConfig {
  /** 使用的模型 */
  model: AIModel;
  /** 自定义 API 端点（可选，用于代理） */
  customEndpoint?: string;
  /** 自定义 API 密钥（可选，覆盖环境变量） */
  customApiKey?: string;
  /** 最大重试次数（默认3次） */
  maxRetries?: number;
  /** 超时时间（默认30秒） */
  timeout?: number;
}

/**
 * AI 调用结果
 */
interface AIResponse<T> {
  /** 成功标志 */
  success: boolean;
  /** 返回的数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 重试次数 */
  retries: number;
  /** 调用耗时（毫秒） */
  duration: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  timeout: 120000, // AI 分析可能需要较长时间，增加到 120 秒
  retryDelay: 1000, // 初始重试延迟（毫秒）
};

/**
 * AI 提供商配置映射（仅支持 OpenAI 兼容模式）
 */
function getProviderConfig(_model: AIModel, customEndpoint?: string, customApiKey?: string): AIProviderConfig {
  const env = import.meta.env;

  // 使用 VITE_ 前缀的环境变量（Vite 客户端只能访问这些变量）
  const baseURL = customEndpoint || env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
  const apiKey = customApiKey || env.VITE_OPENAI_API_KEY || '';
  const model = env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

  return {
    endpoint: baseURL,
    apiKey,
    model,
    maxRetries: DEFAULT_CONFIG.maxRetries,
    timeout: DEFAULT_CONFIG.timeout,
  };
}

/**
 * 指数退避计算
 */
function getRetryDelay(attempt: number): number {
  return DEFAULT_CONFIG.retryDelay * Math.pow(2, attempt);
}

/**
 * 睡眠函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 检查是否可用的 API 密钥
 */
function hasValidApiKey(config: AIProviderConfig): boolean {
  return !!config.apiKey && config.apiKey.length > 10;
}

/**
 * AI 服务客户端类
 */
export class AIClient {
  private config: AIProviderConfig;
  private model: AIModel;

  constructor(clientConfig: AIClientConfig) {
    this.model = clientConfig.model;
    this.config = getProviderConfig(
      clientConfig.model,
      clientConfig.customEndpoint,
      clientConfig.customApiKey
    );

    // 覆盖可选配置
    if (clientConfig.maxRetries) {
      this.config.maxRetries = clientConfig.maxRetries;
    }
    if (clientConfig.timeout) {
      this.config.timeout = clientConfig.timeout;
    }
  }

  /**
   * 调用 AI API
   */
  private async callAPI(prompt: string): Promise<string> {
    const { endpoint, apiKey, model, timeout } = this.config;

    // 检查 API 密钥
    if (!hasValidApiKey(this.config)) {
      throw new Error('未配置 VITE_OPENAI_API_KEY，请在 .env.local 文件中设置');
    }

    // 构建请求体
    const body = this.buildRequestBody(prompt, model);

    // 添加超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    console.log(`📤 发送 AI 请求到: ${endpoint}`);
    console.log(`🔑 使用模型: ${model}`);
    console.log(`⏱️  超时设置: ${timeout}ms (${timeout / 1000}秒)`);
    console.log(`📝 Prompt 长度: ${prompt.length} 字符`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(apiKey),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API 响应错误 (${response.status}):`, errorText);
        throw new Error(`API 调用失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = this.extractContent(data);
      console.log(`✅ AI 响应成功，内容长度: ${content.length} 字符`);
      return content;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutSec = (timeout / 1000).toFixed(0);
          console.error(`⏰ 请求超时 (${timeoutSec}秒)，请尝试：`);
          console.error('   1. 检查网络连接');
          console.error('   2. 增加超时时间（修改 aiClient.ts 中的 timeout 配置）');
          console.error('   3. 使用更快的模型或简化提示词');
          throw new Error(`请求超时（${timeout}ms = ${timeoutSec}秒）`);
        }
        console.error('❌ API 调用异常:', error.message);
        throw error;
      }
      throw new Error('未知错误');
    }
  }

  /**
   * 构建请求体（OpenAI 兼容格式）
   */
  private buildRequestBody(prompt: string, model: string): object {
    return {
      model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 16384, // 增加到 16384，确保有足够空间生成 100 年 K 线数据
    };
  }

  /**
   * 获取认证头（OpenAI 兼容格式使用 Bearer Token）
   */
  private getAuthHeaders(apiKey: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${apiKey}`
    };
  }

  /**
   * 提取响应内容（OpenAI 兼容格式）
   */
  private extractContent(data: any): string {
    try {
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      throw new Error('解析 AI 响应失败');
    }
  }

  /**
   * 带重试的 API 调用
   */
  private async callWithRetry(
    prompt: string,
    maxRetries: number = this.config.maxRetries
  ): Promise<{ content: string; retries: number }> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const content = await this.callAPI(prompt);
        return { content, retries: attempt };
      } catch (error) {
        lastError = error as Error;

        // 最后一次尝试失败，不再重试
        if (attempt >= maxRetries) {
          break;
        }

        // 指数退避
        const delay = getRetryDelay(attempt);
        console.warn(`AI 调用失败，${delay}ms 后重试 (${attempt + 1}/${maxRetries})...`, error);
        await sleep(delay);
      }
    }

    throw lastError || new Error('AI 调用失败');
  }

  /**
   * 分析八字数据
   */
  async analyzeBazi(
    baziResult: BaziResult,
    options?: { verbose?: boolean }
  ): Promise<AIResponse<AIAnalysisResult>> {
    const startTime = Date.now();
    let retries = 0;

    try {
      // 生成初始 Prompt
      let prompt = generateAnalysisPrompt(baziResult, {
        model: this.model,
        language: 'zh-CN',
        verbose: options?.verbose || false,
      });

      let rawOutput = '';
      let validation = validateAIOutput('');

      // 尝试调用并验证
      for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
        try {
          const result = await this.callWithRetry(prompt, Math.max(0, this.config.maxRetries - attempt));
          rawOutput = result.content;
          retries += result.retries;

          // 验证输出
          validation = validateAIOutput(rawOutput);

          if (validation.valid && validation.data) {
            // 验证成功，返回结果
            const duration = Date.now() - startTime;
            return {
              success: true,
              data: validation.data,
              retries,
              duration,
            };
          }

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

        } catch (error) {
          if (attempt >= this.config.maxRetries) {
            throw error;
          }
          // 继续下一次尝试
        }
      }

      // 所有尝试都失败
      const finalError = validation.error || 'AI 输出验证失败';
      console.error('❌ 所有重试都失败');
      console.error('📋 最终错误:', finalError);
      console.error('📄 最后一次 AI 响应:');
      console.error('--- 开始 ---');
      console.error(rawOutput);
      console.error('--- 结束 ---');

      return {
        success: false,
        error: finalError,
        retries,
        duration: Date.now() - startTime,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        retries,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 测试 API 连接
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!hasValidApiKey(this.config)) {
      return {
        success: false,
        error: '未配置 VITE_OPENAI_API_KEY'
      };
    }

    try {
      // 发送简单测试请求
      const testPrompt = '回复：OK';
      await this.callAPI(testPrompt);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接失败'
      };
    }
  }
}

/**
 * 创建 AI 客户端实例（工厂函数）
 */
export function createAIClient(config: AIClientConfig): AIClient {
  return new AIClient(config);
}

/**
 * 默认客户端（仅支持 OpenAI 兼容模式）
 * 从环境变量 VITE_OPENAI_API_KEY、VITE_OPENAI_BASE_URL、VITE_OPENAI_MODEL 读取配置
 */
let defaultClient: AIClient | null = null;

export function getDefaultClient(): AIClient {
  if (!defaultClient) {
    defaultClient = new AIClient({ model: 'openai-compatible' });
  }

  return defaultClient;
}

/**
 * 快速分析（使用默认客户端）
 */
export async function quickAnalyze(
  baziResult: BaziResult
): Promise<AIResponse<AIAnalysisResult>> {
  const client = getDefaultClient();
  return client.analyzeBazi(baziResult);
}
