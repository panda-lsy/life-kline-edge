/**
 * Skeleton 骨架屏组件
 * 在内容加载时显示占位符,提升感知性能
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * 基础 Skeleton 组件
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 自定义类名 */
  className?: string;
  /** 是否显示动画 */
  animate?: boolean;
  /** 子元素 */
  children?: ReactNode;
}

/**
 * Skeleton 组件
 */
export function Skeleton({ className = '', animate = true, children }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200 rounded-md',
        animate && 'animate-pulse',
        className
      )}
      role="status"
      aria-label="Loading..."
    >
      {children}
    </div>
  );
}

/**
 * 文本骨架屏
 */
export interface TextSkeletonProps {
  /** 行数 */
  lines?: number;
  /** 每行高度 */
  height?: string;
  /** 行间距 */
  spacing?: string;
  /** 最后一行宽度比例 (0-1) */
  lastLineWidth?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 文本骨架屏组件
 */
export function TextSkeleton({
  lines = 3,
  height = '1rem',
  spacing = '0.5rem',
  lastLineWidth = 0.7,
  className = '',
}: TextSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)} style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="w-full"
          style={{
            height,
            width: index === lines - 1 ? `${lastLineWidth * 100}%` : '100%',
          }}
        />
      ))}
    </div>
  );
}

/**
 * 圆形骨架屏(头像、图标等)
 */
export interface CircleSkeletonProps {
  /** 尺寸 */
  size?: string | number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 圆形骨架屏组件
 */
export function CircleSkeleton({
  size = '3rem',
  className = '',
}: CircleSkeletonProps) {
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;

  return (
    <Skeleton
      className={cn('rounded-full', className)}
      style={{
        width: sizeStyle,
        height: sizeStyle,
      }}
    />
  );
}

/**
 * 卡片骨架屏
 */
export interface CardSkeletonProps {
  /** 是否显示头像 */
  showAvatar?: boolean;
  /** 是否显示图片 */
  showImage?: boolean;
  /** 图片高度 */
  imageHeight?: string;
  /** 文本行数 */
  textLines?: number;
  /** 是否显示底部按钮 */
  showButton?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 卡片骨架屏组件
 */
export function CardSkeleton({
  showAvatar = false,
  showImage = true,
  imageHeight = '200px',
  textLines = 3,
  showButton = false,
  className = '',
}: CardSkeletonProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-md p-4', className)}>
      {/* 图片骨架屏 */}
      {showImage && (
        <Skeleton
          className="w-full mb-4"
          style={{ height: imageHeight }}
        />
      )}

      {/* 头像 + 标题骨架屏 */}
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <CircleSkeleton size="3rem" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-3" />
          </div>
        </div>
      )}

      {/* 文本骨架屏 */}
      <TextSkeleton lines={textLines} />

      {/* 按钮骨架屏 */}
      {showButton && (
        <div className="mt-4 flex space-x-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="flex-1 h-10" />
        </div>
      )}
    </div>
  );
}

/**
 * 列表项骨架屏
 */
export interface ListItemSkeletonProps {
  /** 是否显示头像 */
  showAvatar?: boolean;
  /** 文本行数 */
  textLines?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 列表项骨架屏组件
 */
export function ListItemSkeleton({
  showAvatar = true,
  textLines = 2,
  className = '',
}: ListItemSkeletonProps) {
  return (
    <div className={cn('flex items-center space-x-4 p-4 border-b', className)}>
      {/* 头像 */}
      {showAvatar && <CircleSkeleton size="3rem" />}

      {/* 文本 */}
      <div className="flex-1 space-y-2">
        <TextSkeleton lines={textLines} lastLineWidth={0.6} />
      </div>
    </div>
  );
}

/**
 * 表格骨架屏
 */
export interface TableSkeletonProps {
  /** 行数 */
  rows?: number;
  /** 列数 */
  columns?: number;
  /** 是否显示表头 */
  showHeader?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 表格骨架屏组件
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
}: TableSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* 表头 */}
      {showHeader && (
        <div className="flex space-x-4 mb-4 pb-2 border-b">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={`header-${index}`}
              className="flex-1 h-6"
            />
          ))}
        </div>
      )}

      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex space-x-4 py-3 border-b last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className="flex-1 h-4"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * K线图骨架屏
 */
export interface KLineSkeletonProps {
  /** 高度 */
  height?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * K线图骨架屏组件
 */
export function KLineSkeleton({ height = '400px', className = '' }: KLineSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-32 h-6" />
      </div>

      {/* 图表区域 */}
      <div className="relative">
        {/* Y轴 */}
        <div className="absolute left-0 top-0 bottom-0 w-12 space-y-2">
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-full h-3" />
        </div>

        {/* 图表主体 */}
        <div className="ml-14">
          <Skeleton
            className="w-full"
            style={{ height }}
          />
        </div>
      </div>

      {/* X轴 */}
      <div className="mt-2 flex justify-between">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="w-12 h-3" />
        ))}
      </div>
    </div>
  );
}

/**
 * 表单骨架屏
 */
export interface FormSkeletonProps {
  /** 字段数量 */
  fields?: number;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 表单骨架屏组件
 */
export function FormSkeleton({
  fields = 4,
  showTitle = true,
  className = '',
}: FormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* 标题 */}
      {showTitle && (
        <div className="mb-6">
          <Skeleton className="w-64 h-8 mb-2" />
          <Skeleton className="w-96 h-4" />
        </div>
      )}

      {/* 表单字段 */}
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          {/* 标签 */}
          <Skeleton className="w-32 h-4" />
          {/* 输入框 */}
          <Skeleton className="w-full h-10" />
        </div>
      ))}

      {/* 按钮 */}
      <div className="flex space-x-4 pt-4">
        <Skeleton className="w-32 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>
    </div>
  );
}

/**
 * 页面加载骨架屏
 */
export interface PageSkeletonProps {
  /** 是否显示导航 */
  showNav?: boolean;
  /** 内容区域组件 */
  contentComponent?: ReactNode;
  /** 自定义类名 */
  className?: string;
}

/**
 * 页面加载骨架屏组件
 */
export function PageSkeleton({
  showNav = true,
  contentComponent = <KLineSkeleton />,
  className = '',
}: PageSkeletonProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* 导航栏 */}
      {showNav && (
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-32 h-8" />
              <div className="flex space-x-4">
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-8">
        {contentComponent}
      </div>
    </div>
  );
}

/**
 * 自定义骨架屏组合组件
 * 允许自由组合各种骨架屏元素
 */
export interface SkeletonBuilderProps {
  children: ReactNode;
  /** 自定义类名 */
  className?: string;
}

/**
 * 骨架屏构建器组件
 */
export function SkeletonBuilder({ children, className = '' }: SkeletonBuilderProps) {
  return (
    <div className={cn('skeleton-builder', className)} aria-busy="true">
      {children}
    </div>
  );
}

export default Skeleton;
