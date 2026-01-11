/**
 * 提交按钮组件
 * 带加载动画和禁用逻辑的表单提交按钮
 */

import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  /** 是否正在加载 */
  isLoading: boolean;
  /** 按钮文本 */
  label?: string;
  /** 加载中文本 */
  loadingLabel?: string;
}

export function SubmitButton({
  isLoading,
  label = '开始分析',
  loadingLabel = '正在分析中...',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="btn btn-primary w-full flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
