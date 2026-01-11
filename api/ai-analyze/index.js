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

/**
 * 生成限流缓存键
 */
function generateRateLimitKey(userId, model) {
  const hour = Math.floor(Date.now() / (1000 * 60 * 60));
  return `ratelimit:${model}:${userId}:${hour}`;
}

/**
 * 生成结果缓存键
 */
function generateResultCacheKey(baziResult, model) {
  const key = `${baziResult.siZhu.year.gan}${baziResult.siZhu.year.zhi}` +
               `${baziResult.siZhu.month.gan}${baziResult.siZhu.month.zhi}` +
               `${baziResult.siZhu.day.gan}${baziResult.siZhu.day.zhi}` +
               `${baziResult.siZhu.hour.gan}${baziResult.siZhu.hour.zhi}` +
               `${baziResult.daYun.direction}` +
               `${model}`;

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
async function checkRateLimit(kv, userId, model) {
  const key = generateRateLimitKey(userId, model);
  const limit = 10;

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

    await kv.put(key, String(count + 1), {
      expirationTtl: 60 * 60,
    });

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetTime: Math.ceil((Date.now() / (1000 * 60 * 60) + 1) * (1000 * 60 * 60)),
    };
  } catch (e) {
    console.warn('Rate limit check failed:', e);
    return { allowed: true, remaining: 10, resetTime: 0 };
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
 * 边缘函数主入口
 */
export async function onRequest(context) {
  const { request, env } = context;

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

    const body = await request.json();
    const { baziResult, model = 'gemini' } = body;

    if (!baziResult) {
      return new Response(JSON.stringify({ error: '缺少 baziResult 字段' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const cf = (request).cf;
    const userId = cf?.colo || 'unknown';

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

    const cacheKey = generateResultCacheKey(baziResult, model);
    let cachedResult = null;
    let cacheHit = false;

    try {
      const cached = await env.KV_NAMESPACE.get(cacheKey, 'text');
      if (cached) {
        cachedResult = JSON.parse(cached);
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

      const aiOutput = await callAI(baziResult, model, apiKey);

      result = JSON.parse(aiOutput);

      result.metadata = {
        model,
        generatedAt: new Date(),
        generationTime: Date.now() - startTime,
      };

      try {
        await env.KV_NAMESPACE.put(cacheKey, JSON.stringify(result), {
          expirationTtl: 30 * 24 * 60 * 60,
        });
        console.log('AI result cached:', cacheKey);
      } catch (e) {
        console.warn('AI cache write failed:', e);
      }
    }

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

export default {
  async fetch(request, env) {
    return onRequest({ request, env });
  },
};
