/**
 * 历史记录边缘函数
 * 管理用户查询历史，基于 ESA KV 存储
 *
 * 环境变量:
 * - KV_NAMESPACE: KV 存储命名空间
 *
 * API 路由:
 * - GET /api/history - 获取所有历史记录
 * - POST /api/history - 添加历史记录
 * - DELETE /api/history/:id - 删除指定记录
 * - DELETE /api/history - 清空所有记录
 */

import {
  createCorsResponse,
  createSuccessResponse,
  createErrorResponse,
  createNotFoundResponse,
  createBadRequestResponse,
  getKvNamespace,
  getFromKv,
  setToKv,
  deleteFromKv,
  getUserIdFromRequest,
  generateCacheKey,
} from './common.js';

const MAX_RECORDS = 10;
const TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * 生成用户历史记录键
 */
function getUserHistoryKey(userId) {
  return `history:${userId}`;
}

/**
 * 生成单个记录键
 */
function getRecordKey(userId, recordId) {
  return `${getUserHistoryKey(userId)}:${recordId}`;
}

/**
 * 获取历史记录
 */
async function getHistory(request, env) {
  const kv = getKvNamespace(env);
  if (!kv) {
    return createErrorResponse('KV 存储未配置');
  }

  const userId = getUserIdFromRequest(request);
  const listKey = getUserHistoryKey(userId);
  const records = (await getFromKv(kv, listKey)) || [];

  return createSuccessResponse(records);
}

/**
 * 添加历史记录
 */
async function addHistory(request, env) {
  const kv = getKvNamespace(env);
  if (!kv) {
    return createErrorResponse('KV 存储未配置');
  }

  const body = await request.json();
  const validation = validateRequestBody(body, ['birthData', 'baziResult']);

  if (!validation.valid) {
    return createBadRequestResponse(`缺少必填字段: ${validation.missingField}`);
  }

  const userId = getUserIdFromRequest(request);
  const recordId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const newRecord = {
    id: recordId,
    ...body,
    userId,
    createdAt: new Date().toISOString(),
  };

  const listKey = getUserHistoryKey(userId);
  const records = (await getFromKv(kv, listKey)) || [];
  records.unshift(newRecord);

  if (records.length > MAX_RECORDS) {
    records.splice(MAX_RECORDS);
  }

  await setToKv(kv, listKey, records, TTL_SECONDS);
  await setToKv(kv, getRecordKey(userId, recordId), newRecord, TTL_SECONDS);

  return createSuccessResponse(newRecord, 201);
}

/**
 * 删除指定历史记录
 */
async function deleteHistory(request, env, recordId) {
  const kv = getKvNamespace(env);
  if (!kv) {
    return createErrorResponse('KV 存储未配置');
  }

  const userId = getUserIdFromRequest(request);
  const listKey = getUserHistoryKey(userId);
  const records = (await getFromKv(kv, listKey)) || [];

  const index = records.findIndex((r) => r.id === recordId);
  if (index === -1) {
    return createNotFoundResponse('记录不存在');
  }

  records.splice(index, 1);
  await setToKv(kv, listKey, records, TTL_SECONDS);
  await deleteFromKv(kv, getRecordKey(userId, recordId));

  return createSuccessResponse({ deleted: true });
}

/**
 * 清空所有历史记录
 */
async function clearHistory(request, env) {
  const kv = getKvNamespace(env);
  if (!kv) {
    return createErrorResponse('KV 存储未配置');
  }

  const userId = getUserIdFromRequest(request);
  const listKey = getUserHistoryKey(userId);
  const records = (await getFromKv(kv, listKey)) || [];

  for (const record of records) {
    await deleteFromKv(kv, getRecordKey(userId, record.id));
  }

  await deleteFromKv(kv, listKey);

  return createSuccessResponse({ cleared: true });
}

/**
 * 边缘函数主入口
 */
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return createCorsResponse();
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/history' && request.method === 'GET') {
    return await getHistory(request, env);
  }

  if (path === '/api/history' && request.method === 'POST') {
    return await addHistory(request, env);
  }

  if (path.startsWith('/api/history/') && request.method === 'DELETE') {
    const recordId = path.split('/').pop();
    return await deleteHistory(request, env, recordId);
  }

  if (path === '/api/history' && request.method === 'DELETE') {
    return await clearHistory(request, env);
  }

  return createNotFoundResponse('Not found');
}

export default {
  async fetch(request, env, ctx) {
    return onRequest({ request, env, ctx });
  },
};
