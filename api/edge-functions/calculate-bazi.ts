/**
 * 八字计算边缘函数
 * 在边缘执行八字计算，支持 KV 缓存
 *
 * 环境变量:
 * - KV_NAMESPACE: KV 存储命名空间
 *
 * API 端点: POST /api/calculate-bazi
 */

import { calculateSiZhu } from '../../src/utils/bazi/bazi';
import type { BirthData, BaziResult } from '../../src/types';

interface Env {
  KV_NAMESPACE: KVNamespace;
}

interface RequestBody {
  birthData: BirthData;
}

interface CacheKey {
  birthDate: string;
  birthTime: string;
  gender: string;
  longitude: number;
  latitude: number;
}

/**
 * 生成缓存键
 */
function generateCacheKey(birthData: BirthData): string {
  const key: CacheKey = {
    birthDate: birthData.birthDate,
    birthTime: birthData.birthTime,
    gender: birthData.gender,
    longitude: birthData.location.longitude,
    latitude: birthData.location.latitude,
  };

  // 使用 JSON 字符串作为缓存键
  const keyStr = JSON.stringify(key);

  // 简单哈希（实际生产环境应使用 SHA256）
  let hash = 0;
  for (let i = 0; i < keyStr.length; i++) {
    const char = keyStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }

  return `bazi:${Math.abs(hash)}`;
}

/**
 * 处理 CORS
 */
function handleCORS(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return corsHeaders;
}

/**
 * 边缘函数主入口
 */
export async function onRequest(context: { request: Request; env: Env }) {
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
    const body: RequestBody = await request.json();
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
      if (!birthData[field as keyof BirthData]) {
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
    let cachedResult: BaziResult | null = null;
    let cacheHit = false;

    try {
      const cached = await env.KV_NAMESPACE.get(cacheKey, 'text');
      if (cached) {
        cachedResult = JSON.parse(cached) as BaziResult;
        cacheHit = true;
        console.log('Cache hit:', cacheKey);
      }
    } catch (e) {
      console.warn('KV cache read failed:', e);
      // 继续执行计算
    }

    // 计算八字
    let result: BaziResult;

    if (cachedResult) {
      result = cachedResult;
    } else {
      const startTime = Date.now();
      result = calculateSiZhu(birthData);
      const calculationTime = Date.now() - startTime;

      // 更新元数据
      result.calculationTime = calculationTime;

      // 存储到 KV 缓存（30天 TTL）
      try {
        await env.KV_NAMESPACE.put(cacheKey, JSON.stringify(result), {
          expirationTtl: 30 * 24 * 60 * 60, // 30天
        });
        console.log('Cache stored:', cacheKey);
      } catch (e) {
        console.warn('KV cache write failed:', e);
        // 不影响主流程
      }
    }

    // 返回结果
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
        'Cache-Control': 'public, max-age=86400', // 1天
      },
    });

  } catch (error) {
    console.error('计算失败:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '计算失败',
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
 * 默认导出（兼容不同的边缘函数平台）
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return onRequest({ request, env });
  },
};
