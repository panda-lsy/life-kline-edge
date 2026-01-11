/**
 * 分享卡片组件
 * 生成精美的社交媒体分享卡片，支持导出为图片
 */

import { useRef, useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import type { BaziResult } from '@/types/bazi';
import type { SixDimensions, KLineData } from '@/types/kline';
import { generateShareImage } from './generateImage';

/**
 * 地支对应的生肖
 */
const ZODIAC_MAP: Record<string, string> = {
  子: '鼠',
  丑: '牛',
  寅: '虎',
  卯: '兔',
  辰: '龙',
  巳: '蛇',
  午: '马',
  未: '羊',
  申: '猴',
  酉: '鸡',
  戌: '狗',
  亥: '猪',
};

export interface ShareCardProps {
  /** 用户姓名 */
  name: string;
  /** 出生日期（农历） */
  birthDate: string;
  /** 出生时间 */
  birthTime: string;
  /** 八字排盘数据 */
  baziData: BaziResult;
  /** 六维度分析数据 */
  dimensionsData: SixDimensions;
  /** K线数据（用于缩略图） */
  klineData: KLineData[];
  /** 主题名称 */
  themeName?: string;
  /** 是否显示下载按钮 */
  showDownloadButton?: boolean;
  /** 下载完成回调 */
  onDownloadComplete?: (dataUrl: string) => void;
  /** 下载失败回调 */
  onDownloadError?: (error: Error) => void;
}

/**
 * 五行强度条
 */
function FiveElementsBar({ data }: { data: BaziResult['wuXing'] }) {
  const maxScore = Math.max(...Object.values(data));

  return (
    <div className="space-y-2">
      {(Object.entries(data) as [keyof BaziResult['wuXing'], number][]).map(
        ([element, score]) => {
          const percentage = (score / maxScore) * 100;
          const elementNames: Record<string, string> = {
            wood: '木',
            fire: '火',
            earth: '土',
            metal: '金',
            water: '水',
          };

          return (
            <div key={element} className="flex items-center gap-2">
              <span className="w-6 text-sm font-medium">{elementNames[element]}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-gray-600">{score}</span>
            </div>
          );
        }
      )}
    </div>
  );
}

/**
 * 维度评分徽章
 */
function DimensionBadge({
  label,
  score,
  color = 'bg-blue-500',
}: {
  label: string;
  score: number;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
        {score}
      </div>
      <span className="text-xs text-gray-600 mt-1">{label}</span>
    </div>
  );
}

/**
 * 迷你K线图组件 - 用于分享卡片
 */
function MiniKLine({
  data,
  upColor,
  downColor,
}: {
  data: KLineData[];
  upColor: string;
  downColor: string;
}) {
  // 取前20年数据作为缩略图
  const previewData = useMemo(() => data.slice(0, 20), [data]);

  // 计算Y轴范围
  const allValues = previewData.flatMap((d) => [d.high, d.low]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;

  // 计算每个蜡烛的位置和大小
  const chartHeight = 100;
  const chartWidth = 300;
  const candleWidth = (chartWidth / previewData.length) * 0.7;
  const candleGap = (chartWidth / previewData.length) * 0.3;

  // 计算趋势方向
  const isUpTrend = previewData[previewData.length - 1]?.close >= previewData[0]?.open;

  return (
    <div className="relative w-full h-[120px] bg-gray-50 rounded-lg overflow-hidden">
      {/* 简化的K线图 */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {previewData.map((item, index) => {
          const x = index * (candleWidth + candleGap) + candleGap / 2;
          const isUp = item.close >= item.open;
          const color = isUp ? upColor : downColor;

          // 计算Y坐标（SVG坐标系统向下为正，所以需要反转）
          const openY = chartHeight - ((item.open - minValue) / range) * chartHeight;
          const closeY = chartHeight - ((item.close - minValue) / range) * chartHeight;
          const highY = chartHeight - ((item.high - minValue) / range) * chartHeight;
          const lowY = chartHeight - ((item.low - minValue) / range) * chartHeight;

          return (
            <g key={item.year}>
              {/* 上下影线 */}
              <line
                x1={x + candleWidth / 2}
                y1={highY}
                x2={x + candleWidth / 2}
                y2={lowY}
                stroke={color}
                strokeWidth={1.5}
              />
              {/* 蜡烛实体 */}
              <rect
                x={x}
                y={Math.min(openY, closeY)}
                width={candleWidth}
                height={Math.max(Math.abs(closeY - openY), 1)}
                fill={color}
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* 趋势指示器 - SVG内绘制，避免编码问题 */}
        <g transform={`translate(${chartWidth - 30}, 10)`}>
          <circle cx="10" cy="10" r="12" fill={isUpTrend ? upColor : downColor} opacity={0.2} />
          {isUpTrend ? (
            // 上升箭头
            <path
              d="M10 5 L5 12 H8 V15 H12 V12 H15 L10 5Z"
              fill={upColor}
            />
          ) : (
            // 下降箭头
            <path
              d="M10 15 L5 8 H8 V5 H12 V8 H15 L10 15Z"
              fill={downColor}
            />
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * 分享卡片主组件
 */
export function ShareCard({
  name: _name, // 保留参数以兼容，但为隐私保护不再显示
  birthDate: _birthDate, // 保留参数以兼容，但为隐私保护不再显示
  birthTime: _birthTime, // 保留参数以兼容，但为隐私保护不再显示
  baziData,
  dimensionsData,
  klineData, // K线数据
  themeName = 'chinese',
  showDownloadButton = true,
  onDownloadComplete,
  onDownloadError,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  /**
   * 获取最强和最弱维度
   */
  const getTopDimensions = useCallback(() => {
    const entries = Object.entries(dimensionsData) as [
      keyof SixDimensions,
      SixDimensions[keyof SixDimensions]
    ][];
    const sorted = entries.sort((a, b) => b[1].score - a[1].score);
    return {
      strongest: sorted[0],
      weakest: sorted[sorted.length - 1],
    };
  }, [dimensionsData]);

  const { strongest, weakest } = getTopDimensions();

  /**
   * 下载卡片为图片
   */
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      // 使用 modern-screenshot 生成图片
      // 该库直接使用浏览器截图 API，对中文字符有更好的支持
      const dataUrl = await generateShareImage(cardRef.current, {
        backgroundColor: getThemeColor(themeName, 'background'),
        scale: 2, // 2倍分辨率
      });

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `人生K线图-${Date.now()}.png`; // 隐私保护：移除姓名
      link.href = dataUrl;
      link.click();

      onDownloadComplete?.(dataUrl);
    } catch (error) {
      console.error('生成分享卡片失败:', error);
      onDownloadError?.(error as Error);
    }
  }, [themeName, onDownloadComplete, onDownloadError]);

  /**
   * 获取主题颜色
   */
  function getThemeColor(theme: string, type: 'primary' | 'secondary' | 'background'): string {
    const colors: Record<string, any> = {
      chinese: {
        primary: '#C8102E',
        secondary: '#FFD700',
        background: '#FEF7F0',
      },
      cyberpunk: {
        primary: '#FF00FF',
        secondary: '#00FFFF',
        background: '#0A0A0A',
      },
      minimal: {
        primary: '#2563EB',
        secondary: '#64748B',
        background: '#FFFFFF',
      },
    };

    return colors[theme]?.[type] || colors.chinese[type];
  }

  const primaryColor = getThemeColor(themeName, 'primary');
  const secondaryColor = getThemeColor(themeName, 'secondary');
  const backgroundColor = getThemeColor(themeName, 'background');

  /**
   * 维度名称映射
   */
  const dimensionNames: Record<string, string> = {
    career: '事业',
    wealth: '财富',
    marriage: '婚姻',
    health: '健康',
    personality: '性格',
    fengshui: '风水',
  };

  return (
    <div className="space-y-4">
      {/* 下载按钮 */}
      {showDownloadButton && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>下载分享卡片</span>
        </button>
      )}

      {/* 分享卡片主体 - 3:4 比例适配小红书 */}
      <div
        ref={cardRef}
        className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          width: '375px', // 固定宽度确保截图一致性
          minHeight: '500px', // 最小高度，确保内容完整
          background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor}20 100%)`,
          fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif", // 确保中文字体渲染
        }}
      >
        {/* 顶部装饰 */}
        <div
          className="h-3"
          style={{ background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        />

        {/* 卡片内容 */}
        <div className="p-6 flex flex-col" style={{ minHeight: '500px' }}>
          {/* 标题区域 */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif" }}>
              人生K线图
            </h1>
            <p className="text-sm text-gray-600" style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif" }}>
              探索生命轨迹，预见人生未来
            </p>
          </div>

          {/* 生肖卡片 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 shadow-md">
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl">🎂</div>
              <div>
                <div className="text-xs text-gray-600 mb-1" style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif" }}>
                  本命生肖
                </div>
                <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {ZODIAC_MAP[baziData.siZhu.year.zhi] || '未知'}
                </div>
              </div>
            </div>
          </div>

          {/* K线图缩略图 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 shadow-md">
            <div className="text-xs font-semibold text-gray-700 mb-3" style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif" }}>
              人生K线趋势
            </div>
            <MiniKLine
              data={klineData}
              upColor={primaryColor}
              downColor={secondaryColor}
            />
          </div>

          {/* 五行分析 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 shadow-md flex-1">
            <div className="text-xs font-semibold text-gray-700 mb-3" style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif" }}>
              五行强弱分析
            </div>
            <FiveElementsBar data={baziData.wuXing} />
          </div>

          {/* 六维度亮点 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 shadow-md">
            <div className="text-xs font-semibold text-gray-700 mb-3" style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif" }}>
              人生六维度
            </div>
            <div className="flex justify-around">
              <DimensionBadge
                label={dimensionNames[strongest[0]]}
                score={strongest[1].score}
                color="bg-gradient-to-br from-red-500 to-pink-500"
              />
              <DimensionBadge
                label={dimensionNames[weakest[0]]}
                score={weakest[1].score}
                color="bg-gradient-to-br from-gray-400 to-gray-600"
              />
              <DimensionBadge
                label="综合"
                score={Math.round(
                  Object.values(dimensionsData).reduce((sum, d) => sum + d.score, 0) / 6
                )}
                color="bg-gradient-to-br from-blue-500 to-purple-500"
              />
            </div>
          </div>

          {/* 隐私提示 */}
          <div className="text-xs text-gray-600 text-center mb-3" style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif" }}>
            🔒 为保护您的隐私，分享卡片已隐藏个人信息
          </div>

          {/* 底部水印和装饰 */}
          <div className="mt-auto pt-4 text-center">
            <div
              className="inline-block px-6 py-2 rounded-lg text-white text-sm font-medium mb-1"
              style={{
                background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif"
              }}
            >
              🔮 人生K线 · 探索生命轨迹
            </div>
            <div className="text-xs text-gray-600" style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif" }}>
              由阿里云 ESA 提供加速
            </div>
          </div>
        </div>

        {/* 装饰性角标 */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="80"
              cy="20"
              r="60"
              fill="none"
              stroke={primaryColor}
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
