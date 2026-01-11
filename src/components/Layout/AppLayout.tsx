/**
 * 应用布局组件
 * 包含顶部导航栏和主题切换器
 */

import { Link, useLocation, Outlet } from 'react-router-dom';
import { ThemeSwitcher } from '@/components/ThemeSwitcher/ThemeSwitcher';

export function AppLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background text-text">
      {/* 主题切换器 */}
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeSwitcher mode="dropdown" />
      </div>

      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo 和标题 */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gradient">人生 K 线</span>
            </Link>

            {/* 导航链接 */}
            <div className="flex items-center gap-6">
              <NavLink to="/" active={isActive('/')}>
                首页
              </NavLink>
              <NavLink to="/input" active={isActive('/input')}>
                输入信息
              </NavLink>
              <NavLink to="/history" active={isActive('/history')}>
                历史记录
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main><Outlet /></main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              由阿里云 ESA 提供加速支持 · 传统八字命理与现代 AI 技术结合
            </p>
            <p>
              © 2024 人生 K 线. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * 导航链接组件
 */
function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`font-medium transition-colors ${
        active
          ? 'text-primary'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
}
