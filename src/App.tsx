import { useState, useMemo } from 'react';
import { InputForm } from './components/InputForm';
import { KLineChart, ThemeProvider } from './components/KLineChart';
import { BaziDisplay } from './components/AnalysisResult/BaziDisplay';
import { DimensionAnalysis } from './components/AnalysisResult/DimensionAnalysis';
import { ThemeSwitcher } from './components/ThemeSwitcher/ThemeSwitcher';
import { ShareCard, SocialShare } from './components/ShareCard';
import { HistoryList } from './components/History';
import { useTheme } from './hooks/useTheme';
import type { BirthData } from './types';
import type { BaziResult } from './types/bazi';
import type { KLineData, SixDimensions } from './types/kline';
import './index.css';

type TabType = 'input' | 'chart' | 'bazi' | 'dimensions' | 'share' | 'history';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BirthData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const { theme } = useTheme();

  // 生成模拟 K 线数据（100年）- 基于出生年份
  const mockKLineData: KLineData[] = useMemo(() => {
    const data: KLineData[] = [];
    let baseValue = 50;
    const birthYear = result ? new Date(result.birthDate).getFullYear() : 2026;

    for (let year = birthYear; year < birthYear + 100; year++) {
      const open = baseValue;
      const change = Math.random() * 15 - 5;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;

      data.push({
        year,
        open: Number(open.toFixed(2)),
        close: Number(close.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        volume: Math.random() * 100,
      });

      baseValue = close;
    }

    return data;
  }, [result]);

  // 生成模拟八字数据 - 基于出生年份
  const mockBaziData: BaziResult = useMemo(() => {
    const birthYear = result ? new Date(result.birthDate).getFullYear() : 2026;

    // 生成大运周期（基于出生年份，8岁起运）
    const generateDaYunCycles = (yearOfBirth: number) => {
      const cycles: { age: number; ganZhi: string; years: number[] }[] = [];
      const ganZhiList = ['丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉', '甲戌'];

      ganZhiList.forEach((ganZhi, index) => {
        const age = 8 + index * 10;
        cycles.push({
          age,
          ganZhi,
          years: [yearOfBirth + age, yearOfBirth + age + 9],
        });
      });

      return cycles;
    };

    return {
      siZhu: {
        year: { gan: '甲' as const, zhi: '子' as const },
        month: { gan: '丙' as const, zhi: '寅' as const },
        day: { gan: '戊' as const, zhi: '辰' as const },
        hour: { gan: '庚' as const, zhi: '申' as const },
      },
      wuXing: {
        metal: 3,
        wood: 4,
        water: 2,
        fire: 1,
        earth: 4,
      },
      daYun: {
        startAge: 8,
        direction: 'forward' as const,
        cycles: generateDaYunCycles(birthYear),
      },
      trueSolarTime: new Date(`${birthYear}-01-01T12:00:00`),
      calculatedAt: new Date(),
      calculationTime: 150,
    };
  }, [result]);

  // 生成模拟六维度数据
  const mockDimensionsData: SixDimensions = useMemo(() => ({
    career: {
      score: 85,
      overview: '您的事业运势强劲，具有领导才能和创业精神。在职场上容易获得晋升，适合从事管理、金融或技术类工作。',
      details: [
        '具备出色的领导能力和决策力，能够带领团队取得成功',
        '工作态度认真负责，执行力强，容易获得上级赏识',
        '创业运势良好，适合在35-45岁期间创业',
        '贵人运旺，容易遇到帮助您事业发展的贵人',
        '需要注意工作与生活的平衡，避免过度劳累',
      ],
      advice: [
        '建议提升沟通协调能力，这将有助于您在职场中更进一步',
        '保持学习热情，不断更新知识和技能',
        '适当培养副业，增加收入来源',
        '注意身体健康，定期锻炼，保持良好状态',
      ],
    },
    wealth: {
      score: 78,
      overview: '您的财运总体良好，正财稳定，偏财运也不错。善于理财，但需要谨慎投资，避免贪心。',
      details: [
        '正财稳定，收入会随着年龄增长而提升',
        '偏财运不错，可以适当尝试投资理财',
        '40岁后将迎来财富积累的黄金期',
        '需要注意控制消费欲望，避免不必要的开支',
        '适合长期投资，短线投机需谨慎',
      ],
      advice: [
        '建议多元化投资，分散风险',
        '学习理财知识，提高财商',
        '控制消费，养成储蓄习惯',
        '避免高风险投资，稳健为主',
      ],
    },
    marriage: {
      score: 72,
      overview: '您的婚姻运势中等偏上，感情生活相对平稳。适合晚婚，需要多沟通理解。',
      details: [
        '感情专一，重视家庭，是个负责任的伴侣',
        '适合30岁左右结婚，早婚可能会影响事业发展',
        '配偶性格温和，家庭生活和谐',
        '需要注意控制脾气，多沟通理解',
        '子女运良好，晚年家庭幸福',
      ],
      advice: [
        '建议多与伴侣沟通，增进理解',
        '学会包容，避免因小事争吵',
        '保持浪漫，定期安排二人世界',
        '共同规划未来，建立共同目标',
      ],
    },
    health: {
      score: 68,
      overview: '您的健康运势一般，需要注意保养。年轻时透支身体，晚年可能会出现健康问题。',
      details: [
        '体质一般，容易感到疲劳',
        '需要注意肠胃和心血管健康',
        '35岁后需要定期体检',
        '运动量不足，建议增加锻炼',
        '睡眠质量需要改善',
      ],
      advice: [
        '建议每周至少运动3次，每次30分钟以上',
        '保持规律作息，避免熬夜',
        '注意饮食健康，少油少盐',
        '定期体检，早发现早治疗',
        '学会减压，保持良好心态',
      ],
    },
    personality: {
      score: 88,
      overview: '您性格开朗乐观，待人真诚，具有很强的人格魅力。但有时过于固执，需要学会变通。',
      details: [
        '性格积极向上，充满正能量',
        '待人真诚，朋友众多，人缘极佳',
        '有主见，不轻易被他人左右',
        '有时过于固执，需要学会变通',
        '责任感强，是可信赖的人',
      ],
      advice: [
        '建议学会倾听他人意见，避免固执己见',
        '保持开放心态，接受新观点',
        '适当表达情感，不要过于内敛',
        '培养耐心，避免冲动决策',
      ],
    },
    fengshui: {
      score: 75,
      overview: '您的风水运势良好，居住环境有利于事业和健康。可以通过调整布局来提升运势。',
      details: [
        '居住环境采光良好，空气流通',
        '办公桌朝向吉利，有利于事业发展',
        '卧室布局合理，睡眠质量较好',
        '可以通过摆放绿色植物提升财运',
        '南方适合放置红色物品，利于事业',
      ],
      advice: [
        '建议在办公桌左侧摆放绿植，提升财运',
        '保持居住环境整洁，避免杂乱',
        '床头不宜靠窗，以免影响睡眠',
        '可以在家中摆放水晶，提升正能量',
        '定期清理不必要的物品，保持空间通透',
      ],
    },
  }), []);

  const handleSubmit = async (data: BirthData) => {
    setIsLoading(true);

    // 模拟 API 调用
    setTimeout(() => {
      setResult(data);
      setIsLoading(false);
      setActiveTab('chart');
      console.log('提交的数据:', data);
    }, 2000);
  };

  const handleYearClick = (year: number, data: KLineData) => {
    console.log('点击年份:', year, data);
    alert(`查看 ${year} 年详细分析:\n\n运势: ${data.close.toFixed(2)}\n涨跌: ${((data.close - data.open) / data.open * 100).toFixed(2)}%`);
  };

  return (
    <div className="min-h-screen bg-background text-text">
      {/* 主题切换器 */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher mode="dropdown" />
      </div>

      <div className="container py-12">
        <h1 className="text-4xl font-bold text-center mb-4 text-gradient">
          人生 K 线
        </h1>
        <p className="text-center text-gray-600 mb-8">
          探索命运起伏，预见人生轨迹
        </p>

        {/* 标签页切换 */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'input'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            输入信息
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'chart'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            查看 K 线图
          </button>
          <button
            onClick={() => setActiveTab('bazi')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'bazi'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            八字排盘
          </button>
          <button
            onClick={() => setActiveTab('dimensions')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dimensions'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            六维度分析
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'share'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            生成分享卡片
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            历史记录
          </button>
        </div>

        {activeTab === 'input' && (
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">请输入您的出生信息</h2>
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="card max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">人生运势 K 线图（100年）</h2>
            <div className="bg-white rounded-lg p-6 shadow-inner">
              <ThemeProvider>
                {(theme) => (
                  <KLineChart
                    data={mockKLineData}
                    theme={theme}
                    onDataClick={handleYearClick}
                    height={600}
                  />
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
            <BaziDisplay data={mockBaziData} />
          </div>
        )}

        {activeTab === 'dimensions' && (
          <div className="card max-w-5xl mx-auto">
            <DimensionAnalysis data={mockDimensionsData} />
          </div>
        )}

        {activeTab === 'share' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6">生成分享卡片</h2>
              <p className="text-gray-600 mb-6">
                生成精美的分享卡片，分享到各大社交媒体平台
              </p>
              <ShareCard
                name="张三"
                birthDate="1990年1月1日（农历）"
                birthTime="午时"
                baziData={mockBaziData}
                dimensionsData={mockDimensionsData}
                klineData={mockKLineData}
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
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto">
            <HistoryList
              onRecordClick={(record) => {
                console.log('查看历史记录:', record);
                alert(`查看记录: ${record.birthData.name || '匿名'} - ${record.birthData.birthDate}`);
              }}
            />
          </div>
        )}

        {result && activeTab === 'input' && (
          <div className="card max-w-2xl mx-auto mt-8">
            <h3 className="text-xl font-semibold mb-4">提交成功！</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
