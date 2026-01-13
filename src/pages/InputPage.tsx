/**
 * 输入信息页面
 * 用户输入出生信息的页面，调用真实 AI 分析
 */

import { useState } from 'react';
import { InputForm } from '@/components/InputForm';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import type { BirthData } from '@/types';
import { useNavigate } from 'react-router-dom';
import { calculateBazi } from '@/utils/bazi/calculator';
import { quickAnalyze } from '@/services/aiClient';
import { addHistoryRecord } from '@/services/edgeFunctions';
import { useTheme } from '@/hooks/useTheme';
import { getInputPageColors } from '@/utils/themeColors';

export function InputPage() {
  const { themeName } = useTheme();
  const colors = getInputPageColors(themeName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [startTime, setStartTime] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (data: BirthData) => {
    setIsLoading(true);
    setError(null);
    setStartTime(Date.now());

    try {
      setStatus('正在计算八字...');
      setProgress(10);
      const baziResult = calculateBazi(data);
      setProgress(20);

      setStatus('正在生成 K 线数据...');
      setProgress(30);
      const { generateKLineData, generateTurningPoints } = await import('@/utils/kline');
      const klineData = generateKLineData(baziResult);
      const turningPoints = generateTurningPoints(baziResult, klineData);
      setProgress(50);

      setStatus('正在调用 AI 分析...');
      setProgress(60);
      const aiResult = await quickAnalyze(baziResult);

      if (!aiResult.success) {
        throw new Error(aiResult.error || 'AI 分析失败');
      }

      setProgress(90);

      // 4. 合并结果：K 线数据（算法）+ 维度分析（AI）
      const finalResult = {
        klineData,
        dimensions: aiResult.data?.dimensions || {
          career: { score: 60, overview: '', details: [], advice: [] },
          wealth: { score: 60, overview: '', details: [], advice: [] },
          marriage: { score: 60, overview: '', details: [], advice: [] },
          health: { score: 60, overview: '', details: [], advice: [] },
          personality: { score: 60, overview: '', details: [], advice: [] },
          fengshui: { score: 60, overview: '', details: [], advice: [] },
        },
        turningPoints,
      };

      // 5. 保存结果到 sessionStorage
      const resultData = {
        birthData: data,
        baziResult,
        aiResult: finalResult,
        metadata: {
          analyzedAt: new Date(),
          duration: aiResult.duration,
          retries: aiResult.retries,
        },
      };

      sessionStorage.setItem('analysisResult', JSON.stringify(resultData));

      try {
        await addHistoryRecord({
          birthData: data,
          baziResult,
          dimensionsResult: aiResult.data?.dimensions || {
            career: { score: 60, overview: '', details: [], advice: [] },
            wealth: { score: 60, overview: '', details: [], advice: [] },
            marriage: { score: 60, overview: '', details: [], advice: [] },
            health: { score: 60, overview: '', details: [], advice: [] },
            personality: { score: 60, overview: '', details: [], advice: [] },
            fengshui: { score: 60, overview: '', details: [], advice: [] },
          },
          klineData: klineData.slice(0, 20), // 只保存前20年，减少存储大小
        });
      } catch (historyError) {
        console.warn('保存历史记录失败:', historyError);
        // 不阻塞主流程，即使历史记录保存失败也继续
      }

      setProgress(100);

      navigate('/analysis');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);

      // 可选：在这里添加 Toast 通知
    } finally {
      setIsLoading(false);
      setProgress(0);
      setStatus('');
      setStartTime(0);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h1 className="text-3xl font-bold text-center mb-2 text-gradient">
              输入出生信息
            </h1>
            <p className="text-center mb-6 transition-colors duration-300" style={{ color: colors.subtitle }}>
              请填写您的出生信息，我们将为您生成完整的人生分析报告
            </p>

            {/* 错误提示 */}
            {error && (
              <div className="mb-6 p-4 rounded-lg border transition-colors duration-300" style={{ backgroundColor: colors.errorBg, borderColor: colors.errorBorder }}>
                <p className="text-sm transition-colors duration-300" style={{ color: colors.errorText }}>
                  ⚠️ {error}
                </p>
                <p className="text-xs mt-2 transition-colors duration-300" style={{ color: colors.errorDesc }}>
                  请检查网络连接或稍后重试
                </p>
              </div>
            )}

            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* 分析进度条 */}
      <AnalysisProgress
        isAnalyzing={isLoading}
        progress={progress}
        status={status}
        startTime={startTime}
      />
    </div>
  );
}

export default InputPage;
