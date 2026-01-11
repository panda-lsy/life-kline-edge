/**
 * 极简主题配置
 */
export const minimalTheme = {
  name: 'minimal' as const,
  displayName: '极简',
  colors: {
    primary: '#000000',
    secondary: '#666666',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#1a1a1a',
    klineUp: '#000000',
    klineDown: '#999999',
  },
  fonts: {
    heading: 'system-ui, sans-serif',
    body: 'system-ui, sans-serif',
  },
  effects: {
    particles: false,
    animation: false,
  },
};
