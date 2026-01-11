/**
 * 加载状态组件
 * 用于懒加载页面时的占位显示
 */

import { Loader2 } from 'lucide-react';

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">加载中...</p>
      </div>
    </div>
  );
}
