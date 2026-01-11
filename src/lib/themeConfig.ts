/**
 * 主题配置和工具函数
 */

import type { ThemeName, ThemeConfig } from '@/types/common';

/**
 * 主题配置列表
 */
export const THEMES: Record<ThemeName, ThemeConfig> = {
  chinese: {
    name: 'chinese',
    displayName: '中国风',
    colors: {
      primary: '#C8102E',      // 中国红
      secondary: '#FFD700',    // 金色
      background: '#FEF7F0',    // 米白
      surface: '#FFFFFF',      // 纯白
      text: '#1F2937',         // 深灰
      klineUp: '#C8102E',      // 红涨
      klineDown: '#22C55E',    // 绿跌
    },
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif',
    },
    effects: {
      particles: false,
      animation: true,
    },
  },
  cyberpunk: {
    name: 'cyberpunk',
    displayName: '赛博朋克',
    colors: {
      primary: '#FF00FF',      // 品红
      secondary: '#00FFFF',    // 青色
      background: '#0A0A0A',    // 纯黑
      surface: '#1A1A1A',      // 深灰
      text: '#E0E0E0',         // 浅灰
      klineUp: '#FF00FF',      // 品红涨
      klineDown: '#00FFFF',    // 青跌
    },
    fonts: {
      heading: 'Courier New, monospace',
      body: 'system-ui, sans-serif',
    },
    effects: {
      particles: true,
      animation: true,
    },
  },
  minimal: {
    name: 'minimal',
    displayName: '极简',
    colors: {
      primary: '#2563EB',      // 蓝色
      secondary: '#64748B',    // 灰蓝
      background: '#FFFFFF',   // 纯白
      surface: '#F8FAFC',      // 浅灰
      text: '#0F172A',         // 深蓝灰
      klineUp: '#EF4444',      // 红涨
      klineDown: '#22C55E',    // 绿跌
    },
    fonts: {
      heading: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif',
    },
    effects: {
      particles: false,
      animation: false,
    },
  },
} as const;

export const LOCAL_STORAGE_KEY = 'life-kline-theme';

/**
 * 获取默认主题
 */
export function getDefaultTheme(): ThemeName {
  // 尝试从 localStorage 读取
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored && stored in THEMES) {
      return stored as ThemeName;
    }
  }

  // 否则返回中国风主题
  return 'chinese';
}

/**
 * 应用主题到 CSS 变量
 */
export function applyTheme(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 设置颜色变量
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-kline-up', theme.colors.klineUp);
  root.style.setProperty('--color-kline-down', theme.colors.klineDown);

  // 设置字体变量
  root.style.setProperty('--font-heading', theme.fonts.heading);
  root.style.setProperty('--font-body', theme.fonts.body);

  // 设置数据属性（用于条件样式）
  root.setAttribute('data-theme', theme.name);
  root.setAttribute('data-particles', theme.effects.particles.toString());
  root.setAttribute('data-animation', theme.effects.animation.toString());
}
