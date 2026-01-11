/**
 * AI 分析进度条组件
 * 显示 AI 分析的进度和状态
 */

import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface AnalysisProgressProps {
  /** 分析是否正在进行 */
  isAnalyzing: boolean;
  /** 当前进度（0-100） */
  progress?: number;
  /** 当前状态描述 */
  status?: string;
  /** 分析开始时间 */
  startTime?: number;
}

export function AnalysisProgress({
  isAnalyzing,
  progress: externalProgress,
  status: externalStatus,
  startTime,
}: AnalysisProgressProps) {
  const { themeName } = useTheme();
  const [internalProgress, setInternalProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // 实时更新已用时间
  useEffect(() => {
    if (!isAnalyzing || !startTime) {
      setElapsed(0);
      return;
    }

    const timeoutId = setTimeout(() => {
      setElapsed(Date.now() - startTime);
    }, 0);

    const intervalId = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isAnalyzing, startTime]);

  // 如果没有外部进度，自动模拟进度
  useEffect(() => {
    if (!isAnalyzing) {
      setInternalProgress(0);
      return;
    }

    if (externalProgress !== undefined) {
      setInternalProgress(externalProgress);
      return;
    }

    const timeoutId = setTimeout(() => {
      const intervalId = setInterval(() => {
        setInternalProgress((prev) => {
          if (prev < 30) return prev + 5;
          if (prev < 60) return prev + 3;
          if (prev < 80) return prev + 2;
          if (prev < 95) return prev + 1;
          return 95;
        });
      }, 100);

      return () => clearInterval(intervalId);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isAnalyzing, externalProgress]);

  const displayProgress = externalProgress ?? internalProgress;
  const displayStatus = externalStatus ?? (isAnalyzing
    ? displayProgress < 30 ? '📅 正在计算八字...'
    : displayProgress < 60 ? '📈 正在生成 K 线数据...'
    : displayProgress < 80 ? '🤖 正在调用 AI 分析...'
    : '⏳ AI 正在生成详细分析...'
    : '');

  // 计算已用时间（秒）
  const elapsedSeconds = (elapsed / 1000).toFixed(1);

  if (!isAnalyzing) return null;

  // 根据主题定义颜色
  const getGradientColors = () => {
    switch (themeName) {
      case 'cyberpunk':
        return {
          from: '#FF00FF',
          to: '#00FFFF',
          bg: '#1A1A1A',
          text: '#E0E0E0',
          subtext: '#9CA3AF',
          track: '#2A2A2A',
          tipBg: '#0A1A2A',
          tipText: '#00FFFF',
          tipBorder: '#00FFFF',
        };
      case 'minimal':
        return {
          from: '#2563EB',
          to: '#8B5CF6',
          bg: '#FFFFFF',
          text: '#0F172A',
          subtext: '#64748B',
          track: '#E5E7EB',
          tipBg: '#EFF6FF',
          tipText: '#1E40AF',
          tipBorder: '#BFDBFE',
        };
      default: // chinese
        return {
          from: '#C8102E',
          to: '#FFD700',
          bg: '#FFFFFF',
          text: '#1F2937',
          subtext: '#6B7280',
          track: '#E5E7EB',
          tipBg: '#FEF7F0',
          tipText: '#B91C1C',
          tipBorder: '#FCA5A5',
        };
    }
  };

  const colors = getGradientColors();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className="rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 transition-colors duration-300"
        style={{ backgroundColor: colors.bg }}
      >
        {/* 标题 */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl font-bold mb-2 transition-colors duration-300"
            style={{ color: colors.text }}
          >
            正在分析您的八字...
          </h2>
          <p
            className="transition-colors duration-300"
            style={{ color: colors.subtext }}
          >
            {displayStatus}
          </p>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div
            className="w-full rounded-full h-4 overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: colors.track }}
          >
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${displayProgress}%`,
                background: `linear-gradient(90deg, ${colors.from} 0%, ${colors.to} 100%)`,
              }}
            />
          </div>
        </div>

        {/* 进度百分比 */}
        <div className="text-center mb-4">
          <span
            className="text-2xl font-bold transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, ${colors.from} 0%, ${colors.to} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {displayProgress}%
          </span>
        </div>

        {/* 已用时间 */}
        {startTime && (
          <div
            className="text-center text-sm transition-colors duration-300"
            style={{ color: colors.subtext }}
          >
            已用时: {elapsedSeconds} 秒
          </div>
        )}

        {/* 提示信息 */}
        <div
          className="mt-6 p-4 rounded-lg border transition-colors duration-300"
          style={{
            backgroundColor: colors.tipBg,
            borderColor: colors.tipBorder,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div
              className="text-sm transition-colors duration-300"
              style={{ color: colors.tipText }}
            >
              <p className="font-semibold mb-1">提示：</p>
              <ul className="space-y-1 text-xs">
                <li>• AI 分析需要 10-30 秒，请耐心等待</li>
                <li>• 分析期间请勿关闭浏览器</li>
                <li>• K 线数据已由算法快速生成</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisProgress;
