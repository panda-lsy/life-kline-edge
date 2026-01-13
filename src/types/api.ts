/**
 * 用户历史记录
 * 历史记录条目类型定义
 */

/**
 * 八字计算请求
 */
export interface CalculateBaziRequest {
  /** 出生数据 */
  birthData: import('./bazi').BirthData;
}

/**
 * 八字计算响应
 */
export interface CalculateBaziResponse {
  /** 八字结果 */
  bazi: import('./bazi').BaziResult;
  /** 是否来自缓存 */
  fromCache?: boolean;
}

/**
 * AI 分析请求
 */
export interface AIAnalyzeRequest {
  /** 八字数据 */
  baziResult: import('./bazi').BaziResult;
  /** AI 模型（可选） */
  model?: 'gemini-2.5-flash-thinking' | 'gemini-3-pro-preview-low' | 'deepseek-v3' | 'gpt-4o';
}

/**
 * AI 分析响应
 */
export interface AIAnalyzeResponse {
  /** 分析结果 */
  analysis: import('./kline').AIAnalysisResult;
  /** 是否来自缓存 */
  fromCache?: boolean;
}

/**
 * 缓存条目
 */
export interface CacheEntry {
  /** 缓存键（SHA256哈希） */
  key: string;
  /** 缓存值 */
  value: {
    /** 八字数据 */
    bazi: import('./bazi').BaziResult;
    /** AI分析（可选） */
    analysis?: import('./kline').AIAnalysisResult;
  };
  /** 元数据 */
  metadata: {
    /** 创建时间 */
    createdAt: Date;
    /** 过期时间 */
    expiresAt: Date;
    /** 命中次数 */
    hitCount: number;
  };
}

/**
 * 用户历史记录
 */
export interface UserHistory {
  /** 用户ID */
  userId: string;
  /** 记录列表 */
  records: HistoryRecord[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 历史记录条目
 */
export interface HistoryRecord {
  /** 记录 ID */
  id: string;
  /** 用户 ID（可选，用于多用户隔离） */
  userId?: string;
  /** 出生信息 */
  birthData: import('./bazi').BirthData;
  /** 八字结果 */
  baziResult: import('./bazi').BaziResult;
  /** 六维度分析 */
  dimensionsResult?: import('./kline').SixDimensions;
  /** K线数据（简化版，仅保存前 20 年） */
  klineData?: import('./kline').KLineData[];
  /** 创建时间 */
  createdAt: string;
  /** 备注（可选） */
  note?: string;
}

/**
 * 限流信息
 */
export interface RateLimitInfo {
  /** 是否超限 */
  exceeded: boolean;
  /** 剩余次数 */
  remaining: number;
  /** 重置时间（Unix时间戳） */
  resetAt: number;
}
