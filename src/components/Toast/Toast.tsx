/**
 * Toast 通知系统
 * 提供全局的 Toast 通知功能
 * 支持主题切换
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

/**
 * Toast 类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast 消息接口
 */
export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

/**
 * Toast Context 接口
 */
interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

/**
 * Toast Context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast 图标映射
 */
const ToastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

/**
 * 根据主题获取 Toast 颜色配置
 */
function getToastColors(themeName: string, type: ToastType) {
  if (themeName === 'cyberpunk') {
    const colors = {
      success: { bg: '#0A1A0A', border: '#00FF00', text: '#00FF00', icon: '#00FF00' },
      error: { bg: '#1A0A0A', border: '#FF0066', text: '#FF0066', icon: '#FF0066' },
      warning: { bg: '#1A1A0A', border: '#FFD700', text: '#FFD700', icon: '#FFD700' },
      info: { bg: '#0A1A2A', border: '#00FFFF', text: '#00FFFF', icon: '#00FFFF' },
    };
    return colors[type];
  }

  if (themeName === 'minimal') {
    const colors = {
      success: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', icon: '#22C55E' },
      error: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: '#EF4444' },
      warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', icon: '#F59E0B' },
      info: { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF', icon: '#3B82F6' },
    };
    return colors[type];
  }

  // chinese (default)
  const colors = {
    success: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', icon: '#22C55E' },
    error: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: '#EF4444' },
    warning: { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E', icon: '#F59E0B' },
    info: { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF', icon: '#3B82F6' },
  };
  return colors[type];
}

/**
 * Toast 单个通知组件
 */
function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastMessage;
  onClose: (id: string) => void;
}) {
  const { themeName } = useTheme();
  const Icon = ToastIcons[toast.type];
  const colors = getToastColors(themeName, toast.type);

  return (
    <div
      className="border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md animate-slideIn transition-all duration-300"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
      role="alert"
    >
      {/* 图标 */}
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 transition-colors duration-300" style={{ color: colors.icon }} />

      {/* 内容 */}
      <div className="flex-1">
        {toast.title && (
          <p className="font-semibold mb-1 transition-colors duration-300" style={{ color: colors.text }}>
            {toast.title}
          </p>
        )}
        <p className="text-sm transition-colors duration-300" style={{ color: colors.text }}>
          {toast.message}
        </p>
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Toast Provider 组件
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: ToastMessage = { id, type, message, title, duration };

      setToasts((prev) => [...prev, toast]);

      // 自动关闭
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      showToast(message, 'success', title);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showToast(message, 'error', title, 10000); // 错误消息显示更长时间
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showToast(message, 'warning', title);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showToast(message, 'info', title);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainerInternal toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Toast 容器内部组件
 */
function ToastContainerInternal({
  toasts,
  removeToast,
}: {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}

/**
 * 内部 Hook：使用 Toast Context
 */
function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * useToast Hook
 */
export function useToast() {
  return useToastContext();
}
