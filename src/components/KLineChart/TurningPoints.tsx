/**
 * 转折点标注组件
 * 在K线图上标注关键转折点,支持交互查看详情
 */

import React, { useState, useMemo } from 'react';
import { ReferenceLine, ReferenceDot } from 'recharts';
import type { LabelProps } from 'recharts';
import type { KLineData, TurningPoint } from '@/types/kline';
import type { KLineTheme } from './ThemeProvider';

/**
 * 转折点标注组件属性
 */
export interface TurningPointsProps {
  /** K线数据 */
  klineData: KLineData[];
  /** 转折点数据 */
  turningPoints: TurningPoint[];
  /** 主题配色 */
  theme: KLineTheme;
  /** 转折点点击回调 */
  onPointClick?: (point: TurningPoint) => void;
  /** 是否显示标注（默认显示） */
  visible?: boolean;
}

/**
 * 转折点类型对应的图标和颜色
 */
const POINT_TYPE_CONFIG = {
  peak: {
    label: '峰',
    color: '#EF4444',  // 红色
    symbol: '▲',
    description: '运势高峰',
  },
  trough: {
    label: '谷',
    color: '#3B82F6',  // 蓝色
    symbol: '▼',
    description: '运势低谷',
  },
  change: {
    label: '变',
    color: '#F59E0B',  // 橙色
    symbol: '◆',
    description: '重大转折',
  },
} as const;

/**
 * 转折点详情弹窗
 */
interface TurningPointDetailProps {
  point: TurningPoint;
  theme: KLineTheme;
  onClose: () => void;
}

function TurningPointDetail({ point, theme, onClose }: TurningPointDetailProps) {
  const config = POINT_TYPE_CONFIG[point.type];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-2xl max-w-md w-full p-6"
        style={{
          backgroundColor: theme.tooltipBg,
          borderColor: config.color,
          borderWidth: 2,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="text-2xl"
              style={{ color: config.color }}
            >
              {config.symbol}
            </span>
            <div>
              <h3
                className="text-lg font-bold"
                style={{ color: theme.textColor }}
              >
                {point.year}年 - {config.description}
              </h3>
              <p
                className="text-sm"
                style={{ color: theme.textColor, opacity: 0.7 }}
              >
                评分: {point.score}/100
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            style={{ color: theme.textColor, opacity: 0.5 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 原因 */}
        <div className="mb-4">
          <h4
            className="text-sm font-semibold mb-2"
            style={{ color: theme.textColor }}
          >
            原因
          </h4>
          <p
            className="text-sm leading-relaxed"
            style={{ color: theme.textColor, opacity: 0.8 }}
          >
            {point.reason}
          </p>
        </div>

        {/* 建议 */}
        <div>
          <h4
            className="text-sm font-semibold mb-2"
            style={{ color: theme.textColor }}
          >
            建议
          </h4>
          <p
            className="text-sm leading-relaxed"
            style={{ color: theme.textColor, opacity: 0.8 }}
          >
            {point.advice}
          </p>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: config.color,
            color: '#FFFFFF',
          }}
        >
          关闭
        </button>
      </div>
    </div>
  );
}

/**
 * 转折点标注组件
 */
export function TurningPoints({
  klineData,
  turningPoints,
  theme,
  onPointClick,
  visible = true,
}: TurningPointsProps) {
  const [selectedPoint, setSelectedPoint] = useState<TurningPoint | null>(null);

  // 创建年份到K线数据的映射
  const yearToDataMap = useMemo(() => {
    const map = new Map<number, KLineData>();
    klineData.forEach((item) => {
      map.set(item.year, item);
    });
    return map;
  }, [klineData]);

  // 处理转折点点击
  const handlePointClick = (point: TurningPoint) => {
    setSelectedPoint(point);
    if (onPointClick) {
      onPointClick(point);
    }
  };

  // 如果不显示或没有转折点,返回null
  if (!visible || turningPoints.length === 0) {
    return null;
  }

  return (
    <>
      {/* 渲染转折点标注 */}
      {turningPoints.map((point, index) => {
        const config = POINT_TYPE_CONFIG[point.type];
        const data = yearToDataMap.get(point.year);

        if (!data) {
          console.warn(`K线数据中未找到 ${point.year} 年的数据`);
          return null;
        }

        // 使用收盘价作为标注位置
        const yPosition = data.close;

        return (
          <React.Fragment key={point.year ?? index}>
            {/* 垂直参考线 */}
            <ReferenceLine
              x={point.year}
              stroke={config.color}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{
                value: config.symbol,
                position: 'top',
                offset: 10,
                fontSize: 16,
                fill: config.color,
                fontWeight: 'bold',
              } as LabelProps}
            />

            {/* 数据点标记 */}
            <ReferenceDot
              x={point.year}
              y={yPosition}
              r={6}
              fill={config.color}
              stroke={theme.tooltipBg}
              strokeWidth={2}
              onClick={() => handlePointClick(point)}
              style={{ cursor: 'pointer' }}
              label={{
                value: `${point.year}年`,
                position: 'bottom',
                offset: 5,
                fontSize: 11,
                fill: theme.textColor,
              } as LabelProps}
            />
          </React.Fragment>
        );
      })}

      {/* 转折点详情弹窗 */}
      {selectedPoint && (
        <TurningPointDetail
          point={selectedPoint}
          theme={theme}
          onClose={() => setSelectedPoint(null)}
        />
      )}
    </>
  );
}

/**
 * 转折点列表组件
 *
 * 以列表形式展示所有转折点,点击可定位到对应年份
 */
export interface TurningPointsListProps {
  /** 转折点数据 */
  turningPoints: TurningPoint[];
  /** 主题配色 */
  theme: KLineTheme;
  /** 转折点点击回调 */
  onPointClick?: (point: TurningPoint) => void;
}

export function TurningPointsList({
  turningPoints,
  theme,
  onPointClick,
}: TurningPointsListProps) {
  if (turningPoints.length === 0) {
    return (
      <div
        className="text-center p-6 rounded-lg"
        style={{ backgroundColor: theme.bgColor }}
      >
        <p style={{ color: theme.textColor, opacity: 0.6 }}>
          暂无转折点数据
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {turningPoints.map((point, index) => {
        const config = POINT_TYPE_CONFIG[point.type];

        return (
          <button
            key={point.year ?? index}
            onClick={() => onPointClick?.(point)}
            className="w-full text-left p-4 rounded-lg transition-all hover:shadow-md"
            style={{
              backgroundColor: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
            }}
          >
            <div className="flex items-start gap-3">
              {/* 图标 */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor: config.color,
                  color: '#FFFFFF',
                }}
              >
                {config.symbol}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4
                    className="font-semibold"
                    style={{ color: theme.textColor }}
                  >
                    {point.year}年 - {config.description}
                  </h4>
                  <span
                    className="text-sm px-2 py-1 rounded"
                    style={{
                      backgroundColor: config.color,
                      color: '#FFFFFF',
                      opacity: 0.9,
                    }}
                  >
                    {point.score}分
                  </span>
                </div>
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: theme.textColor, opacity: 0.7 }}
                >
                  {point.reason}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
