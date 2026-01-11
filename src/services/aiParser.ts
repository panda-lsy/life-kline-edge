/**
 * AI 输出解析器
 * 使用 Zod 验证 AI 返回的数据结构
 * 处理异常情况并提供降级方案
 */

import { z } from 'zod';
import type { KLineData, TurningPoint, DimensionAnalysis, SixDimensions, AIAnalysisResult } from '@/types';

/**
 * K线数据点 Schema
 */
const KLineDataSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  open: z.number().min(0).max(100),
  close: z.number().min(0).max(100),
  high: z.number().min(0).max(100),
  low: z.number().min(0).max(100),
  volume: z.number().min(0).max(100).optional(),
});

/**
 * 转折点 Schema
 */
const TurningPointSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  type: z.enum(['peak', 'trough', 'change']),
  reason: z.string().min(1).max(500),
  advice: z.string().min(1).max(500),
  score: z.number().min(0).max(100),
});

/**
 * 维度分析 Schema
 */
const DimensionAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  overview: z.string().min(1).max(500),
  details: z.array(z.string().min(1).max(200)).min(1).max(10),
  advice: z.array(z.string().min(1).max(200)).min(1).max(10),
});

/**
 * 六大维度 Schema
 */
const SixDimensionsSchema = z.object({
  career: DimensionAnalysisSchema,
  wealth: DimensionAnalysisSchema,
  marriage: DimensionAnalysisSchema,
  health: DimensionAnalysisSchema,
  personality: DimensionAnalysisSchema,
  fengshui: DimensionAnalysisSchema,
});

/**
 * AI 分析完整结果 Schema
 */
const AIAnalysisResultSchema = z.object({
  klineData: z.array(KLineDataSchema).min(100).max(100),
  dimensions: SixDimensionsSchema,
  turningPoints: z.array(TurningPointSchema).min(1).max(10),
});

/**
 * 解析结果
 */
export interface ParseResult<T> {
  /** 成功标志 */
  success: boolean;
  /** 解析后的数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 警告信息（非致命错误） */
  warnings?: string[];
  /** 是否使用了降级方案 */
  fallbackUsed?: boolean;
}

/**
 * 清理 JSON 字符串
 * 处理可能的 Markdown 代码块、多余空格等
 */
function cleanJSONString(raw: string): string {
  let cleaned = raw.trim();

  // 移除可能的 markdown 代码块标记
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  // 移除可能的前后导引号（有些 AI 会额外添加）
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }

  return cleaned;
}

/**
 * 尝试修复常见的 JSON 错误
 */
function attemptJSONFix(jsonStr: string): string | null {
  let fixed = jsonStr;

  // 修复1: 移除尾随逗号（如 {a:1,} → {a:1}）
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // 修复2: 修复未引用的键名（如 {a:1} → {"a":1}）
  // 注意：这个修复比较复杂，简单处理常见情况
  fixed = fixed.replace(/\{([^"]*?):/g, '{"$1":');

  // 修复3: 修复单引号字符串（如 {'a':1} → {"a":1}）
  fixed = fixed.replace(/'/g, '"');

  return fixed;
}

/**
 * 解析 JSON 字符串
 * 支持自动修复常见错误
 */
function parseJSON(raw: string): any | null {
  // 首先尝试直接解析
  try {
    return JSON.parse(raw);
  } catch (e) {
    // 失败后尝试清理
    const cleaned = cleanJSONString(raw);
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      // 清理后仍失败，尝试修复
      const fixed = attemptJSONFix(cleaned);
      if (fixed) {
        try {
          return JSON.parse(fixed);
        } catch (e3) {
          return null;
        }
      }
      return null;
    }
  }
}

/**
 * 提供默认的 K 线数据
 * 当 AI 输出完全不正确时使用
 */
function generateDefaultKLineData(startYear: number): KLineData[] {
  const data: KLineData[] = [];
  for (let i = 0; i < 100; i++) {
    const year = startYear + i;
    const baseScore = 50 + Math.sin(i / 10) * 20; // 模拟起伏
    data.push({
      year,
      open: Math.round(baseScore),
      close: Math.round(baseScore + (Math.random() - 0.5) * 10),
      high: Math.round(baseScore + 10 + Math.random() * 10),
      low: Math.round(baseScore - 10 - Math.random() * 10),
    });
  }
  return data;
}

/**
 * 提供默认的维度分析
 */
function generateDefaultDimension(name: string): DimensionAnalysis {
  const overviews: Record<string, string> = {
    career: '事业运势平稳发展，需努力进取',
    wealth: '财运平平，宜稳健理财',
    marriage: '感情运势稳定，需用心经营',
    health: '健康状况良好，注意劳逸结合',
    personality: '性格沉稳，做事踏实',
    fengshui: '运势平和，可通过调整环境改善',
  };

  return {
    score: 60,
    overview: overviews[name] || '运势平稳',
    details: ['需要持续关注和努力', '有发展潜力但需把握机遇', '保持积极心态'],
    advice: ['保持耐心，持续努力', '关注机遇，适时行动', '注意平衡，协调发展'],
  };
}

/**
 * 提供默认的转折点
 */
function generateDefaultTurningPoints(startYear: number): TurningPoint[] {
  return [
    {
      year: startYear + 10,
      type: 'change',
      reason: '青年时期的重要转折点，面临职业或学业选择',
      advice: '慎重考虑，做出符合自己兴趣和能力的决定',
      score: 75,
    },
    {
      year: startYear + 35,
      type: 'peak',
      reason: '中年黄金期，事业和财富有望达到高峰',
      advice: '抓住机遇，大展宏图',
      score: 85,
    },
  ];
}

/**
 * 降级方案：生成默认数据
 */
function generateFallbackData(startYear: number): AIAnalysisResult {
  return {
    klineData: generateDefaultKLineData(startYear),
    dimensions: {
      career: generateDefaultDimension('career'),
      wealth: generateDefaultDimension('wealth'),
      marriage: generateDefaultDimension('marriage'),
      health: generateDefaultDimension('health'),
      personality: generateDefaultDimension('personality'),
      fengshui: generateDefaultDimension('fengshui'),
    },
    turningPoints: generateDefaultTurningPoints(startYear),
    metadata: {
      model: 'fallback',
      generatedAt: new Date(),
      generationTime: 0,
    },
  };
}

/**
 * 部分降级：修复数据中的问题
 */
function partialFallback(data: any, startYear: number): AIAnalysisResult {
  const warnings: string[] = [];

  // 修复 K 线数据
  let klineData: KLineData[];
  if (!Array.isArray(data.klineData) || data.klineData.length !== 100) {
    warnings.push('K线数据不完整，使用默认数据');
    klineData = generateDefaultKLineData(startYear);
  } else {
    klineData = data.klineData.map((item: any, index: number) => {
      try {
        return KLineDataSchema.parse(item);
      } catch (e) {
        warnings.push(`第${index + 1}年K线数据格式错误，使用修正值`);
        return {
          year: startYear + index,
          open: 50,
          close: 50,
          high: 60,
          low: 40,
        };
      }
    });
  }

  // 修复维度分析
  const parseDimensionWithFallback = (data: any, defaultDim: DimensionAnalysis): DimensionAnalysis => {
    if (!data) return defaultDim;
    try {
      const partial = DimensionAnalysisSchema.partial().safeParse(data);
      if (partial.success) {
        return {
          score: partial.data.score ?? defaultDim.score,
          overview: partial.data.overview ?? defaultDim.overview,
          details: partial.data.details ?? defaultDim.details,
          advice: partial.data.advice ?? defaultDim.advice,
        };
      }
    } catch (e) {
      // 忽略错误，使用默认值
    }
    return defaultDim;
  };

  const dimensions: SixDimensions = {
    career: parseDimensionWithFallback(data.dimensions?.career, generateDefaultDimension('career')),
    wealth: parseDimensionWithFallback(data.dimensions?.wealth, generateDefaultDimension('wealth')),
    marriage: parseDimensionWithFallback(data.dimensions?.marriage, generateDefaultDimension('marriage')),
    health: parseDimensionWithFallback(data.dimensions?.health, generateDefaultDimension('health')),
    personality: parseDimensionWithFallback(data.dimensions?.personality, generateDefaultDimension('personality')),
    fengshui: parseDimensionWithFallback(data.dimensions?.fengshui, generateDefaultDimension('fengshui')),
  };

  // 修复转折点
  let turningPoints: TurningPoint[];
  if (!Array.isArray(data.turningPoints) || data.turningPoints.length === 0) {
    warnings.push('转折点数据缺失，使用默认数据');
    turningPoints = generateDefaultTurningPoints(startYear);
  } else {
    turningPoints = data.turningPoints.slice(0, 10).map((item: any, index: number) => {
      try {
        return TurningPointSchema.parse(item);
      } catch (e) {
        warnings.push(`第${index + 1}个转折点格式错误，已跳过`);
        return null;
      }
    }).filter((tp: TurningPoint | null): tp is TurningPoint => tp !== null);
  }

  return {
    klineData,
    dimensions,
    turningPoints,
    metadata: {
      model: 'partial-fallback',
      generatedAt: new Date(),
      generationTime: 0,
    },
  };
}

/**
 * 解析 AI 输出（主函数）
 * @param rawOutput - AI 原始输出
 * @param startYear - 起始年份（用于生成默认数据）
 * @param useStrictMode - 是否使用严格模式（严格模式下不使用降级方案）
 */
export function parseAIOutput(
  rawOutput: string,
  startYear: number = 1990,
  useStrictMode: boolean = false
): ParseResult<AIAnalysisResult> {
  // 第一步：解析 JSON
  const parsed = parseJSON(rawOutput);
  if (!parsed) {
    if (useStrictMode) {
      return {
        success: false,
        error: '无法解析 JSON 输出',
      };
    }
    return {
      success: true,
      data: generateFallbackData(startYear),
      warnings: ['AI 输出无法解析，使用默认数据'],
      fallbackUsed: true,
    };
  }

  // 第二步：严格验证
  try {
    const validated = AIAnalysisResultSchema.parse(parsed);
    return {
      success: true,
      data: {
        ...validated,
        metadata: {
          model: 'ai-validated',
          generatedAt: new Date(),
          generationTime: 0,
        },
      },
    };
  } catch (e) {
    if (useStrictMode) {
      return {
        success: false,
        error: `数据验证失败: ${e instanceof Error ? e.message : '未知错误'}`,
      };
    }

    // 第三步：尝试部分降级
    try {
      const fallbackData = partialFallback(parsed, startYear);
      return {
        success: true,
        data: fallbackData,
        warnings: ['数据验证失败，已修复部分字段'],
        fallbackUsed: true,
      };
    } catch (e2) {
      // 第四步：完全降级
      return {
        success: true,
        data: generateFallbackData(startYear),
        warnings: ['数据严重错误，使用默认数据'],
        fallbackUsed: true,
      };
    }
  }
}

/**
 * 快速验证（仅验证格式，不处理数据）
 * @returns true 如果输出格式正确，false 否则
 */
export function quickValidate(rawOutput: string): boolean {
  const parsed = parseJSON(rawOutput);
  if (!parsed) return false;

  try {
    AIAnalysisResultSchema.parse(parsed);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 提取错误详情
 */
export function getValidationErrorDetails(rawOutput: string): {
  valid: boolean;
  errors: string[];
} {
  const parsed = parseJSON(rawOutput);
  if (!parsed) {
    return {
      valid: false,
      errors: ['无法解析 JSON'],
    };
  }

  const errors: string[] = [];

  // 检查 K 线数据
  if (!Array.isArray(parsed.klineData)) {
    errors.push('klineData 不是数组');
  } else if (parsed.klineData.length !== 100) {
    errors.push(`klineData 长度不正确: ${parsed.klineData.length} (期望: 100)`);
  }

  // 检查维度分析
  if (!parsed.dimensions || typeof parsed.dimensions !== 'object') {
    errors.push('dimensions 缺失或不是对象');
  } else {
    const requiredDims = ['career', 'wealth', 'marriage', 'health', 'personality', 'fengshui'];
    requiredDims.forEach(dim => {
      if (!parsed.dimensions[dim]) {
        errors.push(`缺少 ${dim} 维度分析`);
      }
    });
  }

  // 检查转折点
  if (!Array.isArray(parsed.turningPoints)) {
    errors.push('turningPoints 不是数组');
  } else if (parsed.turningPoints.length === 0) {
    errors.push('turningPoints 为空');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
