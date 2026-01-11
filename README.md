# 人生 K 线 - Life K-line Edge Application

> 结合传统八字命理与现代 K 线图分析的人生可视化应用

**本项目由[阿里云ESA](https://www.aliyun.com/product/esa)提供加速、计算和保护**![img](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)


[![CI](https://github.com/yourusername/life-kline-edge/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/life-kline-edge/actions/workflows/ci.yml)
[![Deploy](https://github.com/yourusername/life-kline-edge/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/life-kline-edge/actions/workflows/deploy.yml)

## 📖 项目简介

人生 K 线是一个创新的边缘应用,将中国传统八字命理与金融 K 线图可视化相结合,为用户提供独特的人生运势分析视角。

### ✨ 核心特性

- 🎯 **八字排盘分析**: 基于农历和生辰八字的完整命理计算
- 📊 **K 线图可视化**: 使用 Recharts 绘制交互式人生运势 K 线图
- 🎨 **多主题支持**: 中国风、赛博朋克、极简三种主题风格
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 📜 **历史记录管理**: 本地存储查询历史,支持对比分析
- 📤 **多格式导出**: 支持分享卡片、PDF 导出
- 🚀 **边缘计算**: 基于 ESA Pages 的边缘函数和 CDN 加速
- ⚡ **性能优化**: 代码分割、懒加载、骨架屏、图片优化

## 🛠️ 技术栈

### 前端框架

- **React 19.2** - UI 框架
- **TypeScript 5.9** - 类型安全
- **Vite 7.2** - 构建工具

### 核心库

- **React Router 7.12** - 路由管理
- **Recharts 3.6** - 图表可视化
- **Zustand 5.0** - 状态管理
- **React Hook Form 7.70** - 表单管理
- **Zod 4.3** - 数据验证
- **Tailwind CSS 3.4** - 样式框架
- **Lucide React** - 图标库

### 命理计算

- **lunar-javascript 1.7** - 农历和八字计算库

### 功能工具

- **html2canvas** - 截图生成
- **jsPDF 4.0** - PDF 导出
- **DOMPurify** - XSS 防护

### 性能优化

- **vite-plugin-imagemin** - 图片优化
- **React.lazy + Suspense** - 代码分割
- **IntersectionObserver** - 懒加载
- **Skeleton 骨架屏** - 加载体验

## 📦 安装与运行

### 环境要求

- Node.js >= 20
- npm >= 10

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/life-kline-edge.git
cd life-kline-edge

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问
# http://localhost:5173
```

### 构建生产版本

```bash
# 类型检查和构建
npm run build

# 预览构建结果
npm run preview
```

## 🚀 部署指南

### GitHub Pages / ESA Pages 部署

项目已配置 GitHub Actions 自动部署流程:

#### 1. 准备工作

```bash
# 初始化 Git 仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/yourusername/life-kline-edge.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

#### 2. 配置 GitHub Pages

1. 进入 GitHub 仓库设置
2. 导航到 **Settings** → **Pages**
3. 在 **Build and deployment** 配置:
   - **Source**: GitHub Actions
4. 保存设置

#### 3. 启用 Actions

1. 导航到 **Actions** 标签页
2. 启用 GitHub Actions（如果首次使用）
3. **Deploy to ESA Pages** 工作流会在每次 push 到 `main` 分支时自动触发

#### 4. 部署流程

GitHub Actions 会自动执行以下步骤:

```yaml
1. 检出代码
2. 设置 Node.js 环境 (v20)
3. 安装依赖 (npm ci)
4. 类型检查 (tsc -b)
5. 构建项目 (npm run build)
6. 上传构建产物
7. 部署到 GitHub Pages
```

#### 5. 部署成功后

- 🌐 访问: `https://yourusername.github.io/life-kline-edge/`
- ⏱️ 通常需要 1-3 分钟完成部署

### 手动部署到 ESA Pages

如果需要部署到阿里云 ESA Pages:

#### 1. 准备构建产物

```bash
# 构建项目
npm run build

# 构建产物在 dist/ 目录
```

#### 2. 配置 ESA Pages

1. 登录 [ESA Pages 控制台](https://esa-pages.console.aliyun.com/)
2. 创建新站点或选择现有站点
3. 配置构建设置:
   - **构建命令**: `npm run build`
   - **输出目录**: `dist`
   - **环境变量**:
     - `NODE_ENV=production`
4. 连接 GitHub 仓库
5. 启用自动部署

#### 3. 环境变量配置

在 ESA Pages 控制台配置以下环境变量（如需要）:

```bash
# API 配置（如果使用边缘函数）
VITE_API_BASE_URL=https://your-api.example.com
```

⚠️ **重要**: 不要在前端代码中暴露敏感信息!

### 边缘函数部署（可选）

如果需要部署边缘函数:

#### 1. 创建边缘函数目录

```bash
mkdir -p api/functions
```

#### 2. 编写边缘函数

```javascript
// api/functions/klineAnalysis.js
export default async function handler(request) {
  // 处理 API 请求
  return new Response(JSON.stringify({ data: '...' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

#### 3. 配置路由

在 `api/routes.json`:

```json
{
  "routes": [
    {
      "pattern": "/api/*",
      "handler": "functions/*.js"
    }
  ]
}
```

#### 4. 部署

```bash
# 使用 ESA CLI
esa deploy
```

## 📁 项目结构

```
life-kline-edge/
├── .github/
│   └── workflows/          # GitHub Actions 工作流
│       ├── deploy.yml      # 部署工作流
│       └── ci.yml          # CI 工作流
├── public/                 # 静态资源
├── src/
│   ├── components/         # React 组件
│   │   ├── Layout/        # 布局组件
│   │   ├── ThemeSwitcher/ # 主题切换
│   │   ├── Form/          # 表单组件
│   │   ├── KLineChart/    # K 线图
│   │   ├── ShareCard/     # 分享卡片
│   │   ├── Toast/         # 通知系统
│   │   ├── ErrorBoundary/ # 错误边界
│   │   ├── Skeleton/      # 骨架屏
│   │   └── OptimizedImage/# 图片优化
│   ├── pages/             # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── InputPage.tsx
│   │   ├── ResultPage.tsx
│   │   └── HistoryPage.tsx
│   ├── services/          # 业务逻辑
│   │   ├── baziService.ts
│   │   ├── klineService.ts
│   │   ├── historyService.ts
│   │   └── exportService.ts
│   ├── router/            # 路由配置
│   ├── lib/               # 工具库
│   ├── utils/             # 工具函数
│   └── main.tsx           # 应用入口
├── .spec-workflow/        # Spec 工作流配置
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🎨 主题配置

项目支持三种主题风格:

- **中国风** (chinese): 传统红色和金色主题
- **赛博朋克** (cyberpunk): 霓虹紫色和蓝色主题
- **极简** (minimal): 简约黑白灰主题

主题配置位于 `src/styles/themes.css`。

## 🔧 开发指南

### 添加新页面

1. 在 `src/pages/` 创建新组件
2. 在 `src/router/index.tsx` 添加路由
3. 在导航栏添加链接

### 添加新主题

1. 在 `src/styles/themes.css` 定义 CSS 变量
2. 在 `src/components/ThemeSwitcher/ThemeSwitcher.tsx` 添加主题选项

### 添加新组件

使用项目提供的组件模板:

```typescript
// src/components/YourComponent/index.tsx
import type { ReactNode } from 'react';

export interface YourComponentProps {
  children?: ReactNode;
}

export function YourComponent({ children }: YourComponentProps) {
  return <div>{children}</div>;
}
```

## 📊 性能优化

项目已实施多项性能优化:

- ✅ **代码分割**: React.lazy() 按路由分割
- ✅ **图片优化**: vite-plugin-imagemin 自动压缩
- ✅ **懒加载**: IntersectionObserver 实现图片懒加载
- ✅ **骨架屏**: Skeleton 组件提升加载体验
- ✅ **缓存策略**: Service Worker 待配置
- ✅ **构建优化**: Manual chunks 分包策略

### 性能目标

- FCP (First Contentful Paint) < 2s
- LCP (Largest Contentful Paint) < 2.5s
- TTI (Time to Interactive) < 3s
- Lighthouse Score > 90

## 🧪 测试

```bash
# 运行 ESLint
npm run lint

# 类型检查
npx tsc -b

# 构建
npm run build
```

## 📝 License

MIT License

## 👨‍💻 作者

深山有密林 团队

## 🙏 致谢

- [lunar-javascript](https://github.com/6tail/lunar-javascript) - 农历和八字计算库
- [Recharts](https://recharts.org/) - React 图表库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [ESA Pages](https://www.aliyun.com/product/esa-pages) - 阿里云边缘页面服务

---

**阿里云 ESA Pages 边缘开发竞赛参赛作品**
