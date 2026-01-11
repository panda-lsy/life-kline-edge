const fs = require('fs');
const content = `/**
 * 分享卡片图片生成工具
 * 使用 modern-screenshot 将 DOM 转换为图片
 * 该库对中文字符有更好的支持
 */

import { captureElement } from 'modern-screenshot';

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
 */
export async function generateShareImage(
  element: HTMLElement,
  options: GenerateImageOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const dataUrl = await captureElement(element, {
      scale: mergedOptions.scale || 2,
      backgroundColor: mergedOptions.backgroundColor,
      format: 'png',
      quality: mergedOptions.quality,
    });

    return dataUrl;
  } catch (error) {
    console.error('生成分享图片失败:', error);
    throw new Error(\`生成分享图片失败: \${error instanceof Error ? error.message : '未知错误'}\`);
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
    link.download = \`\${filename}.png\`;
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
`;
fs.writeFileSync('src/components/ShareCard/generateImage.ts', content, 'utf8');
console.log('File written successfully');
