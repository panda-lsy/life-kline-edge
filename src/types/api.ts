/**
 * API 接口相关类型定义
 */

import type { BirthData, BaziResult } from './bazi';
import type { AIAnalysisResult } from './kline';

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = unknown> {
  /** 是否成功 */
  success: boolean;
  /** 数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 错误代码 */
  code?: string;
}

/**
 * 八字计算请求
 */
export interface CalculateBaziRequest {
  /** 出生数据 */
  birthData: BirthData;
}

/**
 * 八字计算响应
 */
export interface CalculateBaziResponse {
  /** 八字结果 */
  bazi: BaziResult;
  /** 是否来自缓存 */
  fromCache?: boolean;
}

/**
 * AI 分析请求
 */
export interface AIAnalyzeRequest {
  /** 八字数据 */
  bazi: BaziResult;
  /** AI 模型（可选） */
  model?: string;
}

/**
 * AI 分析响应
 */
export interface AIAnalyzeResponse {
  /** AI 分析结果 */
  analysis: AIAnalysisResult;
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
    bazi: BaziResult;
    /** AI分析（可选） */
    analysis?: AIAnalysisResult;
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
  /** 记录ID */
  id: string;
  /** 出生数据 */
  birthData: BirthData;
  /** 八字结果 */
  bazi: BaziResult;
  /** AI分析（可选） */
  analysis?: AIAnalysisResult;
  /** 创建时间 */
  createdAt: Date;
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
