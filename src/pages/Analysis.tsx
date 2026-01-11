import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KLineChart, ThemeProvider } from '@/components/KLineChart';
import { BaziDisplay } from '@/components/AnalysisResult/BaziDisplay';
import { DimensionAnalysis } from '@/components/AnalysisResult/DimensionAnalysis';
import { ShareCard, SocialShare } from '@/components/ShareCard';
import { ExportButton } from '@/components/ExportButton';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import type { BirthData } from '@/types';
import type { BaziResult } from '@/types/bazi';
import type { KLineData, SixDimensions, TurningPoint as TurningPointType } from '@/types/kline';
import type { AIAnalysisResult } from '@/types';

interface AnalysisResultData {
  birthData: BirthData;
  baziResult: BaziResult;
  aiResult: AIAnalysisResult;
  metadata: {
    analyzedAt: Date;
    duration: number;
    retries: number;
  };
}

export function Analysis() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const toast = useToast();
  const [analysisData, setAnalysisData] = useState<AnalysisResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'chart' | 'bazi' | 'dimensions' | 'share' | 'export'
  >('chart');

  // 从 sessionStorage 加载数据
  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // 转换日期字符串回 Date 对象
        data.metadata.analyzedAt = new Date(data.metadata.analyzedAt);
        data.birthData.submittedAt = new Date(data.birthData.submittedAt);
        data.baziResult.trueSolarTime = new Date(data.baziResult.trueSolarTime);
        data.baziResult.calculatedAt = new Date(data.baziResult.calculatedAt);

        setAnalysisData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('解析分析结果失败:', error);
        navigate('/input');
      }
    } else {
      // 如果没有数据，返回输入页面
      navigate('/input');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">正在加载分析结果...</div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  const { birthData, baziResult, aiResult, metadata } = analysisData;

  // 使用 AI 生成或模拟数据
  const klineData: KLineData[] = aiResult.klineData || [];
  const dimensionsData: SixDimensions = aiResult.dimensions || {
    career: { score: 0, overview: '', details: [], advice: [] },
    wealth: { score: 0, overview: '', details: [], advice: [] },
    marriage: { score: 0, overview: '', details: [], advice: [] },
    health: { score: 0, overview: '', details: [], advice: [] },
    personality: { score: 0, overview: '', details: [], advice: [] },
    fengshui: { score: 0, overview: '', details: [], advice: [] },
  };

  const turningPoints: TurningPointType[] = aiResult.turningPoints || [];

  const handleYearClick = (year: number, data: KLineData) => {
    // 安全检查：确保数据存在且有效
    if (!data || typeof data.open !== 'number' || typeof data.close !== 'number') {
      console.warn(`${year}年数据无效或缺失`);
      toast.warning(`${year}年数据无效或缺失`, '数据错误');
      return;
    }

    const change = ((data.close - data.open) / data.open * 100).toFixed(2);
    const direction = data.close >= data.open ? '上涨' : '下跌';
    const changePercent = Math.abs(parseFloat(change));

    toast.info(
      `${year}年运势分析\n\n年初指数: ${data.open.toFixed(2)}\n年末指数: ${data.close.toFixed(2)}\n${direction}: ${changePercent}%`,
      `${year}年运势`
    );
  };

  const handlePointClick = (point: TurningPointType) => {
    const typeText = point.type === 'peak' ? '运势高峰' : point.type === 'trough' ? '运势低谷' : '重大转折';

    toast.success(
      `原因: ${point.reason}\n建议: ${point.advice}\n评分: ${point.score}/100`,
      `${point.year}年 - ${typeText}`
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/input')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← 返回重新输入
        </button>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            人生 K 线分析报告
          </h1>
          <p className="text-gray-600">
            {birthData.name || '匿名'} · {birthData.birthDate}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            分析耗时: {metadata.duration}ms · 重试次数: {metadata.retries}
          </p>
        </div>

        {/* 标签页切换 */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <TabButton active={activeTab === 'chart'} onClick={() => setActiveTab('chart')}>
            K 线图
          </TabButton>
          <TabButton active={activeTab === 'bazi'} onClick={() => setActiveTab('bazi')}>
            八字排盘
          </TabButton>
          <TabButton active={activeTab === 'dimensions'} onClick={() => setActiveTab('dimensions')}>
            六维度分析
          </TabButton>
          <TabButton active={activeTab === 'share'} onClick={() => setActiveTab('share')}>
            分享卡片
          </TabButton>
          <TabButton active={activeTab === 'export'} onClick={() => setActiveTab('export')}>
            导出 PDF
          </TabButton>
        </div>

        {/* 内容区域 */}
        {activeTab === 'chart' && (
          <div className="card max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">人生运势 K 线图（100年）</h2>
            <div className="bg-white rounded-lg p-6 shadow-inner">
              <ThemeProvider>
                {(themeValue) => (
                  <>
                    <KLineChart
                      data={klineData}
                      theme={themeValue}
                      onDataClick={handleYearClick}
                      turningPoints={turningPoints}
                      onTurningPointClick={handlePointClick}
                      height={600}
                    />
                  </>
                )}
              </ThemeProvider>
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              💡 点击图表中的任意年份查看详细分析
            </p>
          </div>
        )}

        {activeTab === 'bazi' && (
          <div className="card max-w-4xl mx-auto">
            <BaziDisplay data={baziResult} />
          </div>
        )}

        {activeTab === 'dimensions' && (
          <div className="card max-w-5xl mx-auto">
            <DimensionAnalysis data={dimensionsData} />
          </div>
        )}

        {activeTab === 'share' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：分享卡片 */}
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6">生成分享卡片</h2>
              <p className="text-gray-600 mb-6">
                生成精美的分享卡片，分享到各大社交媒体平台
              </p>
              <ShareCard
                name={birthData.name || '张三'}
                birthDate={birthData.birthDate}
                birthTime={birthData.birthTime}
                baziData={baziResult}
                dimensionsData={dimensionsData}
                klineData={klineData}
                themeName={theme.name}
                onDownloadComplete={(dataUrl) => {
                  console.log('分享卡片生成成功', dataUrl);
                  alert('分享卡片已生成并下载！');
                }}
                onDownloadError={(error) => {
                  console.error('生成失败:', error);
                  alert(`生成失败: ${error.message}`);
                }}
              />
            </div>

            {/* 右侧：社交分享 */}
            <div className="card">
              <SocialShare
                shareData={{
                  title: '🔮 我的人生K线图',
                  description: '通过八字命理和AI分析，探索我的人生轨迹！事业财运婚姻健康，一目了然。你也来看看吧！',
                  url: typeof window !== 'undefined' ? window.location.href : '',
                  hashtags: ['人生K线', '八字命理', 'AI分析', '运势预测'],
                }}
                onShareSuccess={(platform) => {
                  console.log('分享成功:', platform);
                }}
                onShareError={(platform, error) => {
                  console.error('分享失败:', platform, error);
                  alert(`分享失败: ${error.message}`);
                }}
                showCopyLink={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6">导出完整分析报告</h2>
              <p className="text-gray-600 mb-6">
                生成包含八字排盘、K线图、六维度分析的完整 PDF 报告
              </p>
               <ExportButton
                  name={birthData.name || '匿名'}
                  birthDate={birthData.birthDate}
                  birthTime={birthData.birthTime}
                  baziData={baziResult}
                  dimensionsData={dimensionsData}
                  themeName={theme.name}
                  label="生成并下载报告"
                  onExportComplete={() => {
                    console.log('报告生成完成');
                    toast.success('报告已生成并下载！', '成功');
                  }}
                  onExportError={(error) => {
                    console.error('导出失败:', error);
                    toast.error(`生成报告失败: ${error.message}`, '错误');
                  }}
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 标签页按钮
 */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export default Analysis;
