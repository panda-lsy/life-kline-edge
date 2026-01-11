/**
 * 主题颜色工具
 * 提供各主题的颜色配置
 */

interface ThemeColors {
  error: string;
  border: string;
  placeholder: string;
  radioBorder: string;
}

interface InputPageColors {
  subtitle: string;
  errorBg: string;
  errorBorder: string;
  errorText: string;
  errorDesc: string;
}

const CHINESE_COLORS: ThemeColors & InputPageColors = {
  error: '#EF4444',
  border: '#E5E7EB',
  placeholder: '#6B7280',
  radioBorder: '#D1D5DB',
  subtitle: '#6B7280',
  errorBg: '#FEF2F2',
  errorBorder: '#FCA5A5',
  errorText: '#DC2626',
  errorDesc: '#B91C1C',
} as const;

const MINIMAL_COLORS: ThemeColors & InputPageColors = {
  error: '#DC2626',
  border: '#E5E7EB',
  placeholder: '#6B7280',
  radioBorder: '#D1D5DB',
  subtitle: '#6B7280',
  errorBg: '#FEF2F2',
  errorBorder: '#FCA5A5',
  errorText: '#DC2626',
  errorDesc: '#B91C1C',
} as const;

const CYBERPUNK_COLORS: ThemeColors & InputPageColors = {
  error: '#FF0066',
  border: '#333333',
  placeholder: '#999999',
  radioBorder: '#666666',
  subtitle: '#B0B0B0',
  errorBg: '#1A0A0A',
  errorBorder: '#FF0066',
  errorText: '#FF0066',
  errorDesc: '#FF6699',
} as const;

export function getFormColors(themeName: string): ThemeColors {
  switch (themeName) {
    case 'cyberpunk':
      return CYBERPUNK_COLORS;
    case 'minimal':
      return MINIMAL_COLORS;
    default:
      return CHINESE_COLORS;
  }
}

export function getInputPageColors(themeName: string): InputPageColors {
  switch (themeName) {
    case 'cyberpunk':
      return CYBERPUNK_COLORS;
    case 'minimal':
      return MINIMAL_COLORS;
    default:
      return CHINESE_COLORS;
  }
}
