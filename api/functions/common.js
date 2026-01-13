/**
 * 边缘函数通用工具库
 * 提供统一的响应格式、CORS 配置、错误处理等
 */

/**
 * 标准响应头
 */
const STANDARD_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * CORS 预检响应
 */
export function createCorsResponse() {
  return new Response(null, {
    status: 204,
    headers: STANDARD_HEADERS,
  });
}

/**
 * 创建标准成功响应
 * @param {any} data - 响应数据
 * @param {number} status - HTTP 状态码（默认 200）
 * @param {Object} extraHeaders - 额外的响应头
 */
export function createSuccessResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }), {
    status,
    headers: { ...STANDARD_HEADERS, ...extraHeaders },
  });
}

/**
 * 创建标准错误响应
 * @param {string} message - 错误消息
 * @param {number} status - HTTP 状态码（默认 500）
 * @param {Object} extraHeaders - 额外的响应头
 */
export function createErrorResponse(message, status = 500, extraHeaders = {}) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }), {
    status,
    headers: { ...STANDARD_HEADERS, ...extraHeaders },
  });
}

/**
 * 创建限流响应
 * @param {number} resetTime - 重置时间（Unix 时间戳）
 * @param {number} limit - 限流限制
 * @param {number} remaining - 剩余次数
 */
export function createRateLimitResponse(resetTime, limit = 10, remaining = 0) {
  return new Response(JSON.stringify({
    success: false,
    error: '请求过于频繁，请稍后再试',
    resetTime,
    timestamp: new Date().toISOString(),
  }), {
    status: 429,
    headers: {
      ...STANDARD_HEADERS,
      'Retry-After': '3600',
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
    },
  });
}

/**
 * 创建未找到响应
 * @param {string} message - 错误消息（默认 'Not found'）
 */
export function createNotFoundResponse(message = 'Not found') {
  return createErrorResponse(message, 404);
}

/**
 * 创建错误请求响应
 * @param {string} message - 错误消息
 */
export function createBadRequestResponse(message) {
  return createErrorResponse(message, 400);
}

/**
 * 创建方法不允许响应
 */
export function createMethodNotAllowedResponse() {
  return createErrorResponse('Method not allowed', 405);
}

/**
 * 创建未配置响应
 * @param {string} resource - 未配置的资源名称
 */
export function createNotConfiguredResponse(resource) {
  return createErrorResponse(`${resource} 未配置`, 500);
}

/**
 * 包装异步处理函数，提供统一的错误处理
 * @param {Function} handler - 处理函数
 * @param {string} errorMessage - 错误消息前缀
 */
export function wrapAsyncHandler(handler, errorMessage) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      const message = error instanceof Error ? error.message : errorMessage;
      return createErrorResponse(message);
    }
  };
}

/**
 * 验证请求体的必填字段
 * @param {Object} body - 请求体
 * @param {string[]} requiredFields - 必填字段列表
 * @returns {{ valid: boolean, missingField?: string }}
 */
export function validateRequestBody(body, requiredFields) {
  for (const field of requiredFields) {
    if (!body[field]) {
      return { valid: false, missingField: field };
    }
  }
  return { valid: true };
}

/**
 * 从请求中获取用户 ID
 * @param {Request} request - 请求对象
 * @returns {string} 用户 ID
 */
export function getUserIdFromRequest(request) {
  const cf = request.cf;
  return cf?.colo || 'anonymous';
}

/**
 * 从 URL 中提取路径参数
 * @param {string} url - URL 字符串
 * @param {string} pattern - 路径模式（如 '/api/history/:id'）
 * @returns {Object|null} 参数对象或 null
 */
export function extractPathParams(url, pattern) {
  const urlParts = url.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);

  if (urlParts.length !== patternParts.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const urlPart = urlParts[i];

    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1);
      params[paramName] = urlPart;
    } else if (patternPart !== urlPart) {
      return null;
    }
  }

  return params;
}

/**
 * 生成缓存键哈希
 * @param {string|Object} keyData - 键数据
 * @param {string} prefix - 键前缀
 * @returns {string} 哈希后的键
 */
export function generateCacheKey(keyData, prefix = 'cache') {
  const keyStr = typeof keyData === 'string' ? keyData : JSON.stringify(keyData);

  let hash = 0;
  for (let i = 0; i < keyStr.length; i++) {
    const char = keyStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return `${prefix}:${Math.abs(hash)}`;
}

/**
 * 安全解析 JSON
 * @param {string} jsonString - JSON 字符串
 * @param {any} defaultValue - 解析失败时的默认值
 * @returns {any} 解析结果
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON 解析失败:', error);
    return defaultValue;
  }
}

/**
 * 获取 KV 命名空间，带错误处理
 * @param {Object} env - 环境对象
 * @param {string} bindingName - KV 绑定名称（默认 'KV_NAMESPACE'）
 * @returns {Object|null} KV 命名空间对象或 null
 */
export function getKvNamespace(env, bindingName = 'KV_NAMESPACE') {
  const kv = env[bindingName];
  if (!kv) {
    console.warn(`KV 命名空间 ${bindingName} 未配置`);
  }
  return kv || null;
}

/**
 * 从 KV 中获取数据
 * @param {Object} kv - KV 命名空间
 * @param {string} key - 键
 * @returns {Promise<any|null>} 数据或 null
 */
export async function getFromKv(kv, key) {
  try {
    const data = await kv.get(key, 'text');
    return data ? safeJsonParse(data) : null;
  } catch (error) {
    console.warn(`从 KV 读取失败 [${key}]:`, error);
    return null;
  }
}

/**
 * 向 KV 中写入数据
 * @param {Object} kv - KV 命名空间
 * @param {string} key - 键
 * @param {any} value - 值
 * @param {number} ttl - 过期时间（秒）
 * @returns {Promise<boolean>} 是否成功
 */
export async function setToKv(kv, key, value, ttl = null) {
  try {
    const options = ttl ? { expirationTtl: ttl } : {};
    await kv.put(key, JSON.stringify(value), options);
    return true;
  } catch (error) {
    console.warn(`写入 KV 失败 [${key}]:`, error);
    return false;
  }
}

/**
 * 从 KV 中删除数据
 * @param {Object} kv - KV 命名空间
 * @param {string} key - 键
 * @returns {Promise<boolean>} 是否成功
 */
export async function deleteFromKv(kv, key) {
  try {
    await kv.delete(key);
    return true;
  } catch (error) {
    console.warn(`从 KV 删除失败 [${key}]:`, error);
    return false;
  }
}

/**
 * 日志记录函数（统一的日志格式）
 * @param {string} level - 日志级别（info, warn, error）
 * @param {string} message - 日志消息
 * @param {Object} context - 上下文数据
 */
export function log(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...context };

  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}
