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
 * API 路由:
 * - POST /api/ai-analyze - AI 分析
 */

import {
  createCorsResponse,
  createSuccessResponse,
  createErrorResponse,
  createBadRequestResponse,
  createRateLimitResponse,
  createNotConfiguredResponse,
  getKvNamespace,
  getFromKv,
  setToKv,
  getUserIdFromRequest,
  generateCacheKey,
} from '../functions/common.js';

const TTL_SECONDS = 30 * 24 * 60 * 60;
const RATE_LIMIT = 10;
const RATE_LIMIT_TTL = 60 * 60;

/**
 * 生成限流缓存键
 */
function generateRateLimitKey(userId, model) {
  const hour = Math.floor(Date.now() / (1000 * 60 * 60));
  return `ratelimit:${model}:${userId}:${hour}`;
}

/**
 * 检查限流
 */
async function checkRateLimit(kv, userId, model) {
  const key = generateRateLimitKey(userId, model);

  try {
    const countStr = await kv.get(key, 'text');
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= RATE_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.ceil((Date.now() / (1000 * 60 * 60) + 1) * (1000 * 60 * 60)),
      };
    }

    await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_TTL });

    return {
      allowed: true,
      remaining: RATE_LIMIT - count - 1,
      resetTime: Math.ceil((Date.now() / (1000 * 60 * 60) + 1) * (1000 * 60 * 60)),
    };
  } catch (e) {
    console.warn('Rate limit check failed:', e);
    return { allowed: true, remaining: RATE_LIMIT, resetTime: 0 };
  }
}

/**
 * 调用 AI API
 */
async function callAI(baziResult, model, apiKey) {
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

  let endpoint = '';
  const headers = { 'Content-Type': 'application/json' };
  let body;

  if (model === 'gemini') {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    body = {
      contents: [{ parts: [{ text: baziInfo }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };
  } else {
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

  if (model === 'gemini') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    return data.choices?.[0]?.message?.content || '';
  }
}

/**
 * 处理 AI 分析请求
 */
async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return createCorsResponse();
  }

  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const kv = getKvNamespace(env);
  if (!kv) {
    return createErrorResponse('KV 存储未配置');
  }

  try {
    const startTime = Date.now();
    const body = await request.json();
    const { baziResult, model = 'gemini' } = body;

    const validation = validateRequestBody(body, ['baziResult']);
    if (!validation.valid) {
      return createBadRequestResponse(`缺少必填字段: ${validation.missingField}`);
    }

    const userId = getUserIdFromRequest(request);
    const rateLimitInfo = await checkRateLimit(kv, userId, model);

    if (!rateLimitInfo.allowed) {
      return createRateLimitResponse(rateLimitInfo.resetTime, RATE_LIMIT, rateLimitInfo.remaining);
    }

    const cacheKey = generateCacheKey({ baziResult, model }, 'ai-result');
    let cachedResult = null;
    let cacheHit = false;

    try {
      const cached = await getFromKv(kv, cacheKey);
      if (cached) {
        cachedResult = cached;
        cacheHit = true;
        console.log('AI result cache hit:', cacheKey);
      }
    } catch (e) {
      console.warn('AI cache read failed:', e);
    }

    let result;

    if (cachedResult) {
      result = cachedResult;
    } else {
      const apiKey = model === 'gemini'
        ? env.GEMINI_API_KEY
        : model === 'deepseek'
          ? env.DEEPSEEK_API_KEY
          : env.OPENAI_API_KEY;

      if (!apiKey) {
        return createNotConfiguredResponse(`${model} API 密钥`);
      }

      const aiOutput = await callAI(baziResult, model, apiKey);
      result = JSON.parse(aiOutput);

      result.metadata = {
        model,
        generatedAt: new Date(),
        generationTime: Date.now() - startTime,
      };

      try {
        await setToKv(kv, cacheKey, result, TTL_SECONDS);
        console.log('AI result cached:', cacheKey);
      } catch (e) {
        console.warn('AI cache write failed:', e);
      }
    }

    return createSuccessResponse(result, 200, {
      'X-Cache-Hit': cacheHit.toString(),
      'X-RateLimit-Limit': RATE_LIMIT.toString(),
      'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
      'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
    });

  } catch (error) {
    console.error('AI 分析失败:', error);
    return createErrorResponse(error instanceof Error ? error.message : 'AI 分析失败');
  }
}

export async function handler(context) {
  return onRequest(context);
}

export default {
  async fetch(request, env, ctx) {
    return onRequest({ request, env, ctx });
  },
};
