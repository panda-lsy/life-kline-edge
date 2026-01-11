/**
 * 历史记录服务
 * 管理用户查询历史，支持 localStorage 缓存
 */

import type { BirthData, BaziResult, SixDimensions, KLineData } from '@/types';

/**
 * 历史记录项
 */
export interface HistoryRecord {
  /** 记录 ID */
  id: string;
  /** 用户 ID（可选，用于多用户隔离） */
  userId?: string;
  /** 出生信息 */
  birthData: BirthData;
  /** 八字结果 */
  baziResult: BaziResult;
  /** 六维度分析 */
  dimensionsResult: SixDimensions;
  /** K 线数据（简化版，仅保存前 20 年） */
  klineData: KLineData[];
  /** 创建时间 */
  createdAt: Date;
  /** 备注（可选） */
  note?: string;
}

/**
 * 历史记录服务配置
 */
interface HistoryServiceConfig {
  /** 最大记录数量 */
  maxRecords?: number;
  /** localStorage 键名 */
  storageKey?: string;
  /** 用户 ID */
  userId?: string;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<HistoryServiceConfig> = {
  maxRecords: 10,
  storageKey: 'life-kline-history',
  userId: 'default',
};

/**
 * 历史记录服务类
 */
export class HistoryService {
  private config: Required<HistoryServiceConfig>;
  private records: HistoryRecord[] = [];

  constructor(config: HistoryServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  /**
   * 从 localStorage 加载记录
   */
  private loadFromStorage(): void {
    try {
      // 检查 localStorage 是否可用
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage 不可用，历史记录功能将被禁用');
        this.records = [];
        return;
      }

      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) {
        this.records = [];
        return;
      }

      const parsed = JSON.parse(stored);

      // 验证数据格式
      if (!Array.isArray(parsed)) {
        console.warn('历史记录数据格式无效，将重置');
        this.records = [];
        return;
      }

      this.records = parsed
        .filter((record: any) => {
          // 过滤无效记录
          return record &&
                 record.id &&
                 record.birthData &&
                 record.createdAt;
        })
        .map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt),
        }));

    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('历史记录数据解析失败，将重置:', error.message);
      } else if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage 配额不足，无法加载历史记录');
      } else {
        console.error('加载历史记录失败:', error);
      }
      this.records = [];
    }
  }

  /**
   * 保存记录到 localStorage
   */
  private saveToStorage(): void {
    try {
      // 检查 localStorage 是否可用
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage 不可用，无法保存历史记录');
        return;
      }

      // 尝试保存数据
      const data = JSON.stringify(this.records);

      // 检查数据大小（localStorage 通常限制在 5-10MB）
      const dataSizeKB = new Blob([data]).size / 1024;
      if (dataSizeKB > 4500) { // 预留空间给其他数据
        console.warn(`历史记录数据过大 (${dataSizeKB.toFixed(2)} KB)，将清理旧记录`);
        this.cleanupOldRecords();
        return;
      }

      localStorage.setItem(this.config.storageKey, data);
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'QuotaExceededError') {
          console.error('localStorage 配额已满，将清理旧记录后重试');
          this.cleanupOldRecords();
        } else {
          console.error('localStorage 操作失败:', error.message);
        }
      } else {
        console.error('保存历史记录失败:', error);
      }
    }
  }

  /**
   * 清理旧记录以释放空间
   */
  private cleanupOldRecords(): void {
    try {
      // 删除最旧的记录，保留最新的 maxRecords * 0.8 条
      const keepCount = Math.floor(this.config.maxRecords * 0.8);
      this.records = this.records.slice(-keepCount);

      const data = JSON.stringify(this.records);
      localStorage.setItem(this.config.storageKey, data);

      console.log(`已清理历史记录，保留 ${keepCount} 条`);
    } catch (error) {
      console.error('清理历史记录失败:', error);
      // 如果还是失败，清空所有记录
      this.records = [];
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加历史记录
   */
  add(record: Omit<HistoryRecord, 'id' | 'createdAt'>): HistoryRecord {
    const newRecord: HistoryRecord = {
      ...record,
      id: this.generateId(),
      createdAt: new Date(),
      userId: record.userId || this.config.userId,
    };

    // 添加到列表开头
    this.records.unshift(newRecord);

    // 限制记录数量
    if (this.records.length > this.config.maxRecords) {
      this.records = this.records.slice(0, this.config.maxRecords);
    }

    this.saveToStorage();
    return newRecord;
  }

  /**
   * 获取所有历史记录
   */
  getAll(): HistoryRecord[] {
    return [...this.records];
  }

  /**
   * 根据 ID 获取记录
   */
  getById(id: string): HistoryRecord | undefined {
    return this.records.find((record) => record.id === id);
  }

  /**
   * 更新记录备注
   */
  updateNote(id: string, note: string): boolean {
    const record = this.records.find((r) => r.id === id);
    if (record) {
      record.note = note;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * 删除记录
   */
  delete(id: string): boolean {
    const index = this.records.findIndex((record) => record.id === id);
    if (index !== -1) {
      this.records.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * 清空所有记录
   */
  clear(): void {
    this.records = [];
    this.saveToStorage();
  }

  /**
   * 获取记录数量
   */
  count(): number {
    return this.records.length;
  }

  /**
   * 搜索记录
   */
  search(query: string): HistoryRecord[] {
    const lowerQuery = query.toLowerCase();
    return this.records.filter((record) => {
      const name = record.birthData.name?.toLowerCase() || '';
      const location = `${record.birthData.location.city} ${record.birthData.location.province}`.toLowerCase();
      const note = record.note?.toLowerCase() || '';

      return (
        name.includes(lowerQuery) ||
        location.includes(lowerQuery) ||
        note.includes(lowerQuery)
      );
    });
  }

  /**
   * 按日期范围筛选记录
   */
  filterByDateRange(startDate: Date, endDate: Date): HistoryRecord[] {
    return this.records.filter((record) => {
      const recordDate = record.createdAt;
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  /**
   * 导出历史记录为 JSON
   */
  exportAsJson(): string {
    return JSON.stringify(this.records, null, 2);
  }

  /**
   * 从 JSON 导入历史记录
   */
  importFromJson(json: string): { success: boolean; imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    try {
      const parsed = JSON.parse(json);

      if (!Array.isArray(parsed)) {
        return { success: false, imported: 0, errors: ['无效的 JSON 格式：应为数组'] };
      }

      parsed.forEach((item: any) => {
        try {
          if (!item.birthData || !item.baziResult || !item.dimensionsResult) {
            errors.push(`记录 ${item.id} 缺少必要字段`);
            return;
          }

          const record: Omit<HistoryRecord, 'id' | 'createdAt'> = {
            birthData: item.birthData,
            baziResult: item.baziResult,
            dimensionsResult: item.dimensionsResult,
            klineData: item.klineData || [],
            note: item.note,
            userId: item.userId,
          };

          this.add(record);
          imported++;
        } catch (error) {
          errors.push(`导入记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      });

      return { success: imported > 0, imported, errors };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`解析 JSON 失败: ${error instanceof Error ? error.message : '未知错误'}`],
      };
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    oldestDate: Date | null;
    newestDate: Date | null;
    byLocation: Record<string, number>;
  } {
    const byLocation: Record<string, number> = {};

    this.records.forEach((record) => {
      const location = `${record.birthData.location.province} ${record.birthData.location.city}`;
      byLocation[location] = (byLocation[location] || 0) + 1;
    });

    const dates = this.records.map((r) => r.createdAt).sort((a, b) => a.getTime() - b.getTime());

    return {
      total: this.records.length,
      oldestDate: dates[0] || null,
      newestDate: dates[dates.length - 1] || null,
      byLocation,
    };
  }
}

/**
 * 创建全局历史记录服务实例
 */
let globalHistoryService: HistoryService | null = null;

/**
 * 获取历史记录服务实例（单例模式）
 */
export function getHistoryService(config?: HistoryServiceConfig): HistoryService {
  if (!globalHistoryService) {
    globalHistoryService = new HistoryService(config);
  }
  return globalHistoryService;
}

/**
 * 重置全局历史记录服务实例
 */
export function resetHistoryService(): void {
  globalHistoryService = null;
}

/**
 * 便捷函数：添加历史记录
 */
export function addHistoryRecord(
  record: Omit<HistoryRecord, 'id' | 'createdAt'>,
  config?: HistoryServiceConfig
): HistoryRecord {
  const service = getHistoryService(config);
  return service.add(record);
}

/**
 * 便捷函数：获取所有历史记录
 */
export function getAllHistoryRecords(config?: HistoryServiceConfig): HistoryRecord[] {
  const service = getHistoryService(config);
  return service.getAll();
}

/**
 * 便捷函数：删除历史记录
 */
export function deleteHistoryRecord(id: string, config?: HistoryServiceConfig): boolean {
  const service = getHistoryService(config);
  return service.delete(id);
}

/**
 * 便捷函数：清空历史记录
 */
export function clearHistoryRecords(config?: HistoryServiceConfig): void {
  const service = getHistoryService(config);
  service.clear();
}
