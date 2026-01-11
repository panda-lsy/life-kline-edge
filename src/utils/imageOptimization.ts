/**
 * 图片优化工具函数
 * 提供响应式图片、格式检测和优化建议
 */

/**
 * 图片格式类型
 */
export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'svg';

/**
 * 响应式图片断点
 */
export const IMAGE_BREAKPOINTS = {
  xs: 320,   // 超小屏幕
  sm: 640,   // 小屏幕
  md: 768,   // 中等屏幕
  lg: 1024,  // 大屏幕
  xl: 1280,  // 超大屏幕
  '2xl': 1536, // 2倍超大屏幕
};

/**
 * 检查浏览器是否支持 WebP 格式
 */
export function checkWebPSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * 检查浏览器是否支持 AVIF 格式
 */
export function checkAVIFSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * 缓存格式检测结果
 */
const formatCache: {
  webp: boolean | null;
  avif: boolean | null;
} = {
  webp: null,
  avif: null,
};

/**
 * 获取最佳图片格式
 */
export async function getBestFormat(): Promise<ImageFormat> {
  // 优先使用缓存结果
  if (formatCache.webp !== null) {
    if (formatCache.avif) return 'avif';
    if (formatCache.webp) return 'webp';
    return 'jpeg';
  }

  // 检测格式支持
  const [avifSupported, webpSupported] = await Promise.all([
    checkAVIFSupport(),
    checkWebPSupport(),
  ]);

  formatCache.avif = avifSupported;
  formatCache.webp = webpSupported;

  if (avifSupported) return 'avif';
  if (webpSupported) return 'webp';
  return 'jpeg';
}

/**
 * 生成 srcset 属性值
 * @param baseUrl 基础图片 URL
 * @param sizes 图片尺寸数组
 * @param format 图片格式
 * @returns srcset 字符串
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[],
  format?: ImageFormat
): string {
  const extension = format ? `.${format}` : '';
  const urlWithoutExt = baseUrl.replace(/\.[^/.]+$/, '');

  return sizes
    .map((size) => {
      const width = size;
      const url = `${urlWithoutExt}_${width}w${extension}`;
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * 生成 sizes 属性值
 * @param breakpoints 响应式断点配置
 * @returns sizes 字符串
 */
export function generateSizes(breakpoints: Partial<typeof IMAGE_BREAKPOINTS> = {}): string {
  const {
    xs = IMAGE_BREAKPOINTS.xs,
    sm = IMAGE_BREAKPOINTS.sm,
    md = IMAGE_BREAKPOINTS.md,
    lg = IMAGE_BREAKPOINTS.lg,
  } = breakpoints;

  return `(max-width: ${sm}px) ${xs}px, (max-width: ${lg}px) ${md}px, ${lg}px`;
}

/**
 * 计算图片显示尺寸
 * @param containerWidth 容器宽度
 * @param imageAspectRatio 图片宽高比
 * @returns 图片显示尺寸
 */
export function calculateImageSize(
  containerWidth: number,
  imageAspectRatio: number
): {
  width: number;
  height: number;
} {
  const width = Math.min(containerWidth, 1920); // 最大 1920px
  const height = Math.round(width / imageAspectRatio);

  return { width, height };
}

/**
 * 懒加载图片配置
 */
export const lazyLoadConfig = {
  // 根元素_margin,用于提前加载
  rootMargin: '50px',
  // 阈值,0.1 表示 10% 可见时加载
  threshold: 0.1,
};

/**
 * 预加载图片
 * @param src 图片 URL
 * @returns Promise<boolean> 加载成功返回 true
 */
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * 批量预加载图片
 * @param srcs 图片 URL 数组
 * @returns Promise<number> 成功加载数量
 */
export async function preloadImages(srcs: string[]): Promise<number> {
  const results = await Promise.all(srcs.map(preloadImage));
  return results.filter(Boolean).length;
}

/**
 * 图片质量配置
 */
export const IMAGE_QUALITY = {
  low: 0.6,     // 低质量,用于缩略图
  medium: 0.75, // 中等质量,用于一般显示
  high: 0.9,    // 高质量,用于高清图
  original: 1,  // 原始质量
} as const;

/**
 * 获取图片质量参数
 * @param quality 质量级别
 * @returns 质量数值
 */
export function getImageQuality(
  quality: keyof typeof IMAGE_QUALITY = 'medium'
): number {
  return IMAGE_QUALITY[quality];
}

/**
 * 生成响应式图片 URL
 * @param baseUrl 基础 URL
 * @param width 宽度
 * @param quality 质量级别
 * @param format 格式
 * @returns 完整图片 URL
 */
export function generateResponsiveImageUrl(
  baseUrl: string,
  width: number,
  quality: keyof typeof IMAGE_QUALITY = 'medium',
  format?: ImageFormat
): string {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', getImageQuality(quality).toString());
  if (format) {
    url.searchParams.set('f', format);
  }
  return url.toString();
}

/**
 * 图片优化建议
 */
export interface ImageOptimizationSuggestion {
  currentSize: number;
  optimizedSize: number;
  savings: number;
  suggestions: string[];
}

/**
 * 分析图片并提供优化建议
 * @param imgElement 图片元素
 * @returns 优化建议
 */
export function analyzeImage(
  imgElement: HTMLImageElement
): ImageOptimizationSuggestion {
  const { naturalWidth, naturalHeight, src } = imgElement;
  const { clientWidth, clientHeight } = imgElement;

  const suggestions: string[] = [];
  let savings = 0;

  // 检查是否过度尺寸化
  if (naturalWidth > clientWidth * 2) {
    suggestions.push(
      `图片尺寸(${naturalWidth}x${naturalHeight})远大于显示尺寸(${clientWidth}x${clientHeight}),建议使用更小尺寸`
    );
    savings += 30;
  }

  // 检查格式
  const isJpeg = src.includes('.jpg') || src.includes('.jpeg');
  const isPng = src.includes('.png');

  if (isJpeg || isPng) {
    suggestions.push('建议使用 WebP 或 AVIF 格式以减少文件大小');
    savings += 25;
  }

  // 检查是否需要响应式图片
  if (!imgElement.srcset && !imgElement.parentElement?.closest('picture')) {
    suggestions.push('建议使用 srcset 或 <picture> 元素提供响应式图片');
    savings += 15;
  }

  return {
    currentSize: 100,
    optimizedSize: Math.max(0, 100 - savings),
    savings,
    suggestions,
  };
}

/**
 * 创建响应式图片组件的 props
 */
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  className?: string;
}

/**
 * 生成图片组件的默认 props
 */
export function createImageProps(
  src: string,
  alt: string,
  options: Partial<ResponsiveImageProps> = {}
): ResponsiveImageProps {
  return {
    src,
    alt,
    loading: 'lazy',
    decoding: 'async',
    ...options,
  };
}
