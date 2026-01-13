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

/**
 * 生成用户历史记录键前缀
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
 * 边缘函数主入口
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // GET /api/history - 获取历史记录
  if (path === '/api/history' && request.method === 'GET') {
    return await getHistory(request, env);
  }

  // POST /api/history - 添加历史记录
  if (path === '/api/history' && request.method === 'POST') {
    return await addHistory(request, env);
  }

  // DELETE /api/history/:id - 删除指定记录
  if (path.startsWith('/api/history/') && request.method === 'DELETE') {
    const recordId = path.split('/').pop();
    return await deleteHistory(request, env, recordId);
  }

  // DELETE /api/history - 清空所有记录
  if (path === '/api/history' && request.method === 'DELETE') {
    return await clearHistory(request, env);
  }

  // 不支持的路由
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * 获取历史记录
 */
async function getHistory(request, env) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!env.KV_NAMESPACE) {
      return new Response(JSON.stringify({ error: 'KV 存储未配置' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 获取用户的记录列表
    const listKey = getUserHistoryKey(userId);
    const listData = await env.KV_NAMESPACE.get(listKey, 'text');

    let records = [];
    if (listData) {
      try {
        records = JSON.parse(listData);
      } catch (e) {
        console.warn('解析历史记录列表失败:', e);
        records = [];
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: records,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '获取历史记录失败',
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
 * 添加历史记录
 */
async function addHistory(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();

    // 验证必填字段
    if (!body.birthData || !body.baziResult) {
      return new Response(JSON.stringify({ error: '缺少必填字段' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 生成记录 ID
    const recordId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 创建新记录
    const newRecord = {
      id: recordId,
      ...body,
      userId,
      createdAt: new Date().toISOString(),
    };

    // 获取现有记录列表
    const listKey = getUserHistoryKey(userId);
    const listData = await env.KV_NAMESPACE.get(listKey, 'text');

    let records = [];
    if (listData) {
      try {
        records = JSON.parse(listData);
      } catch (e) {
        console.warn('解析历史记录列表失败:', e);
        records = [];
      }
    }

    // 添加新记录到开头
    records.unshift(newRecord);

    // 限制记录数量（最多 10 条）
    if (records.length > 10) {
      records = records.slice(0, 10);
    }

    // 保存记录列表
    await env.KV_NAMESPACE.put(listKey, JSON.stringify(records), {
      expirationTtl: 30 * 24 * 60 * 60, // 30 天
    });

    // 保存单个记录（方便查询）
    const recordKey = getRecordKey(userId, recordId);
    await env.KV_NAMESPACE.put(recordKey, JSON.stringify(newRecord), {
      expirationTtl: 30 * 24 * 60 * 60,
    });

    return new Response(JSON.stringify({
      success: true,
      data: newRecord,
      timestamp: new Date().toISOString(),
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('添加历史记录失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '添加历史记录失败',
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
 * 删除指定历史记录
 */
async function deleteHistory(request, env, recordId) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!env.KV_NAMESPACE) {
      return new Response(JSON.stringify({ error: 'KV 存储未配置' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 获取用户的记录列表
    const listKey = getUserHistoryKey(userId);
    const listData = await env.KV_NAMESPACE.get(listKey, 'text');

    let records = [];
    if (listData) {
      try {
        records = JSON.parse(listData);
      } catch (e) {
        console.warn('解析历史记录列表失败:', e);
        records = [];
      }
    }

    // 查找并删除记录
    const index = records.findIndex((r) => r.id === recordId);
    if (index === -1) {
      return new Response(JSON.stringify({ error: '记录不存在' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    records.splice(index, 1);

    // 保存更新后的列表
    await env.KV_NAMESPACE.put(listKey, JSON.stringify(records), {
      expirationTtl: 30 * 24 * 60 * 60,
    });

    // 删除单个记录
    const recordKey = getRecordKey(userId, recordId);
    await env.KV_NAMESPACE.delete(recordKey);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('删除历史记录失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '删除历史记录失败',
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
 * 清空所有历史记录
 */
async function clearHistory(request, env) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!env.KV_NAMESPACE) {
      return new Response(JSON.stringify({ error: 'KV 存储未配置' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 获取用户的记录列表
    const listKey = getUserHistoryKey(userId);
    const listData = await env.KV_NAMESPACE.get(listKey, 'text');

    let records = [];
    if (listData) {
      try {
        records = JSON.parse(listData);
      } catch (e) {
        console.warn('解析历史记录列表失败:', e);
        records = [];
      }
    }

    // 删除所有单个记录
    for (const record of records) {
      const recordKey = getRecordKey(userId, record.id);
      await env.KV_NAMESPACE.delete(recordKey);
    }

    // 删除记录列表
    await env.KV_NAMESPACE.delete(listKey);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('清空历史记录失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '清空历史记录失败',
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
 * 从请求中获取用户 ID
 */
function getUserIdFromRequest(request) {
  const cf = (request).cf;
  return cf?.colo || 'anonymous';
}

export default {
  async fetch(request, env, ctx) {
    return onRequest({ request, env, ctx });
  },
};
