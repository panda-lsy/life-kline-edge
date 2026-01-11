/**
 * 八字计算边缘函数
 * 在边缘执行八字计算，支持 KV 缓存
 *
 * 环境变量:
 * - KV_NAMESPACE: KV 存储命名空间
 */

import { calculateSiZhu } from '../../src/utils/bazi/bazi.js';

/**
 * 生成缓存键
 */
function generateCacheKey(birthData) {
  const key = {
    birthDate: birthData.birthDate,
    birthTime: birthData.birthTime,
    gender: birthData.gender,
    longitude: birthData.location.longitude,
    latitude: birthData.location.latitude,
  };

  const keyStr = JSON.stringify(key);

  let hash = 0;
  for (let i = 0; i < keyStr.length; i++) {
    const char = keyStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return `bazi:${Math.abs(hash)}`;
}

/**
 * 边缘函数主入口
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // 只处理 POST 请求
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
    // 解析请求体
    const body = await request.json();
    const { birthData } = body;

    // 验证必填字段
    if (!birthData) {
      return new Response(JSON.stringify({ error: '缺少 birthData 字段' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 验证 birthData 必填字段
    const requiredFields = ['birthDate', 'birthTime', 'gender', 'location'];
    for (const field of requiredFields) {
      if (!birthData[field]) {
        return new Response(JSON.stringify({
          error: `缺少必填字段: ${field}`
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 生成缓存键
    const cacheKey = generateCacheKey(birthData);

    // 检查 KV 缓存
    let cachedResult = null;
    let cacheHit = false;

    if (env.KV_NAMESPACE) {
      try {
        const cached = await env.KV_NAMESPACE.get(cacheKey, 'text');
        if (cached) {
          cachedResult = JSON.parse(cached);
          cacheHit = true;
          console.log('Bazi result cache hit:', cacheKey);
        }
      } catch (e) {
        console.warn('Bazi cache read failed:', e);
      }
    }

    let result;

    if (cachedResult) {
      result = cachedResult;
    } else {
      // 计算八字
      result = calculateSiZhu(birthData);

      // 缓存结果（30天）
      if (env.KV_NAMESPACE) {
        try {
          await env.KV_NAMESPACE.put(cacheKey, JSON.stringify(result), {
            expirationTtl: 30 * 24 * 60 * 60,
          });
          console.log('Bazi result cached:', cacheKey);
        } catch (e) {
          console.warn('Bazi cache write failed:', e);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
      cacheHit,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('八字计算失败:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '八字计算失败',
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
