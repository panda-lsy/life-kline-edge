/**
 * AI 分析边缘函数
 * 在边缘代理 AI 调用，实现限流和缓存
 *
 * 环境变量:
 * - KV_NAMESPACE: KV 存储命名空间
 * - GEMINI_API_KEY: Gemini API 密钥
 * - OPENAI_API_KEY: OpenAI API 密钥
 * - DEEPSEEK_API_KEY: DeepSeek API 密钥
 *
 * API 端点: POST /api/ai-analyze
 */

import type { BaziResult, AIAnalysisResult } from '../../src/types';

interface Env {
  KV_NAMESPACE: KVNamespace;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
}

interface RequestBody {
  baziResult: BaziResult;
  model?: 'gemini' | 'deepseek' | 'gpt-4o';
}

/**
 * 生成限流缓存键
 */
function generateRateLimitKey(userId: string, model: string): string {
  const hour = Math.floor(Date.now() / (1000 * 60 * 60)); // 当前小时
  return `ratelimit:${model}:${userId}:${hour}`;
}

/**
 * 生成结果缓存键
 */
function generateResultCacheKey(baziResult: BaziResult, model: string): string {
  // 使用八字数据的哈希作为缓存键
  const key = `${baziResult.siZhu.year.gan}${baziResult.siZhu.year.zhi}` +
               `${baziResult.siZhu.month.gan}${baziResult.siZhu.month.zhi}` +
               `${baziResult.siZhu.day.gan}${baziResult.siZhu.day.zhi}` +
               `${baziResult.siZhu.hour.gan}${baziResult.siZhu.hour.zhi}` +
               `${baziResult.daYun.direction}` +
               `${model}`;

  // 简单哈希
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return `ai-result:${model}:${Math.abs(hash)}`;
}

/**
 * 检查限流
 */
async function checkRateLimit(
  kv: KVNamespace,
  userId: string,
  model: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = generateRateLimitKey(userId, model);
  const limit = 10; // 每小时10次

  try {
    const countStr = await kv.get(key, 'text');
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.ceil((Date.now() / (1000 * 60 * 60) + 1) * (1000 * 60 * 60)),
      };
    }

    // 增加计数
    await kv.put(key, String(count + 1), {
      expirationTtl: 60 * 60, // 1小时过期
    });

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetTime: Math.ceil((Date.now() / (1000 * 60 * 60) + 1) * (1000 * 60 * 60)),
    };
  } catch (e) {
    console.warn('Rate limit check failed:', e);
    // 失败时允许请求（降级方案）
    return { allowed: true, remaining: 10, resetTime: 0 };
  }
}

/**
 * 调用 AI API
 */
async function callAI(
  baziResult: BaziResult,
  model: string,
  apiKey: string
): Promise<string> {
  // 构建 Prompt
  const { siZhu, wuXing, daYun } = baziResult;

  const baziInfo = `
## 八字排盘数据

**出生时间**：${new Date(baziResult.calculatedAt).toLocaleString('zh-CN')}

**四柱八字**：
- 年柱：${siZhu.year.gan}${siZhu.year.zhi}
- 月柱：${siZhu.month.gan}${siZhu.month.zhi}
- 日柱：${siZhu.day.gan}${siZhu.day.zhi}
- 时柱：${siZhu.hour.gan}${siZhu.hour.zhi}

**五行强弱**：
- 金：${wuXing.metal} 个
- 木：${wuXing.wood} 个
- 水：${wuXing.water} 个
- 火：${wuXing.fire} 个
- 土：${wuXing.earth} 个

**大运信息**：
- 起运年龄：${daYun.startAge} 岁
- 大运方向：${daYun.direction === 'forward' ? '顺行' : '逆行'}

请生成100年K线数据和六大维度分析，严格按照JSON格式输出。
`.trim();

  // 根据模型选择 API 端点
  let endpoint = '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let body: Record<string, unknown>;

  if (model === 'gemini') {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    body = {
      contents: [{
        parts: [{ text: baziInfo }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };
  } else {
    // OpenAI / DeepSeek 格式
    endpoint = model === 'deepseek'
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    headers['Authorization'] = `Bearer ${apiKey}`;
    body = {
      model: model === 'gpt-4o' ? 'gpt-4o' : 'deepseek-chat',
      messages: [{ role: 'user', content: baziInfo }],
      temperature: 0.7,
      max_tokens: 8192,
    };
  }

  // 调用 API
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API 调用失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // 提取响应内容
  if (model === 'gemini') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    return data.choices?.[0]?.message?.content || '';
  }
}

/**
 * 边缘函数主入口
 */
export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // 处理 CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const startTime = Date.now();

    // 解析请求体
    const body: RequestBody = await request.json();
    const { baziResult, model = 'gemini' } = body;

    // 验证必填字段
    if (!baziResult) {
      return new Response(JSON.stringify({ error: '缺少 baziResult 字段' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 生成用户 ID（从 IP 地址或其他标识）
    interface CloudflareRequest {
      cf?: {
        colo?: string;
      };
    }
    const cf = (request as CloudflareRequest).cf;
    const userId = cf?.colo || 'unknown'; // 使用数据中心作为用户ID（生产环境应使用真实用户ID）

    // 检查限流
    const rateLimit = await checkRateLimit(env.KV_NAMESPACE, userId, model);

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        error: '请求过于频繁，请稍后再试',
        resetTime: rateLimit.resetTime,
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Retry-After': '3600',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      });
    }

    // 检查结果缓存
    const cacheKey = generateResultCacheKey(baziResult, model);
    let cachedResult: AIAnalysisResult | null = null;
    let cacheHit = false;

    try {
      const cached = await env.KV_NAMESPACE.get(cacheKey, 'text');
      if (cached) {
        cachedResult = JSON.parse(cached) as AIAnalysisResult;
        cacheHit = true;
        console.log('AI result cache hit:', cacheKey);
      }
    } catch (e) {
      console.warn('AI cache read failed:', e);
    }

    let result: AIAnalysisResult;

    if (cachedResult) {
      result = cachedResult;
    } else {
      // 获取 API 密钥
      const apiKey = model === 'gemini'
        ? env.GEMINI_API_KEY
        : model === 'deepseek'
          ? env.DEEPSEEK_API_KEY
          : env.OPENAI_API_KEY;

      if (!apiKey) {
        return new Response(JSON.stringify({
          error: `未配置 ${model} API 密钥`
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 调用 AI API
      const aiOutput = await callAI(baziResult, model, apiKey);

      // 解析 AI 输出（这里简化处理，实际应使用 aiParser）
      // 由于边缘函数环境限制，这里做简单 JSON 解析
      let jsonStr = aiOutput.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }

      result = JSON.parse(jsonStr) as AIAnalysisResult;

      // 添加元数据
      result.metadata = {
        model,
        generatedAt: new Date(),
        generationTime: Date.now() - startTime,
      };

      // 存储到 KV 缓存（30天 TTL）
      try {
        await env.KV_NAMESPACE.put(cacheKey, JSON.stringify(result), {
          expirationTtl: 30 * 24 * 60 * 60,
        });
        console.log('AI result cached:', cacheKey);
      } catch (e) {
        console.warn('AI cache write failed:', e);
      }
    }

    // 返回结果
    return new Response(JSON.stringify({
      success: true,
      data: result,
      cacheHit,
      rateLimit: {
        limit: 10,
        remaining: rateLimit.remaining,
        reset: rateLimit.resetTime,
      },
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      },
    });

  } catch (error) {
    console.error('AI 分析失败:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'AI 分析失败',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

/**
 * 默认导出
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return onRequest({ request, env });
  },
};
