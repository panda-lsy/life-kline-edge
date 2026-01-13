/**
 * 边缘函数服务客户端
 * 封装与 ESA Pages 边缘函数的 HTTP 通信
 */

const API_BASE_URL = '/api';

/**
 * 边缘函数 API 响应接口
 */
export interface EdgeFunctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * 获取历史记录
 */
export async function getHistory(): Promise<HistoryRecord[]> {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/history?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: EdgeFunctionResponse<HistoryRecord[]> = await response.json();

    if (result.success && result.data) {
      return result.data;
    } else {
      console.error('获取历史记录失败:', result.error);
      return [];
    }
  } catch (error) {
    console.error('获取历史记录请求失败:', error);
    return [];
  }
}

/**
 * 添加历史记录
 */
export async function addHistoryRecord(
  record: Omit<HistoryRecord, 'id' | 'createdAt'>
): Promise<HistoryRecord | null> {
  try {
    const userId = getUserId();
    const payload = {
      ...record,
      userId,
    };

    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result: EdgeFunctionResponse<HistoryRecord> = await response.json();

    if (result.success && result.data) {
      return result.data;
    } else {
      console.error('添加历史记录失败:', result.error);
      alert(`添加历史记录失败: ${result.error || '未知错误'}`);
      return null;
    }
  } catch (error) {
    console.error('添加历史记录请求失败:', error);
    alert(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    return null;
  }
}

/**
 * 删除历史记录
 */
export async function deleteHistoryRecord(id: string): Promise<boolean> {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/history/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: EdgeFunctionResponse<{ success: boolean }> = await response.json();

    if (result.success) {
      return true;
    } else {
      console.error('删除历史记录失败:', result.error);
      alert(`删除历史记录失败: ${result.error || '未知错误'}`);
      return false;
    }
  } catch (error) {
    console.error('删除历史记录请求失败:', error);
    alert(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    return false;
  }
}

/**
 * 清空历史记录
 */
export async function clearHistoryRecords(): Promise<boolean> {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/history?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: EdgeFunctionResponse<{ success: boolean }> = await response.json();

    if (result.success) {
      return true;
    } else {
      console.error('清空历史记录失败:', result.error);
      alert(`清空历史记录失败: ${result.error || '未知错误'}`);
      return false;
    }
  } catch (error) {
    console.error('清空历史记录请求失败:', error);
    alert(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    return false;
  }
}

/**
 * 生成或获取用户 ID
 */
function getUserId(): string {
  let userId = localStorage.getItem('life-kline-userId');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('life-kline-userId', userId);
  }
  return userId;
}

// 重新导出类型以供其他模块使用
export type { HistoryRecord } from '../types/api';
