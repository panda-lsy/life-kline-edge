/**
 * 主题管理 Hook
 * 统一管理主题状态、持久化、CSS 变量同步
 */

import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import type { ThemeContextType } from '@/contexts/ThemeContext';

/**
 * 主题管理 Hook
 * 使用 Context 访问全局主题状态
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

// 重新导出类型
export type { ThemeContextType };
