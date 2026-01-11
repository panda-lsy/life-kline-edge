/**
 * K 线图组件 - 蜡烛图（Candlestick Chart）
 * 使用红绿蜡烛图显示人生运势 K 线
 * 支持主题适配、网格线、交互提示、滑动杆、转折点标注
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import type { KLineData, TurningPoint } from '@/types/kline';
import type { KLineTheme } from './ThemeProvider';

interface KLineChartProps {
  /** K 线数据 */
  data: KLineData[];
  /** 数据点击回调 */
  onDataClick?: (year: number, data: KLineData) => void;
  /** 主题配色（从 ThemeProvider 传递） */
  theme: KLineTheme;
  /** 高度 */
  height?: number;
  /** 转折点数据 */
  turningPoints?: TurningPoint[];
  /** 转折点点击回调 */
  onTurningPointClick?: (point: TurningPoint) => void;
  /** 初始可见年份数量 */
  initialVisibleYears?: 30 | 50 | 100;
}

/**
 * K线图配置常量
 */
const CHART_CONFIG = {
  // 边距
  margin: { top: 20, right: 30, bottom: 40, left: 60 },
  // Y轴刻度数量
  yAxisTicks: 5,
  // 网格线透明度
  gridOpacity: 0.3,
  // 蜡烛宽度占间隔的比例
  candleWidthRatio: 0.6,
} as const;

/**
 * 时间范围选项
 */
const TIME_RANGE_OPTIONS = [
  { value: 30, label: '30年', description: '短期趋势' },
  { value: 50, label: '50年', description: '中期趋势' },
  { value: 100, label: '100年', description: '长期全景' },
] as const;

/**
 * 转折点类型配置
 */
const TURNING_POINT_CONFIG = {
  peak: { label: '峰', symbol: '▲', color: '#EF4444', description: '运势高峰' },
  trough: { label: '谷', symbol: '▼', color: '#3B82F6', description: '运势低谷' },
  change: { label: '变', symbol: '◆', color: '#F59E0B', description: '重大转折' },
} as const;

/**
 * K 线图组件
 */
export function KLineChart({
  data,
  onDataClick,
  theme,
  height = 500,
  turningPoints = [],
  onTurningPointClick,
  initialVisibleYears = 30,
}: KLineChartProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [viewStart, setViewStart] = useState(0); // 视口起始索引
  const [visibleYears, setVisibleYears] = useState<30 | 50 | 100>(initialVisibleYears);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 800, height });

  // 完整数据集
  const fullData = data;

  // 当前可见的数据（基于滑动杆位置和时间范围）
  const visibleData = useMemo(() => {
    const end = Math.min(viewStart + visibleYears, fullData.length);
    return fullData.slice(viewStart, end);
  }, [fullData, viewStart, visibleYears]);

  // 处理数据点击
  const handleDataClick = (item: KLineData) => {
    setSelectedYear(item.year);
    if (onDataClick) {
      onDataClick(item.year, item);
    }
  };

  // 处理转折点点击
  const handleTurningPointClick = (point: TurningPoint) => {
    setSelectedYear(point.year);
    if (onTurningPointClick) {
      onTurningPointClick(point);
    }
  };

  // 处理时间范围切换
  const handleTimeRangeChange = (years: 30 | 50 | 100) => {
    setVisibleYears(years);
    setViewStart(0); // 重置滑动杆到起始位置
    setSelectedYear(null); // 清除选中状态
  };

  // 计算Y轴范围（基于可见数据）
  const yAxisDomain = useMemo(() => {
    if (visibleData.length === 0) return [0, 100];

    let min = Infinity;
    let max = -Infinity;

    visibleData.forEach((item) => {
      min = Math.min(min, item.low);
      max = Math.max(max, item.high);
    });

    // 添加 10% 的边距
    const padding = (max - min) * 0.1;
    const paddedMin = Math.max(0, min - padding);
    const paddedMax = Math.min(100, max + padding);

    return [paddedMin, paddedMax];
  }, [visibleData]);

  // 生成Y轴刻度
  const yAxisTicks = useMemo(() => {
    const [min, max] = yAxisDomain;
    const step = (max - min) / (CHART_CONFIG.yAxisTicks - 1);
    return Array.from({ length: CHART_CONFIG.yAxisTicks }, (_, i) => {
      const value = min + step * i;
      return {
        value: Number(value.toFixed(1)),
      };
    });
  }, [yAxisDomain]);

  // 监听容器大小变化
  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(chartRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 计算绘图区域尺寸（为转折点和Tooltip预留额外空间）
  const svgWidth = chartSize.width;
  const chartWidth = svgWidth - CHART_CONFIG.margin.left - CHART_CONFIG.margin.right;
  const chartHeight = height - CHART_CONFIG.margin.top - CHART_CONFIG.margin.bottom;
  const [yMin, yMax] = yAxisDomain;
  const yRange = yMax - yMin;
  const xBand = chartWidth / visibleData.length;

  // 值转像素坐标
  const yToPixel = (value: number) => {
    const ratio = (value - yMin) / yRange;
    return CHART_CONFIG.margin.top + chartHeight - ratio * chartHeight;
  };

  // 可见数据索引转像素坐标
  const visibleIndexToPixel = (index: number) => {
    return CHART_CONFIG.margin.left + (index * xBand) + (xBand / 2);
  };

  // 完整数据年份转像素坐标
  const fullYearToPixel = (year: number) => {
    const visibleIndex = visibleData.findIndex(d => d.year === year);
    if (visibleIndex === -1) return null;
    return visibleIndexToPixel(visibleIndex);
  };

  // 获取涨跌颜色
  const getCandleColor = (item: KLineData) => {
    return item.close >= item.open ? theme.upColor : theme.downColor;
  };

  // 过滤出当前可见的转折点
  const visibleTurningPoints = useMemo(() => {
    const visibleYears = new Set(visibleData.map(d => d.year));
    return turningPoints.filter(tp => visibleYears.has(tp.year));
  }, [turningPoints, visibleData]);

  // 滑动杆变化处理
  const maxViewStart = Math.max(0, fullData.length - visibleYears);
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViewStart(Number(e.target.value));
    setSelectedYear(null); // 滑动时清除选中状态
  };

  return (
    <div
      ref={chartRef}
      className="w-full overflow-visible"
      style={{ backgroundColor: theme.bgColor }}
    >
      {/* 主图表容器 */}
      <div className="relative overflow-visible" style={{ height }}>
        <svg
          width={chartSize.width}
          height={height}
          style={{ overflow: 'visible', display: 'block' }}
        >
          {/* Y轴网格线和刻度 */}
          {yAxisTicks.map((tick, index) => {
            const y = yToPixel(tick.value);
            return (
              <g key={`ytick-${index}`}>
                {/* 网格线 */}
                <line
                  x1={CHART_CONFIG.margin.left}
                  y1={y}
                  x2={svgWidth - CHART_CONFIG.margin.right}
                  y2={y}
                  stroke={theme.gridColor}
                  strokeWidth={1}
                  strokeOpacity={CHART_CONFIG.gridOpacity}
                  strokeDasharray="4 4"
                />
                {/* Y轴刻度线 */}
                <line
                  x1={CHART_CONFIG.margin.left - 5}
                  y1={y}
                  x2={CHART_CONFIG.margin.left}
                  y2={y}
                  stroke={theme.textColor}
                  strokeWidth={1}
                />
                {/* Y轴文字 */}
                <text
                  x={CHART_CONFIG.margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill={theme.textColor}
                >
                  {tick.value}
                </text>
              </g>
            );
          })}

          {/* X轴线和刻度 */}
          <line
            x1={CHART_CONFIG.margin.left}
            y1={height - CHART_CONFIG.margin.bottom}
            x2={svgWidth - CHART_CONFIG.margin.right}
            y2={height - CHART_CONFIG.margin.bottom}
            stroke={theme.textColor}
            strokeWidth={1}
          />

          {/* Y轴线 */}
          <line
            x1={CHART_CONFIG.margin.left}
            y1={CHART_CONFIG.margin.top}
            x2={CHART_CONFIG.margin.left}
            y2={height - CHART_CONFIG.margin.bottom}
            stroke={theme.textColor}
            strokeWidth={1}
          />

          {/* X轴刻度和标签 */}
          {visibleData
            .filter((_, index) => index % 5 === 0 || index === visibleData.length - 1)
            .map((item) => {
              const index = visibleData.indexOf(item);
              const x = visibleIndexToPixel(index);
              return (
                <g key={`xlabel-${item.year}`}>
                  {/* 刻度线 */}
                  <line
                    x1={x}
                    y1={height - CHART_CONFIG.margin.bottom}
                    x2={x}
                    y2={height - CHART_CONFIG.margin.bottom + 5}
                    stroke={theme.textColor}
                    strokeWidth={1}
                  />
                  {/* 年份标签 */}
                  <text
                    x={x}
                    y={height - CHART_CONFIG.margin.bottom + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill={theme.textColor}
                  >
                    {item.year}
                  </text>
                </g>
              );
            })}

          {/* 转折点标注 */}
          {visibleTurningPoints.map((point, index) => {
            const config = TURNING_POINT_CONFIG[point.type];
            const x = fullYearToPixel(point.year);
            if (x === null) return null;

            const data = visibleData.find(d => d.year === point.year);
            if (!data) return null;

            const y = yToPixel(data.close);

            // 智能调整标签位置，避免超出边界
            const labelY = y - 15;
            const shouldMoveLabelUp = labelY < CHART_CONFIG.margin.top + 20;
            const finalLabelY = shouldMoveLabelUp ? y + 25 : labelY;

            return (
              <g key={`tp-${point.year}-${index}`}>
                {/* 垂直虚线 */}
                <line
                  x1={x}
                  y1={CHART_CONFIG.margin.top}
                  x2={x}
                  y2={height - CHART_CONFIG.margin.bottom}
                  stroke={config.color}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
                {/* 转折点图标 */}
                <circle
                  cx={x}
                  cy={y}
                  r={8}
                  fill={config.color}
                  stroke={theme.tooltipBg}
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTurningPointClick(point)}
                  onMouseEnter={() => setHoveredYear(point.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                />
                {/* 转折点符号 */}
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fill="#FFFFFF"
                  style={{ pointerEvents: 'none' }}
                >
                  {config.symbol[0]}
                </text>
                {/* 年份标签（智能定位） */}
                <text
                  x={x}
                  y={finalLabelY}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="bold"
                  fill={config.color}
                  style={{ pointerEvents: 'none' }}
                >
                  {point.year}
                </text>
              </g>
            );
          })}

          {/* 蜡烛图 */}
          {visibleData.map((item, index) => {
            const x = visibleIndexToPixel(index);
            const yOpen = yToPixel(item.open);
            const yClose = yToPixel(item.close);
            const yHigh = yToPixel(item.high);
            const yLow = yToPixel(item.low);

            const color = getCandleColor(item);
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);
            const candleWidth = xBand * CHART_CONFIG.candleWidthRatio;

            const isHovered = hoveredYear === item.year;
            const isSelected = selectedYear === item.year;

            return (
              <g
                key={`candle-${item.year}`}
                onClick={() => handleDataClick(item)}
                onMouseEnter={() => setHoveredYear(item.year)}
                onMouseLeave={() => setHoveredYear(null)}
                style={{ cursor: 'pointer' }}
                opacity={isHovered || isSelected ? 1 : 0.85}
              >
                {/* 上影线（实体顶部到最高价） */}
                <line
                  x1={x}
                  y1={bodyTop}
                  x2={x}
                  y2={yHigh}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                />

                {/* 下影线（实体底部到最低价） */}
                <line
                  x1={x}
                  y1={bodyTop + bodyHeight}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 2}
                />

                {/* 蜡烛实体（开盘到收盘） */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  stroke={isHovered || isSelected ? theme.lineColor : color}
                  strokeWidth={isSelected ? 2 : 1}
                />

                {/* 选中状态标记 */}
                {isSelected && (
                  <line
                    x1={CHART_CONFIG.margin.left}
                    y1={yClose}
                    x2={svgWidth - CHART_CONFIG.margin.right}
                    y2={yClose}
                    stroke={theme.lineColor}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    opacity={0.5}
                  />
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {hoveredYear && (
            <g>
              {(() => {
                const item = fullData.find(d => d.year === hoveredYear);
                if (!item) return null;

                const x = fullYearToPixel(item.year);
                if (x === null) return null;

                const yClose = yToPixel(item.close);

                // 计算tooltip位置（确保不超出SVG边界）
                const tooltipX = Math.min(
                  Math.max(x + 20, CHART_CONFIG.margin.left),
                  svgWidth - 160 // 预留tooltip宽度
                );
                const tooltipY = Math.min(
                  Math.max(yClose - 40, CHART_CONFIG.margin.top),
                  height - CHART_CONFIG.margin.bottom - 100
                );

                // 检查是否是转折点
                const tp = turningPoints.find(t => t.year === item.year);
                const isTurningPoint = tp !== undefined;

                return (
                  <>
                    {/* Tooltip背景 */}
                    <rect
                      x={tooltipX}
                      y={tooltipY}
                      width={140}
                      height={isTurningPoint ? 100 : 80}
                      rx={4}
                      fill={theme.tooltipBg}
                      stroke={theme.tooltipBorder}
                      strokeWidth={1}
                      opacity={0.95}
                    />
                    {/* Tooltip内容 */}
                    <text
                      x={tooltipX + 10}
                      y={tooltipY + 20}
                      fontSize="14"
                      fontWeight="bold"
                      fill={theme.textColor}
                    >
                      {item.year}年
                      {isTurningPoint && (
                        <tspan fill={TURNING_POINT_CONFIG[tp!.type].color}>
                          {' '}{TURNING_POINT_CONFIG[tp!.type].symbol}
                        </tspan>
                      )}
                    </text>
                    <text
                      x={tooltipX + 10}
                      y={tooltipY + 38}
                      fontSize="12"
                      fill={item.close >= item.open ? theme.upColor : theme.downColor}
                    >
                      收盘: {item.close.toFixed(2)}
                    </text>
                    <text
                      x={tooltipX + 10}
                      y={tooltipY + 54}
                      fontSize="11"
                      fill={theme.textColor}
                    >
                      最高: {item.high.toFixed(2)}
                    </text>
                    <text
                      x={tooltipX + 10}
                      y={tooltipY + 70}
                      fontSize="11"
                      fill={theme.textColor}
                    >
                      最低: {item.low.toFixed(2)}
                    </text>
                    {isTurningPoint && (
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 88}
                        fontSize="10"
                        fill={TURNING_POINT_CONFIG[tp!.type].color}
                      >
                        {TURNING_POINT_CONFIG[tp!.type].description}
                      </text>
                    )}
                  </>
                );
              })()}
            </g>
          )}
        </svg>
      </div>

      {/* 时间范围选择器和滑动杆控制 */}
      <div className="mt-4 px-4 space-y-3">
        {/* 时间范围按钮组 */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span
            className="text-sm font-medium whitespace-nowrap"
            style={{ color: theme.textColor }}
          >
            时间跨度:
          </span>
          <div className="flex gap-2">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimeRangeChange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  visibleYears === option.value
                    ? 'shadow-md'
                    : 'opacity-60 hover:opacity-80'
                }`}
                style={{
                  backgroundColor:
                    visibleYears === option.value
                      ? theme.lineColor
                      : `${theme.lineColor}20`,
                  color: visibleYears === option.value ? '#FFFFFF' : theme.textColor,
                  border: `1px solid ${theme.lineColor}${
                    visibleYears === option.value ? '' : '40'
                  }`,
                }}
              >
                {option.label}
                <span className="ml-1 text-xs opacity-75">
                  ({option.description})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 滑动杆（仅在需要时显示） */}
        {fullData.length > visibleYears && (
          <div className="flex items-center gap-4">
            <span
              className="text-sm whitespace-nowrap"
              style={{ color: theme.textColor, opacity: 0.7 }}
            >
              滑动查看:
            </span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={0}
                max={maxViewStart}
                value={viewStart}
                onChange={handleSliderChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${theme.lineColor}40, ${theme.gridColor})`,
                  accentColor: theme.lineColor,
                }}
              />
            </div>
            <span
              className="text-sm whitespace-nowrap font-medium px-3 py-1 rounded"
              style={{
                color: theme.lineColor,
                backgroundColor: `${theme.lineColor}15`,
                border: `1px solid ${theme.lineColor}30`,
              }}
            >
              {visibleData[0]?.year}-{visibleData[visibleData.length - 1]?.year}年
            </span>
          </div>
        )}

        {/* 数据提示 */}
        <div
          className="text-center text-xs"
          style={{ color: theme.textColor, opacity: 0.6 }}
        >
          显示 {visibleData.length} 年数据（共 {fullData.length} 年
          {fullData.length > visibleYears && '，拖动滑动杆或切换时间范围查看更多'}）
        </div>
      </div>

      {/* 图例说明 */}
      <div
        className="mt-4 flex items-center justify-center gap-6 text-xs flex-wrap px-4"
        style={{ color: theme.textColor }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-3 rounded-sm"
            style={{ backgroundColor: theme.upColor }}
          />
          <span>上涨（阳线）</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-3 rounded-sm"
            style={{ backgroundColor: theme.downColor }}
          />
          <span>下跌（阴线）</span>
        </div>
        {turningPoints.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 rounded-sm flex items-center justify-center text-xs" style={{ backgroundColor: TURNING_POINT_CONFIG.peak.color }}>
                ▲
              </div>
              <span>运势高峰</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 rounded-sm flex items-center justify-center text-xs" style={{ backgroundColor: TURNING_POINT_CONFIG.trough.color }}>
                ▼
              </div>
              <span>运势低谷</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 rounded-sm flex items-center justify-center text-xs" style={{ backgroundColor: TURNING_POINT_CONFIG.change.color }}>
                ◆
              </div>
              <span>重大转折</span>
            </div>
          </>
        )}
        <div className="ml-4 text-gray-500">
          {turningPoints.length > 0 && `共 ${turningPoints.length} 个转折点`}
        </div>
      </div>

      {/* 选中提示 */}
      {selectedYear && (
        <div
          className="mt-3 text-center text-sm font-semibold p-2 rounded mx-4"
          style={{
            color: theme.lineColor,
            backgroundColor: `${theme.lineColor}15`,
            border: `1px solid ${theme.lineColor}40`,
          }}
        >
          已选择：{selectedYear} 年运势
        </div>
      )}
    </div>
  );
}

/**
 * 导出 K 线图组件和类型
 */
export type { KLineChartProps };
