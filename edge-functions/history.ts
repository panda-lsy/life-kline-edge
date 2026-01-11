/**
 * 历史记录边缘函数
 * 管理用户查询历史，使用 ESA KV Storage 存储
 *
 * 部署到阿里云 ESA Pages 边缘函数
 */

import type { ExecutionContext } from '@cloudflare/workers-types';

/**
 * 历史记录项
 */
interface HistoryRecord {
  /** 记录 ID */
  id: string;
  /** 用户 ID */
  userId: string;
  /** 出生信息 */
  birthData: {
    name?: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthTime: string;
    location: {
      country: string;
      province: string;
      city: string;
    };
  };
  /** 创建时间 */
  createdAt: string;
  /** 备注（可选） */
  note?: string;
}

/**
 * API 响应格式
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * KV 存储键前缀
 */
const STORAGE_PREFIX = 'history:';
const USER_LIST_PREFIX = 'user_list:';

/**
 * 生成用户历史记录存储键
 */
function getUserHistoryKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

/**
 * 生成用户列表键
 */
function getUserListKey(): string {
  return `${USER_LIST_PREFIX}users`;
}

/**
 * 验证请求来源
 */
function validateRequest(request: Request): boolean {
  // 检查 Origin 或 Referer
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');

  // 允许的域名列表（生产环境需要配置实际域名）
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    // 添加生产环境域名
  ];

  // 开发环境允许所有本地请求
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return true;
  }

  if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return true;
  }

  return true; // 暂时允许所有请求，生产环境需要严格验证
}

/**
 * 设置 CORS 响应头
 */
function setCORSHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return newResponse;
}

/**
 * 处理 OPTIONS 预检请求
 */
function handleOPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * 获取用户历史记录列表
 */
async function getUserHistory(
  userId: string,
  kv: KVNamespace,
  limit: number = 10
): Promise<ApiResponse<HistoryRecord[]>> {
  try {
    const key = getUserHistoryKey(userId);
    const stored = await kv.get(key, 'text');

    if (!stored) {
      return { success: true, data: [] };
    }

    const records: HistoryRecord[] = JSON.parse(stored);
    // 按创建时间倒序排序，限制返回数量
    const sortedRecords = records
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return { success: true, data: sortedRecords };
  } catch (error) {
    return {
      success: false,
      error: `获取历史记录失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

/**
 * 添加历史记录
 */
async function addHistoryRecord(
  userId: string,
  record: Omit<HistoryRecord, 'id' | 'userId' | 'createdAt'>,
  kv: KVNamespace
): Promise<ApiResponse<HistoryRecord>> {
  try {
    const key = getUserHistoryKey(userId);
    const stored = await kv.get(key, 'text');

    let records: HistoryRecord[] = stored ? JSON.parse(stored) : [];

    // 创建新记录
    const newRecord: HistoryRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    // 添加到列表开头
    records.unshift(newRecord);

    // 限制记录数量（每用户最多10条）
    if (records.length > 10) {
      records = records.slice(0, 10);
    }

    // 保存到 KV 存储
    await kv.put(key, JSON.stringify(records), {
      expirationTtl: 60 * 60 * 24 * 30, // 30 天过期
    });

    return { success: true, data: newRecord, message: '历史记录添加成功' };
  } catch (error) {
    return {
      success: false,
      error: `添加历史记录失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

/**
 * 删除历史记录
 */
async function deleteHistoryRecord(
  userId: string,
  recordId: string,
  kv: KVNamespace
): Promise<ApiResponse> {
  try {
    const key = getUserHistoryKey(userId);
    const stored = await kv.get(key, 'text');

    if (!stored) {
      return { success: false, error: '未找到历史记录' };
    }

    let records: HistoryRecord[] = JSON.parse(stored);
    const initialLength = records.length;

    records = records.filter((r) => r.id !== recordId);

    if (records.length === initialLength) {
      return { success: false, error: '记录不存在' };
    }

    await kv.put(key, JSON.stringify(records), {
      expirationTtl: 60 * 60 * 24 * 30,
    });

    return { success: true, message: '删除成功' };
  } catch (error) {
    return {
      success: false,
      error: `删除历史记录失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

/**
 * 清空用户历史记录
 */
async function clearUserHistory(userId: string, kv: KVNamespace): Promise<ApiResponse> {
  try {
    const key = getUserHistoryKey(userId);
    await kv.delete(key);

    return { success: true, message: '历史记录已清空' };
  } catch (error) {
    return {
      success: false,
      error: `清空历史记录失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

/**
 * 主处理函数
 */
export async function onRequest(context: {
  request: Request;
  env: { KV: KVNamespace };
}): Promise<Response> {
  const { request, env } = context;

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return handleOPTIONS();
  }

  // 验证请求
  if (!validateRequest(request)) {
    return setCORSHeaders(
      new Response(JSON.stringify({ success: false, error: '请求来源不被允许' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }

  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // 路由: /api/history
    // 支持的操作:
    // GET    /api/history?userId=xxx&limit=10  - 获取历史记录列表
    // POST   /api/history                      - 添加历史记录
    // DELETE /api/history?userId=xxx&id=xxx    - 删除单条记录
    // DELETE /api/history?userId=xxx&clear=all - 清空所有记录

    const userId = url.searchParams.get('userId');
    const recordId = url.searchParams.get('id');
    const clear = url.searchParams.get('clear');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    if (!userId && request.method !== 'POST') {
      return setCORSHeaders(
        new Response(JSON.stringify({ success: false, error: '缺少 userId 参数' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    let result: ApiResponse;

    switch (request.method) {
      case 'GET': {
        if (userId) {
          result = await getUserHistory(userId, env.KV, limit);
        } else {
          result = { success: false, error: '缺少 userId 参数' };
        }
        break;
      }

      case 'POST': {
        const body = await request.json();
        if (!body.userId) {
          return setCORSHeaders(
            new Response(JSON.stringify({ success: false, error: '请求体缺少 userId' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        result = await addHistoryRecord(body.userId, body, env.KV);
        break;
      }

      case 'DELETE': {
        if (!userId) {
          return setCORSHeaders(
            new Response(JSON.stringify({ success: false, error: '缺少 userId 参数' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        if (clear === 'all') {
          result = await clearUserHistory(userId, env.KV);
        } else if (recordId) {
          result = await deleteHistoryRecord(userId, recordId, env.KV);
        } else {
          result = { success: false, error: '缺少 id 参数或 clear 参数' };
        }
        break;
      }

      default:
        result = { success: false, error: '不支持的请求方法' };
    }

    return setCORSHeaders(
      new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      error: `服务器错误: ${error instanceof Error ? error.message : '未知错误'}`,
    };

    return setCORSHeaders(
      new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
}

/**
 * 导出类型供前端使用
 */
export type { HistoryRecord, ApiResponse };
