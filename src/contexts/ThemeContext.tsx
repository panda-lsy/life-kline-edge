/**
 * 主题 Context Provider 组件
 * 在应用顶层提供全局主题状态
 */

import { createContext, useEffect, useState, useCallback } from 'react';
import type { ThemeName } from '@/types/common';
import { THEMES, applyTheme, LOCAL_STORAGE_KEY, getDefaultTheme } from '@/lib/themeConfig';
import { updateFavicon } from '@/utils/favicon';

/**
 * 主题 Context 类型定义
 */
export interface ThemeContextType {
  themeName: ThemeName;
  theme: typeof THEMES[ThemeName];
  themes: typeof THEMES;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

/**
 * 创建主题 Context
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 主题 Provider 组件
 * 在应用顶层提供全局主题状态
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(() => getDefaultTheme());

  // 获取当前主题配置
  const theme = THEMES[themeName];

  /**
   * 切换主题
   */
  const setTheme = useCallback((name: ThemeName) => {
    if (!(name in THEMES)) {
      console.warn(`Invalid theme name: ${name}`);
      return;
    }

    setThemeNameState(name);

    // 持久化到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, name);
    }

    // 应用新主题
    applyTheme(THEMES[name]);

    // 更新 favicon
    updateFavicon(name);
  }, []);

  /**
   * 切换到下一个主题
   */
  const toggleTheme = useCallback(() => {
    const themeNames = Object.keys(THEMES) as ThemeName[];
    const currentIndex = themeNames.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setTheme(themeNames[nextIndex]);
  }, [themeName, setTheme]);

  // 初始化时应用主题
  useEffect(() => {
    applyTheme(theme);
  }, []); // 只在组件挂载时执行一次

  // Context 值
  const contextValue: ThemeContextType = {
    themeName,
    theme,
    themes: THEMES,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
