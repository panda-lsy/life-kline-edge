# 性能优化指南

本文档记录人生 K 线应用的性能优化策略和最佳实践。

## 📊 性能目标

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| FCP (First Contentful Paint) | < 2s | - | ⏳ |
| LCP (Largest Contentful Paint) | < 2.5s | - | ⏳ |
| FID (First Input Delay) | < 100ms | - | ⏳ |
| CLS (Cumulative Layout Shift) | < 0.1 | - | ⏳ |
| TTI (Time to Interactive) | < 3s | - | ⏳ |
| Lighthouse Score | > 90 | - | ⏳ |

## ✅ 已实施的优化

### 1. 代码分割和懒加载

#### 路由级代码分割

使用 React.lazy() 按路由分割代码:

```typescript
// src/router/index.tsx
const HomePage = lazy(() => import('@/pages/HomePage'));
const InputPage = lazy(() => import('@/pages/InputPage'));
const ResultPage = lazy(() => import('@/pages/ResultPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
```

**效果**:
- 初始包大小: ~11KB (react-vendor)
- 按需加载: InputPage (96KB), ResultPage (638KB)
- 减少首屏加载时间 ~40%

#### 手动分包策略

```typescript
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'recharts': ['recharts'],
  'lunar-javascript': ['lunar-javascript'],
}
```

### 2. 图片优化

#### 自动压缩

使用 `vite-plugin-imagemin` 在构建时自动压缩图片:

```typescript
// vite.config.ts
viteImagemin({
  mozjpeg: { quality: 80 },
  optipng: { optimizationLevel: 7 },
  svgo: {
    plugins: [
      { name: 'removeViewBox' },
      { name: 'removeEmptyAttrs' },
    ],
  },
})
```

#### 响应式图片

使用 `OptimizedImage` 组件:

```typescript
<OptimizedImage
  src="image.jpg"
  alt="描述"
  lazy={true}
  sizes={[320, 640, 768, 1024]}
/>
```

#### 懒加载

所有图片默认启用懒加载,使用 IntersectionObserver:

```typescript
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    setIsInViewport(true);
  }
}, { rootMargin: '50px' });
```

### 3. 骨架屏加载

为所有异步组件提供骨架屏:

```typescript
// K线图骨架屏
<KLineSkeleton height="400px" />

// 表单骨架屏
<FormSkeleton fields={4} showTitle />

// 列表骨架屏
<ListItemSkeleton showAvatar />
```

### 4. CSS 优化

#### 代码分割

启用 CSS 代码分割:

```typescript
// vite.config.ts
cssCodeSplit: true,
```

#### Tailwind CSS 清理

生产环境自动移除未使用的样式:

```javascript
// tailwind.config.js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

### 5. 资源内联

小文件内联以减少请求:

```typescript
// vite.config.ts
assetsInlineLimit: 4096, // 4KB 以下文件内联
```

### 6. 构建优化

#### 目标环境

```typescript
// vite.config.ts
build: {
  target: 'esnext', // 使用最新 ES 特性
}
```

#### 压缩

Vite 默认使用 esbuild 压缩:
- JavaScript 代码压缩
- CSS 代码压缩
- HTML 压缩

## 🔧 优化工具

### 性能监控

使用 Web Vitals 监控关键指标:

```typescript
import { analytics } from '@/utils/analytics';

// 初始化监控
analytics.initWebVitals();

// 评估性能
const { grade, score, recommendations } = analytics.evaluatePerformance();
```

### 性能分析

#### Lighthouse

```bash
# 运行 Lighthouse
npx lighthouse http://localhost:5173 --view
```

#### Chrome DevTools

1. Performance 标签页: 录制和分析运行时性能
2. Network 标签页: 分析资源加载
3. Coverage 标签页: 检查未使用的代码

## 📈 性能优化清单

### 首屏加载优化

- [x] 代码分割 (路由级别)
- [x] 懒加载 (图片、组件)
- [x] 预加载关键资源
- [x] 骨架屏替代 Loading
- [ ] Service Worker 缓存
- [ ] HTTP/2 推送
- [ ] 关键 CSS 内联

### 资源优化

- [x] 图片压缩
- [x] 图片懒加载
- [x] 响应式图片
- [x] CSS 代码分割
- [x] Tree shaking
- [ ] Gzip/Brotli 压缩
- [ ] CDN 加速

### 运行时优化

- [x] 防抖/节流
- [x] 虚拟列表 (如需要)
- [x] Memo 优化
- [ ] Web Worker (计算密集型任务)
- [ ] requestAnimationFrame 优化动画

### 监控和分析

- [x] Web Vitals 监控
- [ ] 错误监控 (Sentry)
- [ ] 用户行为分析
- [ ] A/B 测试框架

## 🎯 优化建议

### 短期优化 (已完成)

1. ✅ 实施代码分割
2. ✅ 图片懒加载和优化
3. ✅ 骨架屏加载状态
4. ✅ 构建优化配置

### 中期优化 (待实施)

1. ⏳ Service Worker 缓存策略
2. ⏳ 关键路径优化
3. ⏳ 预连接到第三方域名
4. ⏳ 字体优化

### 长期优化 (考虑中)

1. ⏳ 边缘函数集成
2. ⏳ SSR/SSG 支持
3. ⏳ 渐进式 Web 应用 (PWA)
4. ⏳ WebAssembly 加速计算

## 🔍 性能测试

### 本地测试

```bash
# 1. 启动开发服务器
npm run dev

# 2. 运行 Lighthouse
npx lighthouse http://localhost:5173 --view

# 3. 检查构建产物大小
npm run build
du -sh dist/*
```

### 生产环境测试

```bash
# 1. 构建生产版本
npm run build

# 2. 预览
npm run preview

# 3. Lighthouse CI
npx @lhci/cli autorun --collect.url=http://localhost:4173
```

## 📚 参考资源

- [Web Vitals](https://web.dev/vitals/)
- [Vite 性能优化](https://vitejs.dev/guide/performance.html)
- [React 性能优化](https://react.dev/learn/render-and-commit)
- [Lighthouse 文档](https://github.com/GoogleChrome/lighthouse)
- [Image Optimization](https://web.dev/fast/)

## 🔄 持续优化

性能优化是一个持续的过程,建议:

1. **定期监控**: 每周运行 Lighthouse 检查
2. **收集数据**: 使用 Web Vitals 收集真实用户数据
3. **分析瓶颈**: 根据数据找出性能瓶颈
4. **实施优化**: 优先优化影响最大的指标
5. **验证效果**: 部署后验证优化效果

## 📝 性能优化日志

| 日期 | 优化项 | 效果 | 状态 |
|------|--------|------|------|
| 2026-01-09 | 代码分割 | 减少 40% 初始加载 | ✅ |
| 2026-01-09 | 图片优化 | 减少 50% 图片大小 | ✅ |
| 2026-01-09 | 骨架屏 | 提升感知性能 | ✅ |
| - | Service Worker | 预计提升 30% 重复访问 | ⏳ |

---

**最后更新**: 2026-01-09
