/**
 * 八字计算边缘函数
 * 在边缘执行八字计算，支持 KV 缓存
 *
 * 环境变量:
 * - KV_NAMESPACE: KV 存储命名空间
 *
 * API 路由:
 * - POST /api/calculate-bazi - 计算八字
 */

import { calculateSiZhu } from '../../src/utils/bazi/bazi.js';
import {
  createCorsResponse,
  createSuccessResponse,
  createErrorResponse,
  createBadRequestResponse,
  getKvNamespace,
  getFromKv,
  setToKv,
  generateCacheKey,
} from '../functions/common.js';

const TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * 计算八字
 */
async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return createCorsResponse();
  }

  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const body = await request.json();
  const { birthData } = body;

  const validation = validateRequestBody(birthData, ['birthDate', 'birthTime', 'gender', 'location']);
  if (!validation.valid) {
    return createBadRequestResponse(`缺少必填字段: ${validation.missingField}`);
  }

  const cacheKey = generateCacheKey(birthData, 'bazi');
  const kv = getKvNamespace(env);

  let result;
  let cacheHit = false;

  if (kv) {
    const cached = await getFromKv(kv, cacheKey);
    if (cached) {
      result = cached;
      cacheHit = true;
      console.log('Bazi result cache hit:', cacheKey);
    }
  }

  if (!result) {
    result = calculateSiZhu(birthData);

    if (kv) {
      await setToKv(kv, cacheKey, result, TTL_SECONDS);
      console.log('Bazi result cached:', cacheKey);
    }
  }

  return createSuccessResponse(result, 200, { 'X-Cache-Hit': cacheHit.toString() });
}

export async function handler(context) {
  return onRequest(context);
}

export default {
  async fetch(request, env, ctx) {
    return onRequest({ request, env, ctx });
  },
};
