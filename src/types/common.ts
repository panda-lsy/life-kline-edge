/**
 * 通用类型定义
 */

/**
 * 主题名称
 */
export type ThemeName = 'chinese' | 'cyberpunk' | 'minimal';

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: ThemeName;
  /** 显示名称 */
  displayName: string;
  /** 颜色配置 */
  colors: {
    /** 主色 */
    primary: string;
    /** 次色 */
    secondary: string;
    /** 背景色 */
    background: string;
    /** 表面色 */
    surface: string;
    /** 文本色 */
    text: string;
    /** 阳线颜色 */
    klineUp: string;
    /** 阴线颜色 */
    klineDown: string;
  };
  /** 字体配置 */
  fonts: {
    /** 标题字体 */
    heading: string;
    /** 正文字体 */
    body: string;
  };
  /** 效果配置 */
  effects: {
    /** 粒子效果 */
    particles: boolean;
    /** 动画效果 */
    animation: boolean;
  };
}

/**
 * 加载状态
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 页码（从1开始） */
  page: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  /** 数据列表 */
  items: T[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}
