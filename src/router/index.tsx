/**
 * 路由配置
 * 定义应用的所有路由
 * 实现代码分割和懒加载
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/Layout';
import { LoadingFallback } from '@/components/Loading';

/**
 * 懒加载页面组件
 * 实现代码分割，每个页面单独打包
 */
const HomePage = lazy(() => import('@/pages/HomePage'));
const InputPage = lazy(() => import('@/pages/InputPage'));
const Analysis = lazy(() => import('@/pages/Analysis'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));

/**
 * 包装页面组件的 Suspense
 */
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

/**
 * 路由配置
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'input',
        element: (
          <SuspenseWrapper>
            <InputPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'analysis',
        element: (
          <SuspenseWrapper>
            <Analysis />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'history',
        element: (
          <SuspenseWrapper>
            <HistoryPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);

/**
 * 路由提供者组件
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
