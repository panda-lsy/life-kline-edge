/**
 * 八字排盘展示组件
 * 显示四柱八字、五行强弱、大运信息
 */

import { memo } from 'react';
import type { BaziResult } from '@/types/bazi';
import { useTheme } from '@/hooks/useTheme';

interface BaziDisplayProps {
  /** 八字计算结果 */
  data: BaziResult;
}

/**
 * 五行配置接口
 */
interface WuXingConfig {
  name: string;
  color: string;
  textColor: string;
  bgColor: string;
  trackBg?: string;
}

/**
 * 根据主题获取五行颜色配置
 */
function getWuXingConfig(themeName: string): Record<string, WuXingConfig> {
  const configs: Record<string, Record<string, WuXingConfig>> = {
    chinese: {
      metal: {
        name: '金',
        color: '#EAB308',
        textColor: '#CA8A04',
        bgColor: '#FEF9C3',
        trackBg: '#FEF3C7',
      },
      wood: {
        name: '木',
        color: '#22C55E',
        textColor: '#16A34A',
        bgColor: '#F0FDF4',
        trackBg: '#DCFCE7',
      },
      water: {
        name: '水',
        color: '#3B82F6',
        textColor: '#2563EB',
        bgColor: '#EFF6FF',
        trackBg: '#DBEAFE',
      },
      fire: {
        name: '火',
        color: '#EF4444',
        textColor: '#DC2626',
        bgColor: '#FEF2F2',
        trackBg: '#FEE2E2',
      },
      earth: {
        name: '土',
        color: '#D97706',
        textColor: '#B45309',
        bgColor: '#FFFBEB',
        trackBg: '#FEF3C7',
      },
    },
    cyberpunk: {
      metal: {
        name: '金',
        color: '#FFD700',
        textColor: '#FFA500',
        bgColor: '#1A1A1A',
        trackBg: '#2A2A2A',
      },
      wood: {
        name: '木',
        color: '#00FF00',
        textColor: '#00CC00',
        bgColor: '#0A1A0A',
        trackBg: '#1A2A1A',
      },
      water: {
        name: '水',
        color: '#00FFFF',
        textColor: '#00CCCC',
        bgColor: '#0A0A1A',
        trackBg: '#1A1A2A',
      },
      fire: {
        name: '火',
        color: '#FF0066',
        textColor: '#CC0052',
        bgColor: '#1A0A0A',
        trackBg: '#2A1A1A',
      },
      earth: {
        name: '土',
        color: '#FF6600',
        textColor: '#CC5200',
        bgColor: '#1A0D0A',
        trackBg: '#2A1A1A',
      },
    },
    minimal: {
      metal: {
        name: '金',
        color: '#F59E0B',
        textColor: '#D97706',
        bgColor: '#FFFBEB',
        trackBg: '#FEF3C7',
      },
      wood: {
        name: '木',
        color: '#10B981',
        textColor: '#059669',
        bgColor: '#ECFDF5',
        trackBg: '#D1FAE5',
      },
      water: {
        name: '水',
        color: '#3B82F6',
        textColor: '#2563EB',
        bgColor: '#EFF6FF',
        trackBg: '#DBEAFE',
      },
      fire: {
        name: '火',
        color: '#EF4444',
        textColor: '#DC2626',
        bgColor: '#FEF2F2',
        trackBg: '#FEE2E2',
      },
      earth: {
        name: '土',
        color: '#8B5CF6',
        textColor: '#7C3AED',
        bgColor: '#F5F3FF',
        trackBg: '#EDE9FE',
      },
    },
  };

  return configs[themeName] || configs.chinese;
}

/**
 * 五行强弱进度条
 */
function WuXingBar({ label, value, max, config }: {
  label: string;
  value: number;
  max: number;
  config: WuXingConfig;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span style={{ color: config.textColor }} className="font-medium transition-colors duration-300">{label}</span>
        <span className="transition-colors duration-300" style={{ color: config.textColor }}>{value}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden transition-colors duration-300" style={{ backgroundColor: config.trackBg || '#E5E7EB' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: config.color }}
        />
      </div>
    </div>
  );
}

/**
 * 天干地支展示卡片
 */
function GanZhiCard({ label, gan, zhi, theme }: {
  label: string;
  gan: string;
  zhi: string;
  theme: string;
}) {
  // 根据主题定义卡片样式
  const cardStyles: Record<string, { bg: string; border: string; text: string; label: string }> = {
    chinese: {
      bg: 'linear-gradient(135deg, #FEF2F2 0%, #FFFBEB 100%)',
      border: '#FCA5A5',
      text: '#B91C1C',
      label: '#6B7280',
    },
    cyberpunk: {
      bg: 'linear-gradient(135deg, #1A0A0A 0%, #1A0D0A 100%)',
      border: '#FF0066',
      text: '#FF0066',
      label: '#9CA3AF',
    },
    minimal: {
      bg: 'linear-gradient(135deg, #FEF2F2 0%, #F5F3FF 100%)',
      border: '#E5E7EB',
      text: '#1F2937',
      label: '#6B7280',
    },
  };

  const style = cardStyles[theme] || cardStyles.chinese;

  return (
    <div
      className="flex flex-col items-center p-4 rounded-lg border-2 shadow-md transition-all duration-300"
      style={{
        background: style.bg,
        borderColor: style.border,
      }}
    >
      <span className="text-sm mb-2" style={{ color: style.label }}>{label}</span>
      <div className="flex gap-2 text-2xl font-bold" style={{ color: style.text }}>
        <span className="w-10 h-10 flex items-center justify-center bg-white rounded shadow-sm">
          {gan}
        </span>
        <span className="w-10 h-10 flex items-center justify-center bg-white rounded shadow-sm">
          {zhi}
        </span>
      </div>
    </div>
  );
}

/**
 * 八字排盘展示组件
 */
function BaziDisplay({ data }: BaziDisplayProps) {
  const { themeName, theme } = useTheme();

  // 获取当前主题的五行配置
  const wuXingConfig = getWuXingConfig(themeName);

  // 获取文字颜色配置
  const getTextColors = () => {
    if (themeName === 'cyberpunk') {
      return {
        title: '#E0E0E0',
        subtitle: '#B0B0B0',
        sectionTitle: '#E0E0E0',
        cardBg: '#1A1A1A',
        textSecondary: '#B0B0B0',
        textTertiary: '#999999',
      };
    }
    if (themeName === 'minimal') {
      return {
        title: '#111827',
        subtitle: '#6B7280',
        sectionTitle: '#1F2937',
        cardBg: '#FFFFFF',
        textSecondary: '#4B5563',
        textTertiary: '#6B7280',
      };
    }
    // chinese (default)
    return {
      title: '#111827',
      subtitle: '#6B7280',
      sectionTitle: '#1F2937',
      cardBg: '#FFFFFF',
      textSecondary: '#4B5563',
      textTertiary: '#6B7280',
    };
  };

  const textColors = getTextColors();

  // 计算五行最大值（用于进度条比例）
  const maxWuXing = Math.max(
    data.wuXing.metal,
    data.wuXing.wood,
    data.wuXing.water,
    data.wuXing.fire,
    data.wuXing.earth,
    4 // 最小最大值为4，避免全是0时分母为0
  );

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 transition-colors duration-300" style={{ color: textColors.title }}>
          八字排盘
        </h3>
        <p className="text-sm transition-colors duration-300" style={{ color: textColors.subtitle }}>
          计算时间：{new Date(data.calculatedAt).toLocaleString('zh-CN')}
          {' '}| 耗时：{data.calculationTime}ms
        </p>
      </div>

      {/* 四柱八字 */}
      <div className="rounded-lg p-6 shadow-md transition-colors duration-300" style={{ backgroundColor: textColors.cardBg }}>
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300" style={{ color: textColors.sectionTitle }}>
          <span className="w-1 h-6 rounded" style={{ backgroundColor: theme.colors.primary }}></span>
          四柱八字
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GanZhiCard label="年柱" gan={data.siZhu.year.gan} zhi={data.siZhu.year.zhi} theme={themeName} />
          <GanZhiCard label="月柱" gan={data.siZhu.month.gan} zhi={data.siZhu.month.zhi} theme={themeName} />
          <GanZhiCard label="日柱" gan={data.siZhu.day.gan} zhi={data.siZhu.day.zhi} theme={themeName} />
          <GanZhiCard label="时柱" gan={data.siZhu.hour.gan} zhi={data.siZhu.hour.zhi} theme={themeName} />
        </div>

        {/* 真太阳时说明 */}
        <div
          className="mt-4 p-3 rounded border transition-colors duration-300"
          style={{
            backgroundColor: themeName === 'cyberpunk' ? '#0A1A2A' : '#EFF6FF',
            borderColor: themeName === 'cyberpunk' ? '#00FFFF' : '#BFDBFE',
          }}
        >
          <p
            className="text-sm"
            style={{ color: themeName === 'cyberpunk' ? '#00FFFF' : '#1E40AF' }}
          >
            <span className="font-semibold">真太阳时：</span>
            {new Date(data.trueSolarTime).toLocaleString('zh-CN')}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: themeName === 'cyberpunk' ? '#00CCCC' : '#3B82F6' }}
          >
            * 已根据出生地经纬度和时区进行校正
          </p>
        </div>
      </div>

      {/* 五行强弱 */}
      <div className="rounded-lg p-6 shadow-md transition-colors duration-300" style={{ backgroundColor: textColors.cardBg }}>
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300" style={{ color: textColors.sectionTitle }}>
          <span className="w-1 h-6 rounded" style={{ backgroundColor: theme.colors.secondary }}></span>
          五行强弱
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WuXingBar
            label={wuXingConfig.metal.name}
            value={data.wuXing.metal}
            max={maxWuXing}
            config={wuXingConfig.metal}
          />
          <WuXingBar
            label={wuXingConfig.wood.name}
            value={data.wuXing.wood}
            max={maxWuXing}
            config={wuXingConfig.wood}
          />
          <WuXingBar
            label={wuXingConfig.water.name}
            value={data.wuXing.water}
            max={maxWuXing}
            config={wuXingConfig.water}
          />
          <WuXingBar
            label={wuXingConfig.fire.name}
            value={data.wuXing.fire}
            max={maxWuXing}
            config={wuXingConfig.fire}
          />
          <div className="md:col-span-2">
            <WuXingBar
              label={wuXingConfig.earth.name}
              value={data.wuXing.earth}
              max={maxWuXing}
              config={wuXingConfig.earth}
            />
          </div>
        </div>

        {/* 五行分析摘要 */}
        <div
          className="mt-4 p-3 rounded border transition-colors duration-300"
          style={{
            backgroundColor: themeName === 'cyberpunk' ? '#1A0D0A' : '#FFFBEB',
            borderColor: themeName === 'cyberpunk' ? '#FF6600' : '#FDE68A',
          }}
        >
          <p
            className="text-sm"
            style={{ color: themeName === 'cyberpunk' ? '#FF6600' : '#92400E' }}
          >
            <span className="font-semibold">五行分析：</span>
            {Object.entries(data.wuXing).reduce((max, [key, value]) =>
              value > max.value ? { key, value } : max,
              { key: 'metal', value: 0 }
            ).key === 'metal' && '金'}
            {Object.entries(data.wuXing).reduce((max, [key, value]) =>
              value > max.value ? { key, value } : max,
              { key: 'metal', value: 0 }
            ).key === 'wood' && '木'}
            {Object.entries(data.wuXing).reduce((max, [key, value]) =>
              value > max.value ? { key, value } : max,
              { key: 'metal', value: 0 }
            ).key === 'water' && '水'}
            {Object.entries(data.wuXing).reduce((max, [key, value]) =>
              value > max.value ? { key, value } : max,
              { key: 'metal', value: 0 }
            ).key === 'fire' && '火'}
            {Object.entries(data.wuXing).reduce((max, [key, value]) =>
              value > max.value ? { key, value } : max,
              { key: 'metal', value: 0 }
            ).key === 'earth' && '土'}
            最旺（
            {Math.max(...Object.values(data.wuXing))}
            个），
            {Object.entries(data.wuXing).reduce((min, [key, value]) =>
              value < min.value ? { key, value } : min,
              { key: 'metal', value: Infinity }
            ).key === 'metal' && '金'}
            {Object.entries(data.wuXing).reduce((min, [key, value]) =>
              value < min.value ? { key, value } : min,
              { key: 'metal', value: Infinity }
            ).key === 'wood' && '木'}
            {Object.entries(data.wuXing).reduce((min, [key, value]) =>
              value < min.value ? { key, value } : min,
              { key: 'metal', value: Infinity }
            ).key === 'water' && '水'}
            {Object.entries(data.wuXing).reduce((min, [key, value]) =>
              value < min.value ? { key, value } : min,
              { key: 'metal', value: Infinity }
            ).key === 'fire' && '火'}
            {Object.entries(data.wuXing).reduce((min, [key, value]) =>
              value < min.value ? { key, value } : min,
              { key: 'metal', value: Infinity }
            ).key === 'earth' && '土'}
            最弱（
            {Math.min(...Object.values(data.wuXing))}
            个）
          </p>
        </div>
      </div>

      {/* 大运信息 */}
      <div className="rounded-lg p-6 shadow-md transition-colors duration-300" style={{ backgroundColor: textColors.cardBg }}>
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300" style={{ color: textColors.sectionTitle }}>
          <span
            className="w-1 h-6 rounded"
            style={{ backgroundColor: themeName === 'cyberpunk' ? '#CC00FF' : '#8B5CF6' }}
          ></span>
          大运信息
        </h4>
        <div className="space-y-3">
          {/* 起运信息 */}
          <div
            className="flex items-center gap-4 p-3 rounded border transition-colors duration-300"
            style={{
              backgroundColor: themeName === 'cyberpunk' ? '#1A0A1A' : '#F5F3FF',
              borderColor: themeName === 'cyberpunk' ? '#CC00FF' : '#DDD6FE',
            }}
          >
            <div className="text-sm">
              <span className="transition-colors duration-300" style={{ color: textColors.textSecondary }}>起运年龄：</span>
              <span
                className="font-semibold"
                style={{ color: themeName === 'cyberpunk' ? '#CC00FF' : '#7C3AED' }}
              >
                {data.daYun.startAge} 岁
              </span>
            </div>
            <div className="text-sm">
              <span className="transition-colors duration-300" style={{ color: textColors.textSecondary }}>大运方向：</span>
              <span
                className="font-semibold"
                style={{ color: themeName === 'cyberpunk' ? '#CC00FF' : '#7C3AED' }}
              >
                {data.daYun.direction === 'forward' ? '顺行' : '逆行'}
              </span>
            </div>
          </div>

          {/* 大运周期列表 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.daYun.cycles.map((cycle, index) => (
              <div
                key={index}
                className="p-3 rounded border text-center transition-all duration-300 hover:scale-105"
                style={{
                  background: themeName === 'cyberpunk'
                    ? 'linear-gradient(135deg, #1A0A1A 0%, #2D0A2D 100%)'
                    : 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)',
                  borderColor: themeName === 'cyberpunk' ? '#CC00FF' : '#DDD6FE',
                }}
              >
                <div
                  className="text-lg font-bold"
                  style={{ color: themeName === 'cyberpunk' ? '#CC00FF' : '#7C3AED' }}
                >
                  {cycle.ganZhi}
                </div>
                <div className="text-xs mt-1 transition-colors duration-300" style={{ color: textColors.textSecondary }}>
                  {cycle.age} 岁
                </div>
                <div className="text-xs transition-colors duration-300" style={{ color: textColors.textTertiary }}>
                  {cycle.years[0]}-{cycle.years[1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 大运说明 */}
        <div
          className="mt-4 p-3 rounded border transition-colors duration-300"
          style={{
            backgroundColor: themeName === 'cyberpunk' ? '#1A0A1A' : '#F5F3FF',
            borderColor: themeName === 'cyberpunk' ? '#CC00FF' : '#DDD6FE',
          }}
        >
          <p
            className="text-sm"
            style={{ color: themeName === 'cyberpunk' ? '#E0B0FF' : '#6D28D9' }}
          >
            <span className="font-semibold">大运说明：</span>
            每 10 年为一个大运周期，从起运年龄开始计算。
            大运影响人生各阶段的运势走向。
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 导出优化后的组件（使用 React.memo 避免不必要的重渲染）
 */
const MemoizedBaziDisplay = memo(BaziDisplay);

// 同时支持命名导出和默认导出
export { MemoizedBaziDisplay as BaziDisplay };
export default MemoizedBaziDisplay;
