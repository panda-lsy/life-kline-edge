# PDF 生成模块架构设计文档

> **项目**: Life K-line Edge
> **模块**: PDF 导出功能
> **版本**: 2.0 (重构版)
> **设计日期**: 2026-01-11
> **作者**: AI Architect

---

## 目录

1. [架构概览](#1-架构概览)
2. [模块设计](#2-模块设计)
3. [接口定义](#3-接口定义)
4. [数据流设计](#4-数据流设计)
5. [类图设计](#5-类图设计)
6. [关键算法](#6-关键算法)
7. [错误处理](#7-错误处理)
8. [性能优化策略](#8-性能优化策略)

---

## 1. 架构概览

### 1.1 设计原则

本架构遵循以下核心原则：

| 原则 | 应用说明 |
|------|----------|
| **SOLID** | 每个模块职责单一、接口开放封闭、子类型可替换、接口隔离、依赖倒置 |
| **DRY** | 复用代码，避免重复（样式、布局、组件） |
| **KISS** | 保持简单，避免过度设计 |
| **关注点分离** | 渲染逻辑与业务逻辑分离、样式与内容分离 |

### 1.2 架构分层

```
┌─────────────────────────────────────────────────────────┐
│                     用户接口层                           │
│            generatePDFReport(), downloadPDFReport()     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    编排层 (Orchestration)                │
│              PDFOrchestrator (协调器)                    │
│    - 管理渲染队列                                        │
│    - 分发渲染任务                                        │
│    - 聚合渲染结果                                        │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
┌────────▼──┐  ┌───▼────┐  ┌──▼─────────┐
│ 渲染器层   │  │ 布局层  │  │ 样式系统   │
│ (Renderers)│  │(Layout) │  │ (Styles)   │
└────────────┘  └────────┘  └────────────┘
         │
┌────────▼───────────────────────────────────────────┐
│                   核心服务层                        │
│  - PaginationEngine (分页引擎)                      │
│  - CanvasRenderer (Canvas渲染器)                    │
│  - SVGGenerator (SVG生成器)                         │
│  - CacheManager (缓存管理器)                        │
└────────────────────────────────────────────────────┘
         │
┌────────▼───────────────────────────────────────────┐
│                   工具层                            │
│  - DOMUtils (DOM工具)                               │
│  - MathUtils (数学工具)                              │
│  - HashUtils (哈希工具)                              │
└────────────────────────────────────────────────────┘
```

### 1.3 目录结构

```
src/components/ExportPDF/
├── index.ts                      # 主入口，导出公共API
├── types/                        # 类型定义
│   ├── index.ts                  # 导出所有类型
│   ├── renderer.ts               # 渲染器类型
│   ├── layout.ts                 # 布局类型
│   └── config.ts                 # 配置类型
│
├── core/                         # 核心服务
│   ├── orchestrator.ts           # 主协调器
│   ├── pagination.ts             # 分页引擎
│   ├── canvasRenderer.ts         # Canvas渲染器
│   ├── cache.ts                  # 缓存管理器
│   └── errorLogger.ts            # 错误日志
│
├── renderers/                    # 渲染器
│   ├── BasePageRenderer.ts       # 抽象基类
│   ├── CoverPageRenderer.ts      # 封面页
│   ├── TableOfContentsRenderer.ts # 目录页
│   ├── BaziPageRenderer.ts       # 八字排盘页
│   ├── FiveElementsPageRenderer.ts # 五行关系页
│   ├── KLinePageRenderer.ts      # K线图页
│   ├── DimensionsPageRenderer.ts # 六维度分析页
│   ├── LuckyItemsPageRenderer.ts # 开运指南页
│   ├── DaYunPageRenderer.ts      # 大运流年页（支持年龄段）
│   └── AdvicePageRenderer.ts     # 综合建议页
│
├── layout/                       # 布局系统
│   ├── LayoutEngine.ts           # 布局引擎
│   ├── FlowLayout.ts             # 流式布局
│   ├── FlexLayout.ts             # 弹性布局
│   └── GridLayout.ts             # 网格布局
│
├── styles/                       # 样式系统
│   ├── StyleSheet.ts             # 样式表
│   ├── ThemeManager.ts           # 主题管理器
│   └── themes/                   # 主题定义
│       ├── chinese.ts            # 中国风
│       ├── cyberpunk.ts          # 赛博朋克
│       └── minimal.ts            # 极简
│
├── svg/                          # SVG生成器
│   ├── KLineChartGenerator.ts    # K线图生成器
│   ├── FiveElementsChartGenerator.ts # 五行图生成器
│   └── ProgressBarGenerator.ts   # 进度条生成器
│
└── utils/                        # 工具函数
    ├── dom.ts                    # DOM工具
    ├── math.ts                   # 数学工具
    ├── hash.ts                   # 哈希工具
    └── logger.ts                 # 日志工具
```

---

## 2. 模块设计

### 2.1 核心协调器 (Orchestrator)

**职责**:
- 管理PDF生成整个生命周期
- 协调各个页面渲染器
- 管理渲染队列和进度
- 聚合最终PDF文档

**接口**:
```typescript
interface IPDFOrchestrator {
  generatePDF(options: GeneratePDFOptions): Promise<Blob>;
  getProgress(): PDFProgress;
  cancel(): void;
}

interface PDFProgress {
  current: number;      // 当前页码
  total: number;        // 总页数
  stage: string;        // 当前阶段
  percentage: number;   // 百分比
}
```

**关键方法**:
```typescript
class PDFOrchestrator implements IPDFOrchestrator {
  async generatePDF(options: GeneratePDFOptions): Promise<Blob> {
    // 1. 初始化
    this.initialize(options);

    // 2. 创建渲染器
    const renderers = this.createRenderers(options);

    // 3. 执行渲染（支持并行）
    const pages = await this.renderPages(renderers, options);

    // 4. 合并PDF
    const pdf = this.mergePages(pages);

    return pdf;
  }

  private async renderPages(
    renderers: PageRenderer[],
    options: GeneratePDFOptions
  ): Promise<PDFPage[]> {
    // 并行渲染页面
    const promises = renderers.map((renderer, index) =>
      this.renderSinglePage(renderer, index + 1, options)
    );

    return Promise.all(promises);
  }
}
```

---

### 2.2 页面渲染器基类 (BasePageRenderer)

**职责**:
- 定义页面渲染的通用接口
- 提供页面渲染的生命周期钩子
- 实现通用的页面功能（页码、水印等）

**接口**:
```typescript
interface IPageRenderer {
  render(): Promise<PDFPage>;
  getContent(): HTMLElement;
  validate(): boolean;
}

interface PDFPage {
  content: HTMLElement;     // 页面内容
  metadata: PageMetadata;   // 页面元数据
}

interface PageMetadata {
  pageNumber: number;
  title: string;
  type: 'cover' | 'content' | 'toc' | 'appendix';
  height?: number;          // 内容高度
  needsPagination?: boolean; // 是否需要分页
}
```

**抽象类**:
```typescript
abstract class BasePageRenderer implements IPageRenderer {
  protected options: GeneratePDFOptions;
  protected styles: PDFStyles;
  protected theme: Theme;

  constructor(options: GeneratePDFOptions) {
    this.options = options;
    this.styles = StyleSheet.getThemeStyles(options.themeName);
    this.theme = ThemeManager.getTheme(options.themeName);
  }

  // 生命周期钩子
  protected async beforeRender(): Promise<void> {
    // 渲染前处理
  }

  abstract renderContent(): HTMLElement;  // 子类实现

  protected async afterRender(element: HTMLElement): Promise<HTMLElement> {
    // 渲染后处理
    this.addPageNumber(element);
    this.addWatermark(element);
    return element;
  }

  // 主渲染方法
  async render(): Promise<PDFPage> {
    await this.beforeRender();

    const content = this.renderContent();
    const processed = await this.afterRender(content);

    const metadata = this.getMetadata();

    return { content: processed, metadata };
  }

  // 通用方法
  protected addPageNumber(element: HTMLElement): void {
    const pageNum = this.createPageNumber();
    element.appendChild(pageNum);
  }

  protected addWatermark(element: HTMLElement): void {
    const watermark = this.createWatermark();
    element.appendChild(watermark);
  }

  protected createPageNumber(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'pdf-page-number';
    div.textContent = `第 ${this.metadata.pageNumber} 页`;
    Object.assign(div.style, this.styles.pageNumber);
    return div;
  }

  protected createWatermark(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'pdf-watermark';
    div.textContent = '由阿里云 ESA 提供加速';
    Object.assign(div.style, this.styles.watermark);
    return div;
  }

  abstract getMetadata(): PageMetadata;
}
```

---

### 2.3 分页引擎 (PaginationEngine)

**职责**:
- 检测内容是否溢出
- 识别可分页断点
- 执行智能分页

**接口**:
```typescript
interface IPaginationEngine {
  measure(element: HTMLElement): MeasurementResult;
  findBreakPoints(content: HTMLElement): PageBreak[];
  paginate(content: HTMLElement, maxHeight: number): HTMLElement[];
}

interface MeasurementResult {
  height: number;        // 实际高度 (mm)
  width: number;         // 实际宽度 (mm)
  overflows: boolean;    // 是否溢出
  overflowAmount: number; // 溢出量 (mm)
}

interface PageBreak {
  position: number;      // 断点位置 (mm)
  type: BreakType;
  element: HTMLElement;  // 断点处的元素
}

type BreakType =
  | 'paragraph'     // 段落之间
  | 'table-row'     // 表格行之间
  | 'section'       // 章节之间
  | 'forced';       // 强制分页
```

**实现**:
```typescript
class PaginationEngine implements IPaginationEngine {
  private readonly PAGE_HEIGHT = 297;  // A4高度 (mm)
  private readonly PAGE_WIDTH = 210;   // A4宽度 (mm)
  private readonly SAFETY_MARGIN = 10; // 安全边距 (mm)

  measure(element: HTMLElement): MeasurementResult {
    // 1. 创建测量容器
    const container = this.createMeasurementContainer();
    container.appendChild(element);

    // 2. 附加到DOM以获取实际尺寸
    document.body.appendChild(container);

    // 3. 测量高度
    const rect = element.getBoundingClientRect();
    const heightMm = this.pxToMm(rect.height);

    // 4. 清理
    document.body.removeChild(container);

    return {
      height: heightMm,
      width: this.pxToMm(rect.width),
      overflows: heightMm > this.PAGE_HEIGHT,
      overflowAmount: Math.max(0, heightMm - this.PAGE_HEIGHT)
    };
  }

  findBreakPoints(content: HTMLElement): PageBreak[] {
    const breaks: PageBreak[] = [];
    let currentY = 0;

    // 遍历所有子元素
    const children = Array.from(content.children);
    for (const child of children) {
      const rect = child.getBoundingClientRect();
      const childHeight = this.pxToMm(rect.height);

      // 检查是否是合适的分页点
      if (this.isBreakableElement(child)) {
        breaks.push({
          position: currentY,
          type: this.getBreakType(child),
          element: child
        });
      }

      currentY += childHeight;
    }

    return breaks;
  }

  paginate(content: HTMLElement, maxHeight: number): HTMLElement[] {
    const pages: HTMLElement[] = [];
    const breaks = this.findBreakPoints(content);

    let currentPage = this.createPageContainer();
    let currentPageHeight = 0;

    const children = Array.from(content.children);

    for (const child of children) {
      const childHeight = this.pxToMm(child.getBoundingClientRect().height);

      // 检查添加此元素后是否溢出
      if (currentPageHeight + childHeight > maxHeight - this.SAFETY_MARGIN) {
        // 当前页已满，保存并创建新页
        pages.push(currentPage);
        currentPage = this.createPageContainer();
        currentPageHeight = 0;
      }

      // 将元素添加到当前页
      currentPage.appendChild(child.cloneNode(true));
      currentPageHeight += childHeight;
    }

    // 添加最后一页
    if (currentPage.children.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }

  private isBreakableElement(element: HTMLElement): boolean {
    // 段落、标题、表格、图表等都是可分页的
    const breakableTags = ['P', 'H1', 'H2', 'H3', 'TABLE', 'FIGURE', 'SECTION'];
    return breakableTags.includes(element.tagName);
  }

  private getBreakType(element: HTMLElement): BreakType {
    const tag = element.tagName;
    if (tag === 'P') return 'paragraph';
    if (tag === 'TABLE') return 'table-row';
    if (tag === 'SECTION') return 'section';
    return 'forced';
  }

  private pxToMm(px: number): number {
    return px * 0.264583;  // 1px = 0.264583mm
  }

  private createPageContainer(): HTMLElement {
    const div = document.createElement('div');
    div.style.width = `${this.PAGE_WIDTH}mm`;
    div.style.minHeight = `${this.PAGE_HEIGHT}mm`;
    return div;
  }

  private createMeasurementContainer(): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.width = `${this.PAGE_WIDTH}mm`;
    return div;
  }
}
```

---

### 2.4 布局引擎 (LayoutEngine)

**职责**:
- 实现各种布局模式
- 计算元素位置和尺寸
- 响应式布局调整

**接口**:
```typescript
interface ILayoutEngine {
  applyFlowLayout(container: HTMLElement, options: FlowOptions): void;
  applyFlexLayout(container: HTMLElement, options: FlexOptions): void;
  applyGridLayout(container: HTMLElement, options: GridOptions): void;
}

interface FlowOptions {
  spacing: number;       // 元素间距 (mm)
  align: 'left' | 'center' | 'right';
}

interface FlexOptions {
  direction: 'row' | 'column';
  justify: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  align: 'flex-start' | 'center' | 'flex-end';
  gap: number;           // 间隙 (mm)
}

interface GridOptions {
  columns: number;
  rows?: number;
  gap: number;           // 间隙 (mm)
}
```

**实现**:
```typescript
class LayoutEngine implements ILayoutEngine {
  applyFlowLayout(container: HTMLElement, options: FlowOptions): void {
    const children = Array.from(container.children);

    children.forEach((child, index) => {
      const element = child as HTMLElement;
      element.style.display = 'block';
      element.style.marginBottom = `${options.spacing}mm`;
      element.style.textAlign = options.align;

      // 最后一个元素不需要下边距
      if (index === children.length - 1) {
        element.style.marginBottom = '0';
      }
    });
  }

  applyFlexLayout(container: HTMLElement, options: FlexOptions): void {
    // 使用CSS Flexbox布局
    container.style.display = 'flex';
    container.style.flexDirection = options.direction;
    container.style.justifyContent = options.justify;
    container.style.alignItems = options.align;
    container.style.gap = `${options.gap}mm`;
  }

  applyGridLayout(container: HTMLElement, options: GridOptions): void {
    const children = Array.from(container.children);
    const columnWidth = `calc((100% - ${options.gap * (options.columns - 1)}mm) / ${options.columns})`;

    children.forEach((child) => {
      const element = child as HTMLElement;
      element.style.width = columnWidth;
      element.style.display = 'inline-block';
      element.style.verticalAlign = 'top';
    });
  }

  // 计算响应式尺寸
  calculateResponsiveSize(
    availableWidth: number,
    elementCount: number,
    gap: number
  ): number {
    const totalGap = gap * (elementCount - 1);
    return (availableWidth - totalGap) / elementCount;
  }
}
```

---

### 2.5 样式系统 (StyleSheet)

**职责**:
- 定义主题样式
- 管理样式继承
- 提供样式工具函数

**类型定义**:
```typescript
interface PDFStyles {
  // 页面样式
  page: PageStyles;
  // 排版样式
  typography: TypographyStyles;
  // 颜色
  colors: ColorPalette;
  // 组件样式
  components: ComponentStyles;
}

interface PageStyles {
  width: string;
  height: string;
  padding: string;
  backgroundColor: string;
  fontFamily: string;
}

interface TypographyStyles {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  body: TextStyle;
  caption: TextStyle;
}

interface TextStyle {
  fontSize: string;
  fontWeight: string;
  color: string;
  lineHeight: string;
  marginBottom?: string;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

interface ComponentStyles {
  button: ButtonStyles;
  card: CardStyles;
  table: TableStyles;
  badge: BadgeStyles;
}
```

**实现**:
```typescript
class StyleSheet {
  private static themes: Record<string, PDFStyles> = {};

  static initialize(): void {
    this.registerTheme('chinese', ChineseTheme);
    this.registerTheme('cyberpunk', CyberpunkTheme);
    this.registerTheme('minimal', MinimalTheme);
  }

  static registerTheme(name: string, styles: PDFStyles): void {
    this.themes[name] = styles;
  }

  static getThemeStyles(themeName: string): PDFStyles {
    return this.themes[themeName] || this.themes['chinese'];
  }

  static applyStyles(element: HTMLElement, styles: Partial<PDFStyles>): void {
    Object.assign(element.style, styles);
  }

  // 工具函数：创建带样式的元素
  static createStyledElement(
    tag: string,
    styleClass: keyof PDFStyles,
    themeName: string
  ): HTMLElement {
    const element = document.createElement(tag);
    const styles = this.getThemeStyles(themeName);
    Object.assign(element.style, styles[styleClass]);
    return element;
  }
}

// 主题定义示例
const ChineseTheme: PDFStyles = {
  page: {
    width: '210mm',
    height: '297mm',
    padding: '20mm',
    backgroundColor: '#FFFFFF',
    fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif"
  },
  typography: {
    h1: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333333',
      lineHeight: '1.4',
      marginBottom: '10mm'
    },
    h2: {
      fontSize: '20px',
      fontWeight: 'semibold',
      color: '#333333',
      lineHeight: '1.4',
      marginBottom: '5mm'
    },
    body: {
      fontSize: '13px',
      fontWeight: 'normal',
      color: '#555555',
      lineHeight: '1.6'
    }
  },
  colors: {
    primary: '#C8102E',
    secondary: '#FFD700',
    background: '#FEF7F0',
    text: '#333333',
    border: '#E5E7EB',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444'
  },
  components: {
    button: {
      padding: '4mm 8mm',
      borderRadius: '4px',
      backgroundColor: '#C8102E',
      color: '#FFFFFF',
      fontWeight: 'semibold'
    },
    card: {
      padding: '5mm',
      borderRadius: '8px',
      backgroundColor: '#FAFAFA',
      border: '1px solid #E5E7EB'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '12px'
    },
    badge: {
      padding: '2mm 4mm',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'semibold'
    }
  }
};
```

---

### 2.6 SVG 生成器 (SVGGenerator)

**职责**:
- 生成高质量的SVG图表
- 适配不同主题和DPI
- 优化SVG性能

**K线图生成器接口**:
```typescript
interface IKLineChartGenerator {
  generate(options: KLineChartOptions): string;  // 返回SVG字符串
}

interface KLineChartOptions {
  data: KLineData[];
  width: number;        // mm
  height: number;       // mm
  theme: {
    upColor: string;
    downColor: string;
    backgroundColor: string;
  };
  dpi?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}
```

**实现**:
```typescript
class KLineChartGenerator implements IKLineChartGenerator {
  generate(options: KLineChartOptions): string {
    const {
      data,
      width,
      height,
      theme,
      dpi = 96,
      showGrid = true,
      showLegend = true
    } = options;

    // 1. 计算布局
    const padding = { top: 15, right: 15, bottom: 25, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 2. 计算数据范围
    const allValues = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minValue = Math.floor(Math.min(...allValues));
    const maxValue = Math.ceil(Math.max(...allValues));
    const range = maxValue - minValue || 1;

    // 3. 计算K线宽度（自适应）
    const candleWidth = this.calculateCandleWidth(data.length, chartWidth);
    const candleGap = (chartWidth / data.length) * 0.3;

    // 4. 生成SVG内容
    const svgElements: string[] = [];

    // 背景和网格
    svgElements.push(this.createBackground(width, height, theme.backgroundColor));
    if (showGrid) {
      svgElements.push(this.createGrid(padding, chartWidth, chartHeight));
    }

    // K线
    svgElements.push(this.createCandlesticks(
      data,
      padding,
      chartHeight,
      minValue,
      range,
      candleWidth,
      candleGap,
      theme
    ));

    // 坐标轴
    svgElements.push(this.createAxes(data, padding, chartWidth, chartHeight, minValue, range));

    // 图例
    if (showLegend) {
      svgElements.push(this.createLegend(padding.top, width, theme));
    }

    // 5. 组装SVG
    return this.assembleSVG(width, height, svgElements, dpi);
  }

  private calculateCandleWidth(dataLength: number, chartWidth: number): number {
    const minWidth = 8;
    const maxWidth = 25;
    const gapRatio = 0.3;

    const availableWidth = chartWidth * (1 - gapRatio);
    const idealWidth = availableWidth / dataLength;

    return Math.max(minWidth, Math.min(maxWidth, idealWidth));
  }

  private createCandlesticks(
    data: KLineData[],
    padding: Padding,
    chartHeight: number,
    minValue: number,
    range: number,
    candleWidth: number,
    candleGap: number,
    theme: KLineTheme
  ): string {
    const elements: string[] = [];

    data.forEach((item, index) => {
      const x = padding.left + index * (candleWidth + candleGap) + candleGap / 2;
      const isUp = item.close >= item.open;
      const color = isUp ? theme.upColor : theme.downColor;

      // 计算Y坐标
      const openY = padding.top + chartHeight - ((item.open - minValue) / range) * chartHeight;
      const closeY = padding.top + chartHeight - ((item.close - minValue) / range) * chartHeight;
      const highY = padding.top + chartHeight - ((item.high - minValue) / range) * chartHeight;
      const lowY = padding.top + chartHeight - ((item.low - minValue) / range) * chartHeight;

      // 绘制影线
      elements.push(`<line x1="${x.toFixed(1)}" y1="${highY.toFixed(1)}" x2="${x.toFixed(1)}" y2="${lowY.toFixed(1)}" stroke="${color}" stroke-width="1.5"/>`);

      // 绘制实体
      if (Math.abs(openY - closeY) >= 1) {
        const rectY = Math.min(openY, closeY);
        const rectHeight = Math.max(1, Math.abs(closeY - openY));
        elements.push(`<rect x="${(x - candleWidth / 2).toFixed(1)}" y="${rectY.toFixed(1)}" width="${candleWidth.toFixed(1)}" height="${rectHeight.toFixed(1)}" fill="${color}"/>`);
      } else {
        // 十字星
        elements.push(`<line x1="${(x - candleWidth / 2).toFixed(1)}" y1="${openY.toFixed(1)}" x2="${(x + candleWidth / 2).toFixed(1)}" y2="${closeY.toFixed(1)}" stroke="${color}" stroke-width="1.5"/>`);
      }
    });

    return `<g id="candlesticks">${elements.join('')}</g>`;
  }

  private createAxes(
    data: KLineData[],
    padding: Padding,
    chartWidth: number,
    chartHeight: number,
    minValue: number,
    range: number
  ): string {
    const elements: string[] = [];

    // Y轴刻度
    const yTicks = this.calculateSmartTicks(minValue, range, 5);
    yTicks.forEach(tick => {
      const y = padding.top + chartHeight - ((tick - minValue) / range) * chartHeight;
      elements.push(`<line x1="${padding.left}" y1="${y.toFixed(1)}" x2="${padding.left + 5}" y2="${y.toFixed(1)}" stroke="#999" stroke-width="0.5"/>`);
      elements.push(`<text x="${padding.left - 8}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="#666">${tick.toFixed(0)}</text>`);
    });

    // X轴刻度
    const xTickInterval = Math.max(1, Math.ceil(data.length / 6));
    data.forEach((item, index) => {
      if (index % xTickInterval === 0) {
        const x = padding.left + index * ((chartWidth / data.length) * 1.3) + ((chartWidth / data.length) * 0.3) / 2;
        elements.push(`<line x1="${x.toFixed(1)}" y1="${(chartHeight + padding.top).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(chartHeight + padding.top + 5).toFixed(1)}" stroke="#999" stroke-width="0.5"/>`);
        elements.push(`<text x="${x.toFixed(1)}" y="${(chartHeight + padding.top + 16).toFixed(1)}" text-anchor="middle" font-size="9" fill="#666">${item.year}</text>`);
      }
    });

    return `<g id="axes">${elements.join('')}</g>`;
  }

  private calculateSmartTicks(min: number, range: number, targetTickCount: number): number[] {
    const step = Math.pow(10, Math.floor(Math.log10(range / targetTickCount)));
    const tickCount = Math.ceil(range / step);

    const ticks: number[] = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(min + i * step);
    }

    return ticks;
  }

  private assembleSVG(width: number, height: number, elements: string[], dpi: number): string {
    const scale = dpi / 96;

    return `
<svg width="${width}mm" height="${height}mm"
     viewBox="0 0 ${width * scale} ${height * scale}"
     xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      text { font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', Arial, sans-serif; }
    </style>
  </defs>
  ${elements.join('')}
</svg>
    `.trim();
  }
}
```

---

### 2.7 缓存管理器 (CacheManager)

**职责**:
- 缓存渲染结果
- 管理缓存生命周期
- 提供缓存统计

**接口**:
```typescript
interface ICacheManager {
  get(key: string): HTMLCanvasElement | null;
  set(key: string, value: HTMLCanvasElement): void;
  has(key: string): boolean;
  clear(): void;
  getStats(): CacheStats;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}
```

**LRU缓存实现**:
```typescript
class CacheManager implements ICacheManager {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private stats: CacheStats;

  constructor(maxSize: number = 10) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.stats = { size: 0, hits: 0, misses: 0, hitRate: 0 };
  }

  get(key: string): HTMLCanvasElement | null {
    const entry = this.cache.get(key);

    if (entry) {
      // 更新访问时间（LRU）
      entry.lastAccess = Date.now();
      this.stats.hits++;
      this.updateHitRate();
      return entry.value;
    }

    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  set(key: string, value: HTMLCanvasElement): void {
    // 检查是否超过最大容量
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      lastAccess: Date.now()
    });

    this.stats.size = this.cache.size;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { size: 0, hits: 0, misses: 0, hitRate: 0 };
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

interface CacheEntry {
  value: HTMLCanvasElement;
  createdAt: number;
  lastAccess: number;
}
```

---

## 3. 接口定义

### 3.1 公共API

**主入口** ([index.ts](src/components/ExportPDF/index.ts)):
```typescript
/**
 * 生成PDF报告
 * @param options 生成配置
 * @returns PDF Blob对象
 */
export async function generatePDFReport(
  options: GeneratePDFOptions
): Promise<Blob>;

/**
 * 生成并下载PDF报告
 * @param options 生成配置
 * @param filename 文件名（不含扩展名）
 */
export async function downloadPDFReport(
  options: GeneratePDFOptions,
  filename?: string
): Promise<void>;

/**
 * 获取PDF生成进度
 */
export function getPDFProgress(): PDFProgress;

/**
 * 取消PDF生成
 */
export function cancelPDFGeneration(): void;
```

### 3.2 类型定义

**核心类型** ([types/index.ts](src/components/ExportPDF/types/index.ts)):
```typescript
export interface GeneratePDFOptions {
  // 用户数据
  name: string;
  birthDate: string;
  birthTime: string;
  baziData: BaziResult;
  dimensionsData: SixDimensions;
  klineData: KLineData[];

  // 配置
  themeName?: ThemeName;
  pageSize?: PageSize;
  orientation?: PageOrientation;

  // 回调
  onProgress?: (progress: number, stage: string) => void;
  onError?: (error: PDFError) => void;
}

export type ThemeName = 'chinese' | 'cyberpunk' | 'minimal';
export type PageSize = 'A4' | 'A3' | 'Letter';
export type PageOrientation = 'portrait' | 'landscape';

export interface PDFError {
  code: ErrorCode;
  message: string;
  stage: string;
  details?: unknown;
}

export type ErrorCode =
  | 'INIT_ERROR'
  | 'RENDER_ERROR'
  | 'CANVAS_ERROR'
  | 'PDF_GENERATION_ERROR'
  | 'CACHE_ERROR';
```

---

## 4. 数据流设计

### 4.1 整体数据流

```
用户数据 (BaziResult, KLineData, etc.)
    │
    ▼
┌─────────────────┐
│ PDFOrchestrator │ 初始化
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  创建渲染器      │ BasePageRenderer x9
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  并行渲染       │ Promise.all()
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│DOM内容  │ │分页检测  │
└────┬───┘ └─────┬────┘
     │           │
     ▼           ▼
┌─────────────────┐
│  Canvas转换     │ html2canvas
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PDF合并       │ jsPDF
└────────┬────────┘
         │
         ▼
    PDF Blob
```

### 4.2 页面渲染流程

```
BasePageRenderer.render()
    │
    ▼
beforeRender()
    │
    ▼
renderContent()
    │
    ├─► 创建DOM元素
    ├─► 应用样式
    └─► 添加内容
    │
    ▼
afterRender()
    │
    ├─► 添加页码
    └─► 添加水印
    │
    ▼
PDFPage { content, metadata }
```

---

## 5. 类图设计

### 5.1 核心类关系

```
┌──────────────────────┐
│   PDFOrchestrator    │
├──────────────────────┤
│ + generatePDF()      │
│ + getProgress()      │
│ + cancel()           │
└──────────┬───────────┘
           │
           │ 使用
           ▼
┌──────────────────────┐
│  BasePageRenderer    │◄──────────────┐
│ <<abstract>>         │               │
├──────────────────────┤               │
│ # options            │               │
│ # styles             │               │
│ + render()           │               │
│ + getContent()       │               │
│ # beforeRender()     │               │
│ # afterRender()      │               │
└──────────┬───────────┘               │
           │                           │
           │ 继承                      │
    ┌──────┴──────┬─────────┬─────────┤
    ▼             ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Cover   │ │ TableOf │ │ Bazi    │ │ KLine   │
│ Renderer│ │Contents │ │ Renderer│ │ Renderer│
└─────────┘ └─────────┘ └─────────┘ └─────────┘
    ...         ...         ...         ...
```

### 5.2 服务类关系

```
┌──────────────────────┐       ┌──────────────────────┐
│ PaginationEngine     │       │  LayoutEngine        │
├──────────────────────┤       ├──────────────────────┤
│ + measure()          │       │ + applyFlowLayout()  │
│ + findBreakPoints()  │       │ + applyFlexLayout()  │
│ + paginate()         │       │ + applyGridLayout()  │
└──────────────────────┘       └──────────────────────┘
           ▲                             ▲
           │                             │
           │ 使用                        │ 使用
┌──────────┴─────────────────────────────┴──────────┐
│              BasePageRenderer                   │
└─────────────────────────────────────────────────┘
```

---

## 6. 关键算法

### 6.1 智能分页算法

**伪代码**:
```
FUNCTION paginate(content, maxHeight):
  pages = []
  currentPage = createPage()
  currentHeight = 0
  breaks = findBreakPoints(content)

  FOR EACH element IN content.children:
    elementHeight = measure(element)

    IF currentHeight + elementHeight > maxHeight - safetyMargin:
      # 查找最近的分页点
      breakPoint = findNearestBreak(breaks, currentHeight)

      IF breakPoint exists AND breakPoint.position < currentHeight + elementHeight:
        # 在分页点处分割
        splitAt(content, breakPoint)
        pages.append(currentPage)
        currentPage = createPage()
        currentHeight = 0
      ELSE:
        # 强制分页（元素不可分割）
        IF currentHeight > 0:
          pages.append(currentPage)
          currentPage = createPage()
          currentHeight = 0

    currentPage.appendChild(element)
    currentHeight += elementHeight

  pages.append(currentPage)
  RETURN pages
```

**复杂度分析**:
- 时间复杂度: O(n)，其中 n 为元素数量
- 空间复杂度: O(m)，其中 m 为页数

### 6.2 K线宽度自适应算法

**伪代码**:
```
FUNCTION calculateCandleWidth(dataLength, chartWidth):
  minWidth = 8
  maxWidth = 25
  gapRatio = 0.3

  availableWidth = chartWidth * (1 - gapRatio)
  idealWidth = availableWidth / dataLength

  RETURN clamp(idealWidth, minWidth, maxWidth)

FUNCTION clamp(value, min, max):
  IF value < min: RETURN min
  IF value > max: RETURN max
  RETURN value
```

### 6.3 智能坐标轴刻度算法

**伪代码**:
```
FUNCTION calculateSmartTicks(min, range, targetCount):
  # 计算合适的步长
  rawStep = range / targetCount
  magnitude = POWER(10, FLOOR(LOG10(rawStep)))
  normalizedStep = rawStep / magnitude

  # 规范化到标准刻度 (1, 2, 5, 10)
  IF normalizedStep < 1.5: step = 1 * magnitude
  ELSE IF normalizedStep < 3: step = 2 * magnitude
  ELSE IF normalizedStep < 7: step = 5 * magnitude
  ELSE: step = 10 * magnitude

  # 生成刻度
  ticks = []
  tickCount = CEIL(range / step)
  FOR i FROM 0 TO tickCount:
    ticks.append(min + i * step)

  RETURN ticks
```

---

## 7. 错误处理

### 7.1 错误分类

```typescript
enum ErrorStage {
  INITIALIZATION = 'initialization',
  RENDERING = 'rendering',
  CANVAS_CONVERSION = 'canvas_conversion',
  PDF_GENERATION = 'pdf_generation',
  CACHE = 'cache'
}

class PDFGenerationError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public stage: ErrorStage,
    public originalError?: Error,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PDFGenerationError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      stage: this.stage,
      context: this.context,
      stack: this.stack
    };
  }
}
```

### 7.2 错误处理策略

```typescript
class ErrorHandler {
  static handle(error: unknown, context: ErrorContext): void {
    if (error instanceof PDFGenerationError) {
      // 已知错误，记录并通知
      Logger.error('PDF generation error', error.toJSON());
      context.onError?.(error);
    } else if (error instanceof Error) {
      // 未知错误，包装为PDF错误
      const pdfError = new PDFGenerationError(
        error.message,
        'UNKNOWN_ERROR',
        context.stage,
        error
      );
      Logger.error('Unexpected error', pdfError.toJSON());
      context.onError?.(pdfError);
    } else {
      // 非Error对象
      const pdfError = new PDFGenerationError(
        String(error),
        'UNKNOWN_ERROR',
        context.stage
      );
      Logger.error('Unknown error type', pdfError.toJSON());
      context.onError?.(pdfError);
    }
  }

  static wrap<T>(
    fn: () => T,
    context: ErrorContext
  ): T | never {
    try {
      return fn();
    } catch (error) {
      this.handle(error, context);
      throw error; // 重新抛出以停止执行
    }
  }
}
```

---

## 8. 性能优化策略

### 8.1 并行渲染

**使用 Promise.all 并行渲染页面**:
```typescript
async function renderPagesInParallel(
  renderers: PageRenderer[],
  onProgress: (progress: number) => void
): Promise<PDFPage[]> {
  const total = renderers.length;
  let completed = 0;

  const renderPromises = renderers.map(async (renderer) => {
    const page = await renderer.render();
    completed++;
    onProgress((completed / total) * 100);
    return page;
  });

  return Promise.all(renderPromises);
}
```

### 8.2 缓存策略

**基于内容哈希的缓存键**:
```typescript
function generateCacheKey(content: HTMLElement): string {
  const html = content.outerHTML;
  return simpleHash(html);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return hash.toString(36);
}
```

### 8.3 DOM 优化

**使用文档片段减少重排**:
```typescript
function createPageContentOptimized(): HTMLElement {
  const fragment = document.createDocumentFragment();

  // 在片段中构建内容（不触发重排）
  const header = createElement('header');
  const content = createElement('main');
  const footer = createElement('footer');

  fragment.appendChild(header);
  fragment.appendChild(content);
  fragment.appendChild(footer);

  // 一次性插入DOM
  const container = createElement('div');
  container.appendChild(fragment);

  return container;
}
```

---

## 9. 测试策略

### 9.1 单元测试

**测试覆盖**:
- 分页算法边界情况
- 布局引擎各种模式
- SVG生成器不同数据量
- 缓存机制命中/失效
- 错误处理各种异常

**示例**:
```typescript
describe('PaginationEngine', () => {
  it('should detect content overflow', () => {
    const element = createTestElement(300); // 300mm
    const result = engine.measure(element);
    expect(result.overflows).toBe(true);
    expect(result.overflowAmount).toBe(3);
  });

  it('should not split table rows', () => {
    const table = createTableWithRows(5);
    const pages = engine.paginate(table, 297);

    // 验证表格行不被截断
    pages.forEach(page => {
      const rows = page.querySelectorAll('tr');
      const tableRow = rows[0]?.parentElement;
      expect(tableRow).toBeTruthy();

      const tableHeight = engine.pxToMm(tableRow!.getBoundingClientRect().height);
      expect(tableHeight).toBeLessThanOrEqual(297);
    });
  });
});
```

### 9.2 集成测试

```typescript
describe('PDF Generation Integration', () => {
  it('should generate 11-page PDF', async () => {
    const options = createMockOptions();
    const blob = await generatePDFReport(options);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeLessThan(5 * 1024 * 1024); // < 5MB
  });

  it('should complete within 10 seconds', async () => {
    const options = createMockOptions();
    const start = Date.now();

    await generatePDFReport(options);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(10000);
  });
});
```

---

## 10. 实施路线图

### 阶段 1: 基础设施（1-2天）
- [ ] 创建目录结构
- [ ] 定义类型和接口
- [ ] 实现BasePageRenderer
- [ ] 实现StyleSheet

### 阶段 2: 核心服务（2-3天）
- [ ] 实现PaginationEngine
- [ ] 实现LayoutEngine
- [ ] 实现KLineChartGenerator
- [ ] 实现CacheManager

### 阶段 3: 渲染器（3-4天）
- [ ] 实现所有页面渲染器（9个）
- [ ] 测试每个渲染器

### 阶段 4: 编排和优化（1-2天）
- [ ] 实现PDFOrchestrator
- [ ] 实现并行渲染
- [ ] 性能优化

### 阶段 5: 测试和文档（2-3天）
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 完善文档

---

## 附录

### A. 术语表

| 术语 | 定义 |
|------|------|
| **分页点** | 内容中适合分页的位置（段落、章节等） |
| **分页断点** | 页面之间的分割位置 |
| **溢出** | 内容超过单页容量 |
| **K线** | 蜡烛图，显示开高低收数据 |

### B. 参考资料

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [SVG Specification](https://www.w3.org/TR/SVG/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**文档版本**: 1.0
**最后更新**: 2026-01-11
**维护者**: AI Architect
