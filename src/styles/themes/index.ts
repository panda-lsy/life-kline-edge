/**
 * 主题系统
 */
import { chineseTheme } from './chinese';
import { cyberpunkTheme } from './cyberpunk';
import { minimalTheme } from './minimal';

export type ThemeName = 'chinese' | 'cyberpunk' | 'minimal';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    klineUp: string;
    klineDown: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  effects: {
    particles: boolean;
    animation: boolean;
  };
}

export const themes: Record<ThemeName, ThemeConfig> = {
  chinese: chineseTheme,
  cyberpunk: cyberpunkTheme,
  minimal: minimalTheme,
};

export const defaultTheme: ThemeName = 'chinese';
