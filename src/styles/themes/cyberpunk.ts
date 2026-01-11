/**
 * 赛博朋克主题配置
 */
export const cyberpunkTheme = {
  name: 'cyberpunk' as const,
  displayName: '赛博朋克',
  colors: {
    primary: '#ff00ff',      // 霓虹粉
    secondary: '#00ffff',    // 霓虹蓝
    background: '#0a0a0a',   // 深黑
    surface: '#1a1a1a',
    text: '#00ff00',         // 矩阵绿
    klineUp: '#ff00ff',
    klineDown: '#00ffff',
  },
  fonts: {
    heading: 'monospace',
    body: 'monospace',
  },
  effects: {
    particles: true,         // 粒子效果
    animation: true,
  },
};
