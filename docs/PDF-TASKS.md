# PDF导出功能任务文档

## 阶段 1: 基础设施搭建

- [ ] 1.1 创建PDF导出模块目录结构
  - File: src/components/ExportPDF/
  - 创建目录: core/, renderers/, layout/, styles/, svg/, utils/, types/
  - Purpose: 建立清晰的模块化结构
  - _Leverage: 现有项目目录结构规范_
  - _Requirements: 需求文档 - 代码架构和模块化_
  - _Prompt: Role: Software Architect specializing in frontend project structure | Task: 创建PDF导出模块的完整目录结构,包括core、renderers、layout、styles、svg、utils、types子目录,每个目录下创建README.md说明其用途 | Restrictions: 必须遵循项目现有的目录命名规范,保持结构清晰和一致性 | Success: 所有目录创建完成,每个目录有清晰的README说明文档,结构符合模块化设计原则_

- [ ] 1.2 定义核心类型接口
  - File: src/components/ExportPDF/types/index.ts
  - 定义TypeScript接口: GeneratePDFOptions, PDFProgress, PDFError, PageMetadata, MeasurementResult, PageBreak
  - Purpose: 建立类型安全的基础
  - _Leverage: 现有的BaziResult, KLineData类型定义_
  - _Requirements: 需求文档 - 完整内容导出_
  - _Prompt: Role: TypeScript Developer specializing in type systems | Task: 创建完整的类型定义文件,包括PDF生成选项、进度、错误、元数据、测量结果、分页断点等所有核心接口,扩展现有的BaziResult和KLineData类型 | Restrictions: 必须使用TypeScript严格模式,所有接口必须有清晰的注释说明,保持类型的一致性和可扩展性 | Success: 所有类型定义完整,TypeScript编译无错误,类型注释清晰准确_

- [ ] 1.3 实现错误处理系统
  - File: src/components/ExportPDF/utils/errorHandler.ts
  - 创建PDFGenerationError类,定义错误码和错误阶段枚举
  - 实现错误包装和错误上下文记录
  - Purpose: 完善的错误处理机制
  - _Leverage: 现有的日志工具_
  - _Requirements: 需求文档 - Reliability_
  - _Prompt: Role: Error Handling Specialist | Task: 实现PDFGenerationError类,支持错误码(INIT_ERROR, RENDER_ERROR, CANVAS_ERROR, PDF_GENERATION_ERROR, CACHE_ERROR)和错误阶段(initialization, rendering, canvas_conversion, pdf_generation, cache),实现错误包装和上下文记录功能 | Restrictions: 必须保留原始错误堆栈,错误信息必须清晰可读,支持序列化为JSON | Success: 错误类实现完整,能够正确捕获和包装各种类型的错误,错误信息详细且可操作_

## 阶段 2: 核心服务层实现

- [ ] 2.1 实现样式系统
  - File: src/components/ExportPDF/styles/StyleSheet.ts
  - 定义PDFStyles接口,包含page, typography, colors, components
  - 实现三种主题: ChineseTheme, CyberpunkTheme, MinimalTheme
  - 创建ThemeManager管理主题切换
  - Purpose: 集中管理PDF样式,支持多主题
  - _Leverage: 现有应用的Tailwind主题配置_
  - _Requirements: 需求文档 - 多主题支持_
  - _Prompt: Role: Frontend Designer and CSS Specialist | Task: 实现完整的样式系统,定义PDFStyles接口,创建ChineseTheme(红金色系)、CyberpunkTheme(霓虹紫蓝色系)、MinimalTheme(黑白灰色系)三种主题,实现ThemeManager类进行主题管理,提供样式应用工具函数 | Restrictions: 样式必须使用毫米单位,字体必须支持中文,颜色配置必须符合各主题特色,提供样式复用机制 | Success: 三种主题实现完整,样式定义清晰,主题切换功能正常,样式应用工具函数可用_

- [ ] 2.2 实现分页引擎
  - File: src/components/ExportPDF/core/pagination.ts
  - 实现IPaginationEngine接口: measure, findBreakPoints, paginate
  - 实现智能分页算法: 测量内容高度,识别分页断点,执行分页
  - Purpose: 解决内容截断问题,实现智能分页
  - _Leverage: DOM API_
  - _Requirements: 需求文档 - 智能分页_
  - _Prompt: Role: Algorithm Engineer specializing in pagination | Task: 实现完整的分页引擎,包括measure函数(测量元素高度,检测溢出)、findBreakPoints函数(识别段落、表格、图表等分页断点)、paginate函数(执行智能分页,确保元素不被截断),处理A4纸张尺寸(210mm x 297mm)和安全边距 | Restrictions: 必须确保表格、图表等不可分割元素不被截断,必须在合适的断点处分页,使用pxToMm转换函数,支持不同页面尺寸 | Success: 分页算法正确,内容不会被截断,断点识别准确,分页结果合理_

- [ ] 2.3 实现布局引擎
  - File: src/components/ExportPDF/layout/LayoutEngine.ts
  - 实现ILayoutEngine接口: applyFlowLayout, applyFlexLayout, applyGridLayout
  - 支持流式布局、弹性布局、网格布局
  - Purpose: 提供灵活的布局能力
  - _Leverage: CSS Flexbox和Grid布局_
  - _Requirements: 需求文档 - Code Architecture_
  - _Prompt: Role: CSS Layout Specialist | Task: 实现完整的布局引擎,支持FlowLayout(垂直流式布局,支持左中右对齐)、FlexLayout(CSS Flexbox布局,支持方向、对齐方式、间距配置)、GridLayout(网格布局,支持列数、行数、间距配置),提供响应式尺寸计算函数 | Restrictions: 必须使用现代CSS布局特性,布局参数使用毫米单位,支持布局嵌套,提供清晰的布局配置接口 | Success: 三种布局模式实现完整,布局计算准确,支持响应式布局,API清晰易用_

- [ ] 2.4 实现缓存管理器
  - File: src/components/ExportPDF/core/cache.ts
  - 实现ICacheManager接口: get, set, has, clear, getStats
  - 实现LRU缓存策略
  - 实现基于内容哈希的缓存键生成
  - Purpose: 提高性能,避免重复渲染
  - _Leverage: JavaScript Map API_
  - _Requirements: 需求文档 - Performance_
  - _Prompt: Role: Performance Optimization Specialist | Task: 实现LRU缓存管理器,支持get/set/has/clear/getStats方法,实现LRU淘汰策略(最近最少使用),实现基于内容哈希的缓存键生成(simpleHash算法),提供缓存统计功能(命中率、未命中率、缓存大小) | Restrictions: 必须正确处理LRU淘汰,缓存键必须唯一,缓存值必须是HTMLCanvasElement,最大缓存大小可配置(默认10) | Success: 缓存机制工作正常,LRU淘汰策略正确,缓存统计准确,性能提升明显_

- [ ] 2.5 编写核心服务单元测试
  - File: src/components/ExportPDF/__tests__/core.test.ts
  - 测试分页引擎: 溢出检测、断点识别、分页算法
  - 测试布局引擎: 三种布局模式
  - 测试缓存管理器: LRU策略、命中率
  - Purpose: 确保核心服务的可靠性
  - _Leverage: Vitest测试框架, happy-dom_
  - _Requirements: 需求文档 - Reliability_
  - _Prompt: Role: QA Engineer specializing in unit testing | Task: 编写核心服务的单元测试,包括PaginationEngine测试(测试溢出检测、断点识别、分页算法边界情况)、LayoutEngine测试(测试FlowLayout、FlexLayout、GridLayout三种模式)、CacheManager测试(测试LRU淘汰策略、缓存命中率、缓存统计),测试覆盖率>80% | Restrictions: 必须测试成功和失败场景,必须测试边界情况,测试必须独立运行,使用mock隔离外部依赖 | Success: 所有测试通过,测试覆盖率>80%,边界情况测试完整,测试运行稳定_

## 阶段 3: 页面渲染器层实现

- [ ] 3.1 实现页面渲染器基类
  - File: src/components/ExportPDF/renderers/BasePageRenderer.ts
  - 定义IPageRenderer接口: render, getContent, validate
  - 实现BasePageRenderer抽象类
  - 实现生命周期钩子: beforeRender, renderContent, afterRender
  - 实现通用功能: 添加页码、添加水印
  - Purpose: 定义页面渲染的统一接口和通用功能
  - _Leverage: DOM API, StyleSheet_
  - _Requirements: 需求文档 - Code Architecture_
  - _Prompt: Role: Object-Oriented Design Specialist | Task: 实现完整的页面渲染器基类,定义IPageRenderer接口,实现BasePageRenderer抽象类,实现生命周期钩子(beforeRender预处理、renderContent抽象方法由子类实现、afterRender添加页码和水印),实现通用的addPageNumber和addWatermark方法 | Restrictions: 必须使用TypeScript抽象类,renderContent必须为抽象方法,生命周期钩子必须按顺序执行,页码和水印样式必须符合主题 | Success: 基类实现完整,接口定义清晰,生命周期钩子正常工作,通用功能可用_

- [ ] 3.2 实现封面页渲染器
  - File: src/components/ExportPDF/renderers/CoverPageRenderer.ts
  - 继承BasePageRenderer,实现renderContent
  - 创建封面布局: 渐变背景、标题、副标题、用户信息
  - Purpose: 渲染PDF封面页
  - _Leverage: StyleSheet, LayoutEngine_
  - _Requirements: 需求文档 - 完整内容导出_
  - _Prompt: Role: Frontend Developer specializing in PDF layout | Task: 实现封面页渲染器,继承BasePageRenderer,实现renderContent方法创建封面布局,包括顶部渐变背景条、主标题"人生K线分析报告"、副标题"Life Kline Analysis Report"、用户信息(姓名、出生日期、出生时间)、底部装饰元素 | Restrictions: 必须使用主题样式,布局必须居中对齐,渐变背景必须符合主题色,字体大小和间距合理 | Success: 封面页渲染正确,布局美观,符合主题风格,信息完整显示_

- [ ] 3.3 实现八字排盘页渲染器
  - File: src/components/ExportPDF/renderers/BaziPageRenderer.ts
  - 继承BasePageRenderer,实现renderContent
  - 创建八字排盘表格: 天干地支、十神、五行
  - Purpose: 渲染八字排盘信息
  - _Leverage: StyleSheet, LayoutEngine, BaziResult数据_
  - _Requirements: 需求文档 - 完整内容导出_
  - _Prompt: Role: Frontend Developer specializing in table layout | Task: 实现八字排盘页渲染器,创建完整的八字排盘表格,包括年月日时四柱的天干地支、十神分析、五行统计(金木水火土的数量和占比),使用表格或网格布局展示,每个单元格对齐准确 | Restrictions: 必须正确显示天干地支,十神和五行必须准确计算,表格边框清晰可读,必须符合主题配色 | Success: 八字排盘显示完整准确,表格布局合理,数据计算正确,符合主题风格_

- [ ] 3.4 实现K线图页面渲染器
  - File: src/components/ExportPDF/renderers/KLinePageRenderer.ts
  - 继承BasePageRenderer,实现renderContent
  - 集成SVG K线图生成器
  - 创建K线图页面布局: 标题、K线图、图例、说明
  - Purpose: 渲染人生K线图
  - _Leverage: KLineChartGenerator, KLineData数据_
  - _Requirements: 需求文档 - 高质量K线图渲染_
  - _Prompt: Role: Frontend Developer specializing in SVG charts | Task: 实现K线图页面渲染器,集成SVG K线图生成器,创建K线图页面布局包括标题"人生运势K线图"、K线图本身、图例说明(上涨颜色、下跌颜色)、底部说明文字,调用KLineChartGenerator生成SVG并插入到页面 | Restrictions: K线图必须居中显示,图例必须清晰可读,SVG必须高DPI(300 DPI),K线宽度必须在8-20mm之间 | Success: K线图渲染清晰准确,布局合理,图例说明完整,符合主题配色_

- [ ] 3.5 实现SVG K线图生成器
  - File: src/components/ExportPDF/svg/KLineChartGenerator.ts
  - 实现IKLineChartGenerator接口: generate
  - 实现自适应K线宽度算法(8-20mm)
  - 实现智能坐标轴刻度算法
  - 支持高DPI渲染
  - Purpose: 生成高质量SVG K线图
  - _Leverage: SVG API, KLineData数据_
  - _Requirements: 需求文档 - 高质量K线图渲染_
  - _Prompt: Role: SVG and Data Visualization Specialist | Task: 实现完整的SVG K线图生成器,实现自适应K线宽度算法(计算合适的蜡烛宽度,限制在8-20mm之间,间距占比30%),实现智能坐标轴刻度算法(使用对数刻度,生成美观的刻度点),支持高DPI渲染(300 DPI),绘制K线实体和影线,添加网格线和坐标轴 | Restrictions: K线必须清晰可读,坐标轴刻度必须准确,支持大量数据点(100年),必须符合主题配色,SVG必须符合标准 | Success: K线图生成质量高,清晰可读,坐标轴准确,支持高DPI,符合主题风格_

- [ ] 3.6 实现其他页面渲染器
  - File: src/components/ExportPDF/renderers/{Other}PageRenderer.ts
  - 实现目录页、五行关系页、六维度分析页、开运指南页、大运流年页、综合建议页
  - Purpose: 完成所有11个页面的渲染
  - _Leverage: StyleSheet, LayoutEngine_
  - _Requirements: 需求文档 - 完整内容导出_
  - _Prompt: Role: Frontend Developer specializing in PDF content | Task: 实现6个剩余页面渲染器:TableOfContentsRenderer(目录页,列出所有章节和页码)、FiveElementsRenderer(五行关系页,展示五行相生相克图和说明)、DimensionsRenderer(六维度分析页,展示事业、财运、健康、感情、学业的评分和图表)、LuckyItemsRenderer(开运指南页,列出开运物品和颜色)、DaYunRenderer(大运流年页,展示不同年龄段的大运和流年)、AdviceRenderer(综合建议页,展示个性化建议) | Restrictions: 每个页面布局必须合理美观,必须使用主题样式,数据必须准确,图表必须清晰可读 | Success: 所有11个页面渲染器实现完整,每个页面内容准确,布局美观,符合主题风格_

- [ ] 3.7 编写页面渲染器单元测试
  - File: src/components/ExportPDF/__tests__/renderers.test.ts
  - 测试每个渲染器的renderContent方法
  - 测试页面元数据正确性
  - Purpose: 确保所有页面渲染器工作正常
  - _Leverage: Vitest测试框架, happy-dom_
  - _Requirements: 需求文档 - Reliability_
  - _Prompt: Role: QA Engineer specializing in component testing | Task: 编写所有11个页面渲染器的单元测试,测试每个渲染器的renderContent方法是否正确生成页面内容,测试页面元数据(页码、标题、类型)是否正确,测试主题样式是否正确应用,测试数据绑定是否准确 | Restrictions: 必须使用mock数据,测试必须独立,测试覆盖率>80%,必须测试主题切换 | Success: 所有测试通过,测试覆盖率>80%,主题切换测试完整,数据绑定测试准确_

## 阶段 4: 编排层实现

- [ ] 4.1 实现PDF编排器
  - File: src/components/ExportPDF/core/orchestrator.ts
  - 实现IPDFOrchestrator接口: generatePDF, getProgress, cancel
  - 管理PDF生成生命周期: 初始化、创建渲染器、并行渲染、合并PDF
  - 实现进度跟踪和取消功能
  - Purpose: 协调整个PDF生成流程
  - _Leverage: 所有页面渲染器, jsPDF, CacheManager_
  - _Requirements: 需求文档 - 完整内容导出, Performance_
  - _Prompt: Role: Software Architect specializing in orchestration patterns | Task: 实现完整的PDF编排器,管理PDF生成生命周期(初始化配置、创建所有页面渲染器、使用Promise.all并行渲染、使用jsPDF合并所有Canvas页面、生成最终Blob),实现进度跟踪(current/total, percentage, stage),实现取消功能(abortPromise),集成缓存机制 | Restrictions: 必须使用并行渲染提高性能,必须正确处理错误,进度跟踪必须实时更新,取消必须立即停止所有渲染 | Success: 编排器功能完整,11个页面正确渲染和合并,进度跟踪准确,取消功能正常,性能达标(<10秒)_

- [ ] 4.2 实现公共API入口
  - File: src/components/ExportPDF/index.ts
  - 导出公共API: generatePDFReport, downloadPDFReport, getPDFProgress, cancelPDFGeneration
  - 实现文件下载逻辑
  - Purpose: 提供简洁的对外接口
  - _Leverage: PDFOrchestrator_
  - _Requirements: 需求文档 - 完整内容导出_
  - _Prompt: Role: API Designer specializing in public interfaces | Task: 实现公共API入口,导出generatePDFReport(生成PDF并返回Blob)、downloadPDFReport(生成PDF并自动下载)、getPDFProgress(获取生成进度)、cancelPDFGeneration(取消生成)四个函数,实现文件下载逻辑(创建URL对象、触发下载、清理URL对象),处理文件命名(格式: 人生K线分析报告_姓名_日期.pdf) | Restrictions: API必须简洁易用,错误处理必须完善,文件名必须有意义,下载必须兼容主流浏览器 | Success: 公共API完整,调用简单,文件下载正常,错误处理完善,文件命名规范_

- [ ] 4.3 编写编排器集成测试
  - File: src/components/ExportPDF/__tests__/orchestrator.test.ts
  - 测试完整PDF生成流程(11个页面)
  - 测试并行渲染正确性
  - 测试进度跟踪和取消功能
  - Purpose: 确保编排器工作正常
  - _Leverage: Vitest测试框架_
  - _Requirements: 需求文档 - Reliability, Performance_
  - _Prompt: Role: QA Engineer specializing in integration testing | Task: 编写编排器的集成测试,测试完整PDF生成流程(生成11页PDF,验证PDF类型和大小),测试并行渲染正确性(所有页面都渲染完成,顺序正确),测试进度跟踪(进度准确更新,百分比计算正确),测试取消功能(取消后立即停止,资源正确释放) | Restrictions: 必须测试完整流程,必须测试性能(<10秒),必须测试边界情况(大数据量、取消时机) | Success: 所有集成测试通过,性能达标,进度跟踪准确,取消功能正常,资源释放完整_

## 阶段 5: 集成和优化

- [ ] 5.1 更新ExportButton组件
  - File: src/components/ExportPDF/ExportButton.tsx
  - 集成新的PDF生成API
  - 实现进度提示UI
  - 实现错误提示UI
  - Purpose: 用户触发PDF导出和显示状态
  - _Leverage: 新的PDF生成API, React状态管理_
  - _Requirements: 需求文档 - Usability_
  - _Prompt: Role: React Frontend Developer specializing in UI components | Task: 更新ExportButton组件,集成新的PDF生成API(downloadPDFReport),实现进度提示UI(显示进度条、当前页/总页数、百分比、当前阶段),实现错误提示UI(使用Toast或Alert显示错误信息),实现加载状态(禁用按钮、显示加载图标),获取用户分析数据(Zustand store) | Restrictions: UI必须美观,进度提示必须实时更新,错误信息必须清晰可读,必须处理取消操作 | Success: 导出按钮工作正常,进度提示实时准确,错误提示清晰,用户体验流畅_

- [ ] 5.2 性能优化
  - File: 多个文件
  - 优化html2canvas配置(scale, quality, useCORS)
  - 使用DocumentFragment减少DOM重排
  - 优化Canvas渲染(离屏Canvas、批处理)
  - Purpose: 提升PDF生成性能
  - _Leverage: 性能分析工具_
  - _Requirements: 需求文档 - Performance_
  - _Prompt: Role: Performance Optimization Specialist | Task: 实施多项性能优化,优化html2canvas配置(设置合适的scale=2, useCORS=true, logging=false),使用DocumentFragment构建DOM减少重排,使用离屏Canvas预渲染,批量DOM操作,优化SVG到Canvas转换,减少重复计算,启用缓存 | Restrictions: 必须保证渲染质量,不能为了性能牺牲质量,优化必须有性能测试数据支持 | Success: 性能提升明显,生成时间<10秒,缓存生效后<2秒,内存占用<200MB,渲染质量不受影响_

- [ ] 5.3 编写E2E测试
  - File: tests/e2e/export-pdf.spec.ts
  - 使用Playwright测试完整用户流程
  - 测试PDF下载成功
  - 测试主题切换
  - Purpose: 验证端到端功能
  - _Leverage: Playwright测试框架_
  - _Requirements: 需求文档 - Reliability_
  - _Prompt: Role: QA Engineer specializing in E2E testing | Task: 使用Playwright编写E2E测试,测试完整用户流程(填写出生信息→查看分析结果→点击导出按钮→等待PDF生成→验证PDF下载成功),测试主题切换(切换不同主题→导出PDF→验证主题样式正确),测试缓存效果(第二次生成→验证速度提升),测试错误场景(网络错误、浏览器不兼容) | Restrictions: 必须测试真实用户流程,必须使用真实浏览器,测试必须稳定可靠,必须包含截图和视频 | Success: E2E测试通过,覆盖主要用户场景,测试稳定可靠,截图和视频可用_

## 阶段 6: 文档和交付

- [ ] 6.1 编写API文档
  - File: src/components/ExportPDF/API.md
  - 记录所有公共API
  - 提供使用示例
  - Purpose: 方便开发者使用和维护
  - _Leverage: 生成的类型定义_
  - _Requirements: 需求文档 - Code Architecture_
  - _Prompt: Role: Technical Writer specializing in API documentation | Task: 编写完整的API文档,记录所有公共API(generatePDFReport, downloadPDFReport, getPDFProgress, cancelPDFGeneration),每个API包括签名、参数说明、返回值、使用示例、错误说明,记录所有配置选项(主题、页面尺寸、方向),提供完整的使用示例 | Restrictions: 文档必须清晰准确,示例必须可运行,错误说明必须详细,必须包含TypeScript类型信息 | Success: API文档完整准确,示例可运行,类型信息完整,开发者易于理解和使用_

- [ ] 6.2 编写实施总结
  - File: docs/implementation-log-pdf-refactor.md
  - 记录实施过程和遇到的问题
  - 记录性能提升数据
  - Purpose: 总结经验,便于后续维护
  - _Leverage: 性能测试数据_
  - _Requirements: 需求文档 - 所有_
  - _Prompt: Role: Senior Developer specializing in technical writing | Task: 编写详细的实施总结,记录实施过程(每个阶段的工作内容和时间)、记录遇到的问题和解决方案、记录性能提升数据(生成时间从X秒优化到Y秒,提升Z%)、记录代码质量改进(代码行数从X行减少到Y行,测试覆盖率从X%提升到Y%)、记录未完成的工作和后续优化方向 | Restrictions: 数据必须真实准确,问题分析必须深入,总结必须全面 | Success: 实施总结详细完整,数据真实准确,问题分析深入,经验总结有价值_

- [ ] 6.3 更新SUBMISSION.md
  - File: life-kline-edge/SUBMISSION.md
  - 更新PDF导出功能的说明
  - 更新技术指标
  - 更新部署URL和GitHub仓库地址
  - Purpose: 完善赛事提交材料
  - _Leverage: 更新的功能和技术指标_
  - _Requirements: 赛事介绍 - 提交说明_
  - _Prompt: Role: Project Manager specializing in competition submissions | Task: 更新SUBMISSION.md赛事提交材料,更新作品说明部分(补充PDF导出功能的详细介绍),更新技术指标(更新性能数据、代码质量指标),更新使用演示(添加PDF导出功能演示),确认部署URL和GitHub仓库地址正确,确保所有信息符合赛事要求 | Restrictions: 必须符合赛事提交要求,部署URL必须可访问,GitHub仓库必须公开,技术指标必须真实准确 | Success: SUBMISSION.md更新完整,符合赛事要求,所有链接有效,技术指标真实准确_

---

**文档版本**: 1.0
**创建日期**: 2026-01-11
**作者**: AI Assistant
**项目**: 人生 K 线 - Life K-line Edge
