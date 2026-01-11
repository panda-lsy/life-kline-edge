/**
 * 边缘函数服务客户端
 * 为前端提供便捷的边缘函数调用接口
 */

/**
 * 边缘函数响应
 */
interface EdgeFunctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
  cacheHit?: boolean;
}

/**
 * 八字计算响应
 */
interface CalculateBaziResponse extends EdgeFunctionResponse<BaziResult> {
  cacheHit?: boolean;
}

/**
 * AI 分析响应
 */
interface AIAnalyzeResponse extends EdgeFunctionResponse<AIAnalysisResult> {
  cacheHit?: boolean;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

/**
 * 边缘函数配置
 */
interface EdgeFunctionConfig {
  /** API 基础路径 */
  baseURL: string;
  /** 请求超时时间（毫秒） */
  timeout: number;
  /** 是否启用重试 */
  retry: boolean;
  /** 重试次数 */
  maxRetries: number;
}

/**
 * 边缘函数服务类
 */
export class EdgeFunctionService {
  private config: EdgeFunctionConfig;

  constructor(config: Partial<EdgeFunctionConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 5000, // 5秒超时
      retry: config.retry !== undefined ? config.retry : true,
      maxRetries: config.maxRetries || 1,
    };
  }

  /**
   * 通用请求方法
   */
  private async request<T>(
    endpoint: string,
    body?: any,
    method: 'GET' | 'POST' | 'DELETE' = body ? 'POST' : 'GET'
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`请求超时（${this.config.timeout}ms）`);
        }
        throw error;
      }

      throw new Error('请求失败');
    }
  }

  /**
   * 带重试的请求
   */
  private async requestWithRetry<T>(
    endpoint: string,
    body?: any,
    method: 'GET' | 'POST' | 'DELETE' = body ? 'POST' : 'GET'
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.request<T>(endpoint, body, method);
      } catch (error) {
        lastError = error as Error;

        // 最后一次尝试失败，不再重试
        if (attempt >= this.config.maxRetries) {
          break;
        }

        // 等待一小段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    throw lastError || new Error('请求失败');
  }

  /**
   * 计算八字
   */
  async calculateBazi(birthData: BirthData): Promise<CalculateBaziResponse> {
    try {
      const response = await this.requestWithRetry<CalculateBaziResponse>(
        '/calculate-bazi',
        { birthData }
      );

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '八字计算失败',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * AI 分析
   */
  async aiAnalyze(
    baziResult: BaziResult,
    model: 'gemini' | 'deepseek' | 'gpt-4o' = 'gemini'
  ): Promise<AIAnalyzeResponse> {
    try {
      const response = await this.requestWithRetry<AIAnalyzeResponse>(
        '/ai-analyze',
        { baziResult, model }
      );

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI 分析失败',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取历史记录
   */
  async getHistory(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
    timestamp?: string;
  }> {
    try {
      const response = await this.requestWithRetry<{
        success: boolean;
        data: any[];
      }>('/history', undefined, 'GET');

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取历史记录失败',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 添加历史记录
   */
  async addHistory(record: any): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    timestamp?: string;
  }> {
    try {
      const response = await this.requestWithRetry<{
        success: boolean;
        data: any;
      }>('/history', record, 'POST');

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加历史记录失败',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 删除历史记录
   */
  async deleteHistory(recordId: string): Promise<{
    success: boolean;
    error?: string;
    timestamp?: string;
  }> {
    try {
      const response = await this.requestWithRetry<{
        success: boolean;
      }>(`/history/${recordId}`, undefined, 'DELETE');

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除历史记录失败',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 清空历史记录
   */
  async clearHistory(): Promise<{
    success: boolean;
    error?: string;
    timestamp?: string;
  }> {
    try {
      const response = await this.requestWithRetry<{
        success: boolean;
      }>('/history', undefined, 'DELETE');

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '清空历史记录失败',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 完整分析流程（八字计算 + AI 分析）
   */
  async fullAnalysis(
    birthData: BirthData,
    model: 'gemini' | 'deepseek' | 'gpt-4o' = 'gemini'
  ): Promise<{
    baziSuccess: boolean;
    baziResult?: BaziResult;
    aiSuccess?: boolean;
    aiResult?: AIAnalysisResult;
    error?: string;
  }> {
    try {
      // 步骤1：计算八字
      const baziResponse = await this.calculateBazi(birthData);

      if (!baziResponse.success || !baziResponse.data) {
        return {
          baziSuccess: false,
          error: baziResponse.error || '八字计算失败',
        };
      }

      // 步骤2：AI 分析
      const aiResponse = await this.aiAnalyze(baziResponse.data, model);

      return {
        baziSuccess: true,
        baziResult: baziResponse.data,
        aiSuccess: aiResponse.success,
        aiResult: aiResponse.data,
        error: aiResponse.error,
      };

    } catch (error) {
      return {
        baziSuccess: false,
        error: error instanceof Error ? error.message : '分析失败',
      };
    }
  }

  /**
   * 测试边缘函数连接
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // 尝试调用八字计算（使用测试数据）
      const testBirthData: BirthData = {
        birthDate: '1990-01-01',
        birthTime: '12:00',
        gender: 'male',
        location: {
          country: '中国',
          province: '北京',
          city: '北京',
          latitude: 39.9042,
          longitude: 116.4074,
          timezone: 'Asia/Shanghai',
        },
      };

      const response = await this.calculateBazi(testBirthData);
      return { success: response.success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接测试失败',
      };
    }
  }
}

/**
 * 默认边缘函数服务实例
 */
let defaultService: EdgeFunctionService | null = null;

/**
 * 获取默认边缘函数服务
 */
export function getEdgeFunctionService(): EdgeFunctionService {
  if (!defaultService) {
    defaultService = new EdgeFunctionService();
  }
  return defaultService;
}

/**
 * 快速调用八字计算
 */
export async function quickCalculateBazi(birthData: BirthData): Promise<CalculateBaziResponse> {
  const service = getEdgeFunctionService();
  return service.calculateBazi(birthData);
}

/**
 * 快速调用 AI 分析
 */
export async function quickAIAnalyze(
  baziResult: BaziResult,
  model?: 'gemini' | 'deepseek' | 'gpt-4o'
): Promise<AIAnalyzeResponse> {
  const service = getEdgeFunctionService();
  return service.aiAnalyze(baziResult, model);
}
