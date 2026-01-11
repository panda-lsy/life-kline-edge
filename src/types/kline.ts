/**
 * K线图相关类型定义
 */

/**
 * K线数据点
 */
export interface KLineData {
  /** 年份 */
  year: number;
  /** 开盘价（年初运势，0-100） */
  open: number;
  /** 收盘价（年末运势，0-100） */
  close: number;
  /** 最高价（年度最高，0-100） */
  high: number;
  /** 最低价（年度最低，0-100） */
  low: number;
  /** 成交量（影响因子，可选） */
  volume?: number;
}

/**
 * 转折点类型
 */
export type TurningPointType = 'peak' | 'trough' | 'change';

/**
 * 转折点
 */
export interface TurningPoint {
  /** 年份 */
  year: number;
  /** 类型 */
  type: TurningPointType;
  /** 原因 */
  reason: string;
  /** 建议 */
  advice: string;
  /** 评分 */
  score: number;
}

/**
 * 维度分析
 */
export interface DimensionAnalysis {
  /** 评分（0-100） */
  score: number;
  /** 概述 */
  overview: string;
  /** 详细分析 */
  details: string[];
  /** 建议 */
  advice: string[];
}

/**
 * 六大维度分析
 */
export interface SixDimensions {
  /** 事业 */
  career: DimensionAnalysis;
  /** 财富 */
  wealth: DimensionAnalysis;
  /** 婚姻 */
  marriage: DimensionAnalysis;
  /** 健康 */
  health: DimensionAnalysis;
  /** 性格 */
  personality: DimensionAnalysis;
  /** 风水 */
  fengshui: DimensionAnalysis;
}

/**
 * AI 分析完整结果
 */
export interface AIAnalysisResult {
  /** 100年K线数据 */
  klineData: KLineData[];
  /** 六大维度分析 */
  dimensions: SixDimensions;
  /** 关键转折点 */
  turningPoints: TurningPoint[];
  /** 元数据 */
  metadata: {
    /** 使用的AI模型 */
    model: string;
    /** 生成时间 */
    generatedAt: Date;
    /** 生成耗时（毫秒） */
    generationTime: number;
  };
}
