/**
 * 六大维度分析展示组件
 * 显示事业/财富/婚姻/健康/性格/风水的 AI 分析结果
 */

import { useState, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { SixDimensions } from '@/types/kline';

interface DimensionAnalysisProps {
  /** 六大维度分析数据 */
  data: SixDimensions;
}

/**
 * 维度配置接口
 */
interface DimensionConfig {
  name: string;
  icon: string;
  color: string;
  textColor: string;
  bgColor: string;
}

/**
 * 获取文字颜色配置
 */
function getTextColors(themeName: string) {
  if (themeName === 'cyberpunk') {
    return {
      title: '#E0E0E0',
      subtitle: '#B0B0B0',
      cardBg: '#1A1A1A',
      sectionTitle: '#E0E0E0',
      textPrimary: '#E0E0E0',
      textSecondary: '#B0B0B0',
      scoreText: '#E0E0E0',
      barBg: '#2A2A2A',
    };
  }
  if (themeName === 'minimal') {
    return {
      title: '#111827',
      subtitle: '#6B7280',
      cardBg: '#FFFFFF',
      sectionTitle: '#1F2937',
      textPrimary: '#374151',
      textSecondary: '#6B7280',
      scoreText: '#111827',
      barBg: '#E5E7EB',
    };
  }
  // chinese (default)
  return {
    title: '#111827',
    subtitle: '#6B7280',
    cardBg: '#FFFFFF',
    sectionTitle: '#1F2937',
    textPrimary: '#374151',
    textSecondary: '#4B5563',
    scoreText: '#111827',
    barBg: '#E5E7EB',
  };
}

/**
 * 根据主题获取维度颜色配置
 */
function getDimensionConfig(themeName: string): Record<string, DimensionConfig> {
  const configs: Record<string, Record<string, DimensionConfig>> = {
    chinese: {
      career: {
        name: '事业',
        icon: '💼',
        color: '#3B82F6',
        textColor: '#1E40AF',
        bgColor: '#EFF6FF',
      },
      wealth: {
        name: '财富',
        icon: '💰',
        color: '#EAB308',
        textColor: '#A16207',
        bgColor: '#FEF9C3',
      },
      marriage: {
        name: '婚姻',
        icon: '❤️',
        color: '#EC4899',
        textColor: '#BE185D',
        bgColor: '#FDF2F8',
      },
      health: {
        name: '健康',
        icon: '🏥',
        color: '#22C55E',
        textColor: '#15803D',
        bgColor: '#F0FDF4',
      },
      personality: {
        name: '性格',
        icon: '🧠',
        color: '#8B5CF6',
        textColor: '#6D28D9',
        bgColor: '#F5F3FF',
      },
      fengshui: {
        name: '风水',
        icon: '🏠',
        color: '#D97706',
        textColor: '#B45309',
        bgColor: '#FFFBEB',
      },
    },
    cyberpunk: {
      career: {
        name: '事业',
        icon: '💼',
        color: '#00FFFF',
        textColor: '#00CCCC',
        bgColor: '#0A0A1A',
      },
      wealth: {
        name: '财富',
        icon: '💰',
        color: '#FFD700',
        textColor: '#FFA500',
        bgColor: '#1A1A0A',
      },
      marriage: {
        name: '婚姻',
        icon: '❤️',
        color: '#FF0066',
        textColor: '#CC0052',
        bgColor: '#1A0A0A',
      },
      health: {
        name: '健康',
        icon: '🏥',
        color: '#00FF00',
        textColor: '#00CC00',
        bgColor: '#0A1A0A',
      },
      personality: {
        name: '性格',
        icon: '🧠',
        color: '#CC00FF',
        textColor: '#9900CC',
        bgColor: '#1A0A1A',
      },
      fengshui: {
        name: '风水',
        icon: '🏠',
        color: '#FF6600',
        textColor: '#CC5200',
        bgColor: '#1A0D0A',
      },
    },
    minimal: {
      career: {
        name: '事业',
        icon: '💼',
        color: '#2563EB',
        textColor: '#1E40AF',
        bgColor: '#EFF6FF',
      },
      wealth: {
        name: '财富',
        icon: '💰',
        color: '#F59E0B',
        textColor: '#D97706',
        bgColor: '#FFFBEB',
      },
      marriage: {
        name: '婚姻',
        icon: '❤️',
        color: '#EC4899',
        textColor: '#DB2777',
        bgColor: '#FDF2F8',
      },
      health: {
        name: '健康',
        icon: '🏥',
        color: '#10B981',
        textColor: '#059669',
        bgColor: '#ECFDF5',
      },
      personality: {
        name: '性格',
        icon: '🧠',
        color: '#8B5CF6',
        textColor: '#7C3AED',
        bgColor: '#F5F3FF',
      },
      fengshui: {
        name: '风水',
        icon: '🏠',
        color: '#F97316',
        textColor: '#EA580C',
        bgColor: '#FFF7ED',
      },
    },
  };

  return configs[themeName] || configs.chinese;
}

type DimensionKey = 'career' | 'wealth' | 'marriage' | 'health' | 'personality' | 'fengshui';

/**
 * 评分星级显示
 */
function ScoreRating({ score, themeName }: { score: number; themeName: string }) {
  const stars = Math.round(score / 20); // 0-100 分转换为 0-5 星
  const colors = getTextColors(themeName);

  // 根据主题定义星级颜色
  const starColor = themeName === 'cyberpunk' ? '#FFD700' : '#EAB308';
  const emptyStarColor = themeName === 'cyberpunk' ? '#4A4A4A' : '#D1D5DB';

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="text-lg transition-colors duration-300"
          style={{ color: star <= stars ? starColor : emptyStarColor }}
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-sm font-semibold transition-colors duration-300" style={{ color: colors.textSecondary }}>
        {score}分
      </span>
    </div>
  );
}

/**
 * 评分进度条
 */
function ScoreBar({ score, config, themeName }: { score: number; config: DimensionConfig; themeName: string }) {
  const percentage = score;
  const colors = getTextColors(themeName);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium transition-colors duration-300" style={{ color: config.textColor }}>
          综合评分
        </span>
        <span className="font-semibold transition-colors duration-300" style={{ color: colors.textSecondary }}>
          {score}
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden transition-colors duration-300" style={{ backgroundColor: colors.barBg }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: config.color }}
        />
      </div>
    </div>
  );
}

/**
 * 维度详情卡片
 */
function DimensionCard({
  title,
  icon,
  score,
  overview,
  details,
  advice,
  config,
  themeName,
}: {
  title: string;
  icon: string;
  score: number;
  overview: string;
  details: string[];
  advice: string[];
  config: DimensionConfig;
  themeName: string;
}) {
  const colors = getTextColors(themeName);

  // 根据主题定义章节标题颜色
  const getSectionColor = (type: 'overview' | 'details' | 'advice') => {
    if (themeName === 'cyberpunk') {
      return type === 'overview' ? '#00FFFF' : type === 'details' ? '#CC00FF' : '#00FF00';
    }
    return type === 'overview' ? '#3B82F6' : type === 'details' ? '#8B5CF6' : '#22C55E';
  };

  return (
    <div className="space-y-6">
      {/* 标题和评分 */}
      <div
        className="rounded-lg p-6 border-l-4 transition-all duration-300"
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.color,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{icon}</span>
          <div className="flex-1">
            <h3
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: colors.sectionTitle }}
            >
              {title}
            </h3>
            <ScoreRating score={score} themeName={themeName} />
          </div>
        </div>
        <ScoreBar score={score} config={config} themeName={themeName} />
      </div>

      {/* 概述 */}
      <div
        className="rounded-lg p-5 shadow-md transition-colors duration-300"
        style={{ backgroundColor: colors.cardBg }}
      >
        <h4
          className="text-lg font-semibold mb-3 flex items-center gap-2 transition-colors duration-300"
          style={{ color: colors.sectionTitle }}
        >
          <span
            className="w-1 h-6 rounded transition-colors duration-300"
            style={{ backgroundColor: getSectionColor('overview') }}
          ></span>
          总体概述
        </h4>
        <p
          className="leading-relaxed transition-colors duration-300"
          style={{ color: colors.textPrimary }}
        >
          {overview}
        </p>
      </div>

      {/* 详细分析 */}
      <div
        className="rounded-lg p-5 shadow-md transition-colors duration-300"
        style={{ backgroundColor: colors.cardBg }}
      >
        <h4
          className="text-lg font-semibold mb-3 flex items-center gap-2 transition-colors duration-300"
          style={{ color: colors.sectionTitle }}
        >
          <span
            className="w-1 h-6 rounded transition-colors duration-300"
            style={{ backgroundColor: getSectionColor('details') }}
          ></span>
          详细分析
        </h4>
        <ul className="space-y-2">
          {details.map((detail, index) => (
            <li key={index} className="flex items-start gap-2">
              <span
                className="mt-1 transition-colors duration-300"
                style={{ color: getSectionColor('details') }}
              >
                •
              </span>
              <span
                className="flex-1 transition-colors duration-300"
                style={{ color: colors.textPrimary }}
              >
                {detail}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 建议 */}
      <div
        className="rounded-lg p-5 shadow-md transition-colors duration-300"
        style={{ backgroundColor: colors.cardBg }}
      >
        <h4
          className="text-lg font-semibold mb-3 flex items-center gap-2 transition-colors duration-300"
          style={{ color: colors.sectionTitle }}
        >
          <span
            className="w-1 h-6 rounded transition-colors duration-300"
            style={{ backgroundColor: getSectionColor('advice') }}
          ></span>
          改进建议
        </h4>
        <ul className="space-y-2">
          {advice.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span
                className="mt-1 transition-colors duration-300"
                style={{ color: getSectionColor('advice') }}
              >
                ✓
              </span>
              <span
                className="flex-1 transition-colors duration-300"
                style={{ color: colors.textPrimary }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * 六大维度分析展示组件
 */
export function DimensionAnalysis({ data }: DimensionAnalysisProps) {
  const { themeName } = useTheme();
  const [activeDimension, setActiveDimension] = useState<DimensionKey>('career');

  // 获取当前主题的颜色配置
  const colors = getTextColors(themeName);

  // 获取当前主题的维度配置
  const dimensionConfig = getDimensionConfig(themeName);

  const dimensions = Object.keys(dimensionConfig) as DimensionKey[];
  const currentData = data[activeDimension];
  const config = dimensionConfig[activeDimension];

  // 优化：使用 useMemo 缓存最大值和最小值计算
  const dimensionStats = useMemo(() => {
    const entries = Object.entries(data) as [DimensionKey, { score: number }][];

    // 找出最大值和最小值
    const maxEntry = entries.reduce((max, [key, value]) =>
      value.score > max.score ? { key, score: value.score } : max,
      { key: 'career' as DimensionKey, score: 0 }
    );

    const minEntry = entries.reduce((min, [key, value]) =>
      value.score < min.score ? { key, score: value.score } : min,
      { key: 'career' as DimensionKey, score: Infinity }
    );

    // 计算所有分数的最大值和最小值
    const scores = entries.map(([, value]) => value.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    return {
      maxKey: maxEntry.key,
      minKey: minEntry.key,
      maxScore,
      minScore,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h3
          className="text-2xl font-bold mb-2 transition-colors duration-300"
          style={{ color: colors.title }}
        >
          六大维度分析
        </h3>
        <p
          className="text-sm transition-colors duration-300"
          style={{ color: colors.subtitle }}
        >
          基于 AI 算法的全方位命运分析
        </p>
      </div>

      {/* 维度选择标签页 */}
      <div
        className="flex flex-wrap gap-2 p-2 rounded-lg transition-colors duration-300"
        style={{ backgroundColor: themeName === 'cyberpunk' ? '#1A1A1A' : '#F9FAFB' }}
      >
        {dimensions.map((key) => {
          const dimConfig = dimensionConfig[key];
          const isActive = activeDimension === key;

          return (
            <button
              key={key}
              onClick={() => setActiveDimension(key)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: isActive ? dimConfig.color : (themeName === 'cyberpunk' ? '#2A2A2A' : '#FFFFFF'),
                color: isActive ? '#FFFFFF' : (themeName === 'cyberpunk' ? '#E0E0E0' : '#374151'),
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
              }}
            >
              <span className="text-xl">{dimConfig.icon}</span>
              <span>{dimConfig.name}</span>
              <span
                className="text-xs"
                style={{
                  color: isActive ? 'rgba(255, 255, 255, 0.9)' : (themeName === 'cyberpunk' ? '#9CA3AF' : '#6B7280'),
                  ...(isActive ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '4px' } : {})
                }}
              >
                {data[key].score}分
              </span>
            </button>
          );
        })}
      </div>

      {/* 当前维度详情 */}
      <div className="mt-6">
        <DimensionCard
          title={config.name}
          icon={config.icon}
          score={currentData.score}
          overview={currentData.overview}
          details={currentData.details}
          advice={currentData.advice}
          config={config}
          themeName={themeName}
        />
      </div>

      {/* 六维度总览 */}
      <div
        className="rounded-lg p-6 shadow-md transition-colors duration-300"
        style={{ backgroundColor: colors.cardBg }}
      >
        <h4
          className="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300"
          style={{ color: colors.sectionTitle }}
        >
          <span
            className="w-1 h-6 rounded transition-colors duration-300"
            style={{ backgroundColor: themeName === 'cyberpunk' ? '#CC00FF' : '#F59E0B' }}
          ></span>
          六维度总览
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dimensions.map((key) => {
            const dimConfig = dimensionConfig[key];
            const dimData = data[key];
            const isActive = activeDimension === key;

            return (
              <div
                key={key}
                className="rounded-lg p-4 text-center border-2 transition-all cursor-pointer hover:shadow-md"
                style={{
                  backgroundColor: dimConfig.bgColor,
                  borderColor: isActive ? dimConfig.color : 'transparent',
                }}
                onClick={() => setActiveDimension(key)}
              >
                <div className="text-3xl mb-2">{dimConfig.icon}</div>
                <div
                  className="text-sm font-semibold mb-1 transition-colors duration-300"
                  style={{ color: dimConfig.textColor }}
                >
                  {dimConfig.name}
                </div>
                <div
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: colors.scoreText }}
                >
                  {dimData.score}
                </div>
                <div
                  className="text-xs mt-1 transition-colors duration-300"
                  style={{ color: colors.textSecondary }}
                >
                  {dimData.score >= 80 ? '优秀' : dimData.score >= 60 ? '良好' : '一般'}
                </div>
              </div>
            );
          })}
        </div>

        {/* 综合分析 */}
        <div
          className="mt-4 p-4 rounded-lg border transition-all duration-300"
          style={{
            background: themeName === 'cyberpunk'
              ? 'linear-gradient(90deg, #0A1A2A 0%, #1A0A2A 100%)'
              : 'linear-gradient(90deg, #EFF6FF 0%, #F5F3FF 100%)',
            borderColor: themeName === 'cyberpunk' ? '#00FFFF' : '#BFDBFE',
          }}
        >
          <p
            className="text-sm transition-colors duration-300"
            style={{ color: themeName === 'cyberpunk' ? '#E0E0E0' : '#1F2937' }}
          >
            <span className="font-semibold">综合分析：</span>
            您的
            <span
              className="font-bold transition-colors duration-300"
              style={{ color: themeName === 'cyberpunk' ? '#00FFFF' : '#1E40AF' }}
            >
              {dimensionConfig[dimensionStats.maxKey].name}
            </span>
            运势最为强劲（
            <span className="font-semibold">{dimensionStats.maxScore}</span>
            分），建议继续发挥优势。
            <span
              className="font-bold transition-colors duration-300"
              style={{ color: themeName === 'cyberpunk' ? '#FF6600' : '#EA580C' }}
            >
              {dimensionConfig[dimensionStats.minKey].name}
            </span>
            方面需要多加关注（
            <span className="font-semibold">{dimensionStats.minScore}</span>
            分），参考相应建议进行改善。
          </p>
        </div>
      </div>
    </div>
  );
}
