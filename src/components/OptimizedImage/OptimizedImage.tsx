/**
 * 优化的图片组件
 * 支持懒加载、响应式、格式检测和性能优化
 */

import { useState, useEffect, useRef, type ImgHTMLAttributes } from 'react';
import type { ImageFormat } from '@/utils/imageOptimization';

export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'sizes'> {
  src: string;
  alt: string;
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 是否懒加载 */
  lazy?: boolean;
  /** 图片格式 */
  format?: ImageFormat;
  /** 占位背景色 */
  placeholderColor?: string;
  /** 加载失败时的备用图片 */
  fallback?: string;
  /** srcset 断点配置 */
  sizes?: number[];
  /** 加载成功回调 */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** 加载失败回调 */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * 优化的图片组件
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  lazy = true,
  placeholderColor = '#f3f4f6',
  fallback = '/placeholder.png',
  sizes = [320, 640, 768, 1024, 1280, 1536],
  onLoad,
  onError,
  className = '',
  ...imgProps
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInViewport, setIsInViewport] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 交叉观察器用于懒加载
  useEffect(() => {
    if (!lazy || isInViewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInViewport]);

  // 处理加载成功
  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(event);
  };

  // 处理加载失败
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoaded(true);
    onError?.(event);
  };

  // 生成 srcset
  const generateSrcSet = (baseUrl: string, sizes: number[]): string => {
    const urlWithoutExt = baseUrl.replace(/\.[^/.]+$/, '');
    return sizes
      .map((size) => {
        // 假设图片有不同尺寸版本,格式为 base_[width]w.ext
        return `${urlWithoutExt}_${size}w.webp ${size}w, ${urlWithoutExt}_${size}w.jpg ${size}w`;
      })
      .join(', ');
  };

  // 生成 sizes 属性
  const generateSizes = (): string => {
    return '(max-width: 640px) 320px, (max-width: 768px) 640px, (max-width: 1024px) 768px, 1024px';
  };

  const imageSrc = hasError ? fallback : src;

  return (
    <div
      className={`optimized-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: placeholderColor,
        ...(width && { width: `${width}px` }),
        ...(height && { height: `${height}px` }),
      }}
    >
      {/* 加载占位符 */}
      {!isLoaded && (
        <div
          className="image-placeholder"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: placeholderColor,
            backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}

      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={isInViewport ? imageSrc : undefined}
        srcSet={isInViewport && !hasError ? generateSrcSet(src, sizes) : undefined}
        sizes={generateSizes()}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          display: isLoaded ? 'block' : 'none',
        }}
        {...imgProps}
      />

      {/* 错误状态 */}
      {hasError && !fallback && (
        <div
          className="image-error"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            color: '#9ca3af',
            fontSize: '14px',
          }}
        >
          图片加载失败
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * 响应式图片容器组件
 * 支持 WebP 和 JPEG 回退
 */
export interface PictureProps extends OptimizedImageProps {
  /** 是否使用 picture 元素 */
  usePicture?: boolean;
}

/**
 * Picture 元素组件,提供格式回退
 */
export function Picture({
  src,
  alt,
  width,
  height,
  lazy = true,
  sizes = [320, 640, 768, 1024, 1280, 1536],
  className = '',
  onLoad,
  onError,
  ...imgProps
}: PictureProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    onError?.(event);
  };

  // 生成响应式图片 URL
  const generateResponsiveUrl = (baseUrl: string, width: number, format: 'webp' | 'jpg') => {
    const urlWithoutExt = baseUrl.replace(/\.[^/.]+$/, '');
    return `${urlWithoutExt}_${width}w.${format}`;
  };

  return (
    <div
      className={`picture-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...(width && { width: `${width}px` }),
        ...(height && { height: `${height}px` }),
      }}
    >
      {!isLoaded && (
        <div
          className="picture-placeholder"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#f3f4f6',
            backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}

      <picture style={{ display: isLoaded ? 'block' : 'none' }}>
        {/* WebP 格式源 */}
        {sizes.map((size) => (
          <source
            key={`webp-${size}`}
            media={`(max-width: ${size + 1}px)`}
            srcSet={`${generateResponsiveUrl(src, size, 'webp')} ${size}w`}
            type="image/webp"
          />
        ))}

        {/* JPEG 回退源 */}
        {sizes.map((size) => (
          <source
            key={`jpeg-${size}`}
            media={`(max-width: ${size + 1}px)`}
            srcSet={`${generateResponsiveUrl(src, size, 'jpg')} ${size}w`}
            type="image/jpeg"
          />
        ))}

        {/* 默认 img 元素 */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          {...imgProps}
        />
      </picture>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

export default OptimizedImage;
