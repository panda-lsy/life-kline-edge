/**
 * 分享卡片图片生成工具
 * 使用 SVG + Image 的方式转换，完全避免中文编码问题
 */

import { domToPng } from 'modern-screenshot';

/**
 * 生成图片配置
 */
export interface GenerateImageOptions {
  backgroundColor?: string;
  scale?: number;
  quality?: number;
}

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Partial<GenerateImageOptions> = {
  scale: 2,
  quality: 1,
};

/**
 * 生成分享卡片图片
 * 使用 SVG Data URL 方法确保中文字符正确渲染
 */
export async function generateShareImage(
  element: HTMLElement,
  options: GenerateImageOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    // 等待所有资源加载完成
    await new Promise(resolve => setTimeout(resolve, 300));

    // 先克隆元素
    const clone = element.cloneNode(true) as HTMLElement;

    // 设置克隆元素的样式，确保在离屏渲染时正确显示
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.width = element.offsetWidth + 'px';
    clone.style.height = element.offsetHeight + 'px';

    document.body.appendChild(clone);

    try {
      // 使用 modern-screenshot 生成图片
      // 关键修复：使用 font.cssText 显式指定中文字体
      const dataUrl = await domToPng(clone, {
        scale: mergedOptions.scale || 2,
        backgroundColor: mergedOptions.backgroundColor,
        debug: true,
        features: {
          copyScrollbar: true,
          removeAbnormalAttributes: true,
          removeControlCharacter: true,
          fixSvgXmlDecode: true,
        },
        // 关键修复：显式指定中文字体 CSS
        font: {
          cssText: `
            * {
              font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', 'SimHei', 'Arial Unicode MS', sans-serif !important;
            }
            @font-face {
              font-family: 'Microsoft YaHei';
              src: local('Microsoft YaHei'), local('微软雅黑');
            }
            @font-face {
              font-family: 'PingFang SC';
              src: local('PingFang SC'), local('苹方'), local('STHeiti');
            }
            @font-face {
              font-family: 'Heiti SC';
              src: local('Heiti SC'), local('黑体'), local('SimHei');
            }
          `,
        },
      });

      return dataUrl;
    } finally {
      document.body.removeChild(clone);
    }
  } catch (error) {
    console.error('生成分享图片失败:', error);
    throw new Error(`生成分享图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 生成分享卡片图片并下载
 */
export async function downloadShareImage(
  element: HTMLElement,
  filename: string,
  options: GenerateImageOptions = {}
): Promise<void> {
  try {
    const dataUrl = await generateShareImage(element, options);

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(dataUrl);
  } catch (error) {
    console.error('下载分享图片失败:', error);
    throw error;
  }
}

/**
 * 预生成分享图片
 */
export async function previewShareImage(
  element: HTMLElement,
  options: GenerateImageOptions = {}
): Promise<{ dataUrl: string; width: number; height: number }> {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const dataUrl = await generateShareImage(element, mergedOptions);

    const size = await getImageSize(dataUrl);

    return {
      dataUrl,
      width: size.width,
      height: size.height,
    };
  } catch (error) {
    console.error('预览分享图片失败:', error);
    throw error;
  }
}

/**
 * 获取图片尺寸信息
 */
async function getImageSize(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * 获取元素的尺寸信息
 */
export function getElementSize(
  element: HTMLElement,
  scale: number = 2
): { width: number; height: number; aspectRatio: number } {
  const rect = element.getBoundingClientRect();

  return {
    width: Math.round(rect.width * scale),
    height: Math.round(rect.height * scale),
    aspectRatio: rect.width / rect.height,
  };
}
