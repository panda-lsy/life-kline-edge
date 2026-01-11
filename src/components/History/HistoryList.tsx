/**
 * 历史记录列表组件
 * 显示和管理用户查询历史
 */

import { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, Calendar, MapPin, User, FileText, X } from 'lucide-react';
import { getHistoryService, type HistoryRecord } from '@/services/historyService';
import { useTheme } from '@/hooks/useTheme';

export interface HistoryListProps {
  /** 记录点击回调 */
  onRecordClick?: (record: HistoryRecord) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 获取历史记录颜色配置
 */
function getHistoryColors(themeName: string) {
  if (themeName === 'cyberpunk') {
    return {
      cardBg: '#1A1A1A',
      cardBorder: '#333333',
      cardBorderHover: '#FF00FF',
      textPrimary: '#E0E0E0',
      textSecondary: '#B0B0B0',
      textTertiary: '#999999',
      iconColor: '#999999',
      deleteBtn: '#FF0066',
      deleteBtnHover: '#FF3388',
      clearBtn: '#FF0066',
      clearBtnHover: '#FF3388',
      clearBtnBg: '#1A0A0A',
      searchBorder: '#333333',
      searchIcon: '#999999',
      searchClear: '#999999',
      searchClearHover: '#E0E0E0',
      loadingText: '#999999',
      emptyCardBg: '#1A1A1A',
      emptyBorder: '#333333',
      emptyIcon: '#666666',
      emptyTitle: '#B0B0B0',
      emptyDesc: '#999999',
      buttonBg: '#2A2A2A',
      buttonBgHover: '#3A3A3A',
      buttonText: '#E0E0E0',
      statsBg: '#0A1A2A',
      statsBorder: '#00FFFF',
      statsText: '#00FFFF',
      statsNumber: '#00FFFF',
      statsLabel: '#00CCCC',
    };
  }

  if (themeName === 'minimal') {
    return {
      cardBg: '#FFFFFF',
      cardBorder: '#E5E7EB',
      cardBorderHover: '#2563EB',
      textPrimary: '#111827',
      textSecondary: '#4B5563',
      textTertiary: '#6B7280',
      iconColor: '#6B7280',
      deleteBtn: '#DC2626',
      deleteBtnHover: '#EF4444',
      clearBtn: '#DC2626',
      clearBtnHover: '#B91C1C',
      clearBtnBg: '#FEF2F2',
      searchBorder: '#D1D5DB',
      searchIcon: '#9CA3AF',
      searchClear: '#9CA3AF',
      searchClearHover: '#4B5563',
      loadingText: '#6B7280',
      emptyCardBg: '#FFFFFF',
      emptyBorder: '#E5E7EB',
      emptyIcon: '#D1D5DB',
      emptyTitle: '#374151',
      emptyDesc: '#6B7280',
      buttonBg: '#F3F4F6',
      buttonBgHover: '#E5E7EB',
      buttonText: '#374151',
      statsBg: '#EFF6FF',
      statsBorder: '#93C5FD',
      statsText: '#1E40AF',
      statsNumber: '#2563EB',
      statsLabel: '#3B82F6',
    };
  }

  // chinese (default)
  return {
    cardBg: '#FFFFFF',
    cardBorder: '#E5E7EB',
    cardBorderHover: '#C8102E',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#6B7280',
    iconColor: '#6B7280',
    deleteBtn: '#EF4444',
    deleteBtnHover: '#F87171',
    clearBtn: '#DC2626',
    clearBtnHover: '#B91C1C',
    clearBtnBg: '#FEF2F2',
    searchBorder: '#D1D5DB',
    searchIcon: '#9CA3AF',
    searchClear: '#9CA3AF',
    searchClearHover: '#4B5563',
    loadingText: '#6B7280',
    emptyCardBg: '#FFFFFF',
    emptyBorder: '#E5E7EB',
    emptyIcon: '#D1D5DB',
    emptyTitle: '#374151',
    emptyDesc: '#6B7280',
    buttonBg: '#F3F4F6',
    buttonBgHover: '#E5E7EB',
    buttonText: '#374151',
    statsBg: '#EFF6FF',
    statsBorder: '#93C5FD',
    statsText: '#1E40AF',
    statsNumber: '#2563EB',
    statsLabel: '#3B82F6',
  };
}

/**
 * 历史记录卡片
 */
function HistoryCard({
  record,
  onView,
  onDelete,
  colors,
}: {
  record: HistoryRecord;
  onView: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
  colors: ReturnType<typeof getHistoryColors>;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 border"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: isHovered ? colors.cardBorderHover : colors.cardBorder,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 头部：用户信息和时间 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 transition-colors duration-300" style={{ color: colors.iconColor }} />
            <span className="font-semibold transition-colors duration-300" style={{ color: colors.textPrimary }}>
              {record.birthData.name || '匿名用户'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs transition-colors duration-300" style={{ color: colors.textSecondary }}>
            <Calendar className="w-3 h-3" />
            <span>
              {record.createdAt.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* 删除按钮 */}
        <button
          onClick={() => onDelete(record.id)}
          className="p-1 transition-colors duration-300"
          style={{ color: colors.deleteBtn }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.deleteBtnHover}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.deleteBtn}
          title="删除记录"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 位置信息 */}
      <div className="flex items-center gap-2 text-sm mb-2 transition-colors duration-300" style={{ color: colors.textSecondary }}>
        <MapPin className="w-4 h-4 transition-colors duration-300" style={{ color: colors.iconColor }} />
        <span>
          {record.birthData.location.province} {record.birthData.location.city}
        </span>
      </div>

      {/* 出生信息 */}
      <div className="text-sm mb-3 transition-colors duration-300" style={{ color: colors.textPrimary }}>
        <div>出生：{record.birthData.birthDate}</div>
        <div>时辰：{record.birthData.birthTime}</div>
      </div>

      {/* 备注 */}
      {record.note && (
        <div className="flex items-start gap-2 text-sm mb-3 transition-colors duration-300" style={{ color: colors.textSecondary }}>
          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 transition-colors duration-300" style={{ color: colors.iconColor }} />
          <span className="line-clamp-2">{record.note}</span>
        </div>
      )}

      {/* 查看按钮 */}
      <button
        onClick={() => onView(record)}
        className="w-full py-2 px-4 rounded-lg font-medium transition-all"
        style={{
          backgroundColor: isHovered ? colors.buttonBgHover : colors.buttonBg,
          color: colors.buttonText,
        }}
      >
        查看详情
      </button>
    </div>
  );
}

/**
 * 历史记录列表主组件
 */
export function HistoryList({ onRecordClick, className = '' }: HistoryListProps) {
  const { themeName } = useTheme();
  const colors = getHistoryColors(themeName);
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HistoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const service = getHistoryService();

  /**
   * 加载历史记录
   */
  const loadRecords = useCallback(() => {
    setIsLoading(true);
    try {
      const allRecords = service.getAll();
      setRecords(allRecords);
      setFilteredRecords(allRecords);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  /**
   * 初始加载
   */
  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  /**
   * 搜索记录
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records);
    } else {
      const filtered = service.search(searchQuery);
      setFilteredRecords(filtered);
    }
  }, [searchQuery, records, service]);

  /**
   * 处理记录删除
   */
  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm('确定要删除这条记录吗？')) {
        const success = service.delete(id);
        if (success) {
          loadRecords();
        } else {
          alert('删除失败');
        }
      }
    },
    [service, loadRecords]
  );

  /**
   * 处理清空所有记录
   */
  const handleClearAll = useCallback(() => {
    if (
      window.confirm('确定要清空所有历史记录吗？此操作不可恢复。')
    ) {
      service.clear();
      loadRecords();
    }
  }, [service, loadRecords]);

  /**
   * 处理记录点击
   */
  const handleRecordClick = useCallback(
    (record: HistoryRecord) => {
      onRecordClick?.(record);
    },
    [onRecordClick]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 标题和操作栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: colors.textPrimary }}>
          历史记录
        </h2>
        {records.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm rounded-lg transition-all"
            style={{
              color: colors.clearBtn,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.clearBtnHover;
              e.currentTarget.style.backgroundColor = colors.clearBtnBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.clearBtn;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            清空所有
          </button>
        )}
      </div>

      {/* 搜索栏 */}
      {records.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300" style={{ color: colors.searchIcon }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索姓名、位置或备注..."
            className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300"
            style={{ borderColor: colors.searchBorder }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 transition-colors duration-300"
              style={{ color: colors.searchClear }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.searchClearHover}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.searchClear}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="transition-colors duration-300" style={{ color: colors.loadingText }}>
            加载中...
          </div>
        </div>
      ) : records.length === 0 ? (
        /* 空状态 */
        <div className="text-center py-12 rounded-lg border-2 border-dashed transition-colors duration-300" style={{ backgroundColor: colors.emptyCardBg, borderColor: colors.emptyBorder }}>
          <FileText className="w-16 h-16 mx-auto mb-4 transition-colors duration-300" style={{ color: colors.emptyIcon }} />
          <h3 className="text-lg font-semibold mb-2 transition-colors duration-300" style={{ color: colors.emptyTitle }}>
            暂无历史记录
          </h3>
          <p className="text-sm transition-colors duration-300" style={{ color: colors.emptyDesc }}>
            您的查询历史将显示在这里
          </p>
        </div>
      ) : (
        /* 记录列表 */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((record) => (
            <HistoryCard
              key={record.id}
              record={record}
              onView={handleRecordClick}
              onDelete={handleDelete}
              colors={colors}
            />
          ))}
        </div>
      )}

      {/* 搜索结果为空 */}
      {!isLoading && records.length > 0 && filteredRecords.length === 0 && (
        <div className="text-center py-12 rounded-lg transition-colors duration-300" style={{ backgroundColor: colors.emptyCardBg }}>
          <Search className="w-16 h-16 mx-auto mb-4 transition-colors duration-300" style={{ color: colors.emptyIcon }} />
          <h3 className="text-lg font-semibold mb-2 transition-colors duration-300" style={{ color: colors.emptyTitle }}>
            未找到匹配的记录
          </h3>
          <p className="text-sm transition-colors duration-300" style={{ color: colors.emptyDesc }}>
            尝试使用其他关键词搜索
          </p>
        </div>
      )}

      {/* 统计信息 */}
      {records.length > 0 && (
        <div className="rounded-lg p-4 border transition-colors duration-300" style={{ backgroundColor: colors.statsBg, borderColor: colors.statsBorder }}>
          <div className="text-sm transition-colors duration-300" style={{ color: colors.statsText }}>
            <div className="font-semibold mb-2">统计信息</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold transition-colors duration-300" style={{ color: colors.statsNumber }}>
                  {records.length}
                </div>
                <div className="text-xs transition-colors duration-300" style={{ color: colors.statsLabel }}>
                  总记录数
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold transition-colors duration-300" style={{ color: colors.statsNumber }}>
                  {service.getStats().byLocation[Object.keys(service.getStats().byLocation)[0]] || 0}
                </div>
                <div className="text-xs transition-colors duration-300" style={{ color: colors.statsLabel }}>
                  最常查询城市
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
