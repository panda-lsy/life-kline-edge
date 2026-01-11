/**
 * K线图主题提供者
 * 为K线图组件提供主题配色和过渡动画
 */

import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * K线图主题配置
 */
export interface KLineTheme {
  /** 上涨颜色（阳线） */
  upColor: string;
  /** 下跌颜色（阴线） */
  downColor: string;
  /** 背景颜色 */
  bgColor: string;
  /** 网格颜色 */
  gridColor: string;
  /** 收盘价线条颜色 */
  lineColor: string;
  /** 最高价线条颜色 */
  highColor: string;
  /** 最低价线条颜色 */
  lowColor: string;
  /** 文本颜色 */
  textColor: string;
  /** Tooltip背景色 */
  tooltipBg: string;
  /** Tooltip边框色 */
  tooltipBorder: string;
}

/**
 * 从主题配置生成K线图配色
 */
function getKLineTheme(themeName: string): KLineTheme {
  const themes: Record<string, KLineTheme> = {
    chinese: {
      upColor: '#C8102E',          // 中国红
      downColor: '#22C55E',        // 绿色
      bgColor: '#FEF7F0',          // 米白
      gridColor: '#E5E7EB',
      lineColor: '#3B82F6',        // 蓝色
      highColor: '#F59E0B',        // 橙色
      lowColor: '#8B5CF6',         // 紫色
      textColor: '#1F2937',
      tooltipBg: '#FFFFFF',
      tooltipBorder: '#D1D5DB',
    },
    cyberpunk: {
      upColor: '#FF00FF',          // 霓虹粉
      downColor: '#00FFFF',        // 霓虹蓝
      bgColor: '#0A0A0A',          // 纯黑
      gridColor: '#1A1A1A',
      lineColor: '#00FF00',        // 矩阵绿
      highColor: '#FFFF00',        // 黄色
      lowColor: '#FF00FF',         // 品红
      textColor: '#E0E0E0',
      tooltipBg: '#1A1A1A',
      tooltipBorder: '#333333',
    },
    minimal: {
      upColor: '#EF4444',          // 红色
      downColor: '#22C55E',        // 绿色
      bgColor: '#FFFFFF',          // 纯白
      gridColor: '#E5E7EB',
      lineColor: '#2563EB',        // 蓝色
      highColor: '#F59E0B',        // 橙色
      lowColor: '#8B5CF6',         // 紫色
      textColor: '#0F172A',
      tooltipBg: '#FFFFFF',
      tooltipBorder: '#E2E8F0',
    },
  };

  return themes[themeName] || themes.chinese;
}

/**
 * 主题提供者属性
 */
export interface ThemeProviderProps {
  /** 子组件 */
  children: (theme: KLineTheme) => React.ReactNode;
}

/**
 * K线图主题提供者组件
 *
 * 功能:
 * - 自动获取当前主题
 * - 生成K线图专用的配色方案
 * - 管理主题过渡动画
 * - 通过渲染函数模式传递主题给子组件
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   {(theme) => <KLineChart theme={theme} data={data} />}
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { themeName } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<KLineTheme>(() => getKLineTheme(themeName));
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 主题切换时的过渡效果
  useEffect(() => {
    if (currentTheme !== getKLineTheme(themeName)) {
      setIsTransitioning(true);

      // 延迟更新主题,触发过渡动画
      const timer = setTimeout(() => {
        setCurrentTheme(getKLineTheme(themeName));
        setIsTransitioning(false);
      }, 150); // 150ms 延迟,让CSS过渡生效

      return () => clearTimeout(timer);
    }
  }, [themeName]);

  return (
    <div
      className={`kline-theme-provider ${isTransitioning ? 'theme-transitioning' : ''}`}
      style={
        {
          '--kline-up-color': currentTheme.upColor,
          '--kline-down-color': currentTheme.downColor,
          '--kline-bg-color': currentTheme.bgColor,
          '--kline-grid-color': currentTheme.gridColor,
          '--kline-line-color': currentTheme.lineColor,
          '--kline-high-color': currentTheme.highColor,
          '--kline-low-color': currentTheme.lowColor,
          '--kline-text-color': currentTheme.textColor,
          '--kline-tooltip-bg': currentTheme.tooltipBg,
          '--kline-tooltip-border': currentTheme.tooltipBorder,
        } as React.CSSProperties
      }
    >
      {children(currentTheme)}
    </div>
  );
}

/**
 * 主题过渡动画样式
 *
 * 使用方式:
 * 1. 在组件中导入此函数获取样式对象
 * 2. 将样式应用到需要过渡的元素
 */
export function getThemeTransitionStyles() {
  return {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } as const;
}

/**
 * 主题预设
 *
 * 可用于快速切换K线图配色方案
 */
export const KLineThemePresets: Record<string, KLineTheme> = {
  chinese: getKLineTheme('chinese'),
  cyberpunk: getKLineTheme('cyberpunk'),
  minimal: getKLineTheme('minimal'),
};
