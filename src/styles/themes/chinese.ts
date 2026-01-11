/**
 * 中国风主题配置
 */
export const chineseTheme = {
  name: 'chinese' as const,
  displayName: '中国风',
  colors: {
    primary: '#c41e3a',      // 中国红
    secondary: '#d4af37',    // 金色
    background: '#faf8f5',   // 米白色
    surface: '#ffffff',
    text: '#1a1a1a',
    klineUp: '#c41e3a',      // 阳线 - 红色
    klineDown: '#2ecc71',    // 阴线 - 绿色
  },
  fonts: {
    heading: 'system-ui, serif',
    body: 'system-ui, sans-serif',
  },
  effects: {
    particles: false,
    animation: true,
  },
};
