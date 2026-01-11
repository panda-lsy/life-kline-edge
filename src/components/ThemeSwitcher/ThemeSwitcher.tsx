/**
 * 主题切换器组件
 * 提供直观的 UI 选择和预览主题
 */

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeName } from '@/types/common';

interface ThemeSwitcherProps {
  /** 布局模式 */
  mode?: 'dropdown' | 'inline';
}

/**
 * 主题选项配置
 */
const THEME_OPTIONS = [
  {
    name: 'chinese' as ThemeName,
    displayName: '中国风',
    icon: '🏮',
    description: '红金配色，传统典雅',
    colors: {
      primary: '#C8102E',
      secondary: '#FFD700',
      background: '#FEF7F0',
    },
  },
  {
    name: 'cyberpunk' as ThemeName,
    displayName: '赛博朋克',
    icon: '🤖',
    description: '霓虹配色，科技感强',
    colors: {
      primary: '#FF00FF',
      secondary: '#00FFFF',
      background: '#0A0A0A',
    },
  },
  {
    name: 'minimal' as ThemeName,
    displayName: '极简',
    icon: '◯',
    description: '黑白配色，简约清爽',
    colors: {
      primary: '#2563EB',
      secondary: '#64748B',
      background: '#FFFFFF',
    },
  },
] as const;

/**
 * 主题预览卡片
 */
function ThemePreviewCard({
  theme,
  isActive,
  onClick,
}: {
  theme: typeof THEME_OPTIONS[number];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
        isActive
          ? 'border-primary shadow-lg scale-105'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
      style={{
        backgroundColor: theme.colors.background,
      }}
    >
      {/* 选中标记 */}
      {isActive && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-md">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* 主题图标和名称 */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{theme.icon}</span>
        <div className="text-left">
          <div className="font-semibold text-gray-900">{theme.displayName}</div>
          <div className="text-xs text-gray-600">{theme.description}</div>
        </div>
      </div>

      {/* 颜色预览 */}
      <div className="flex gap-2">
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: theme.colors.primary }}
          title="主色"
        />
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: theme.colors.secondary }}
          title="次色"
        />
        <div
          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: theme.colors.background }}
          title="背景色"
        />
      </div>
    </button>
  );
}

/**
 * 下拉模式主题切换器
 */
function DropdownThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = THEME_OPTIONS.find((t) => t.name === theme.name);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface text-text shadow-md hover:shadow-lg transition-shadow"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">{currentTheme?.displayName}</span>
        <span className="text-lg">{currentTheme?.icon}</span>
      </button>

      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 下拉菜单（向上展开） */}
          <div className="absolute right-0 bottom-full mb-2 z-20 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
              选择主题
            </div>
            <div className="space-y-2">
              {THEME_OPTIONS.map((themeOption) => (
                <button
                  key={themeOption.name}
                  onClick={() => {
                    setTheme(themeOption.name);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    theme.name === themeOption.name
                      ? 'border-primary bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    backgroundColor: themeOption.colors.background,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{themeOption.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {themeOption.displayName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {themeOption.description}
                      </div>
                    </div>
                    {theme.name === themeOption.name && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 内联模式主题切换器
 */
function InlineThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Palette className="w-4 h-4" />
        <span>主题选择</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map((themeOption) => {
          const isActive = theme.name === themeOption.name;
          return (
            <ThemePreviewCard
              key={themeOption.name}
              theme={themeOption}
              isActive={isActive}
              onClick={() => setTheme(themeOption.name)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * 主题切换器组件
 */
export function ThemeSwitcher({ mode = 'dropdown' }: ThemeSwitcherProps) {
  if (mode === 'dropdown') {
    return <DropdownThemeSwitcher />;
  }

  return <InlineThemeSwitcher />;
}
