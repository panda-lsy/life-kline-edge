/**
 * 首页
 * 应用入口页面，展示简介和快速开始
 */

import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, FileText, Users, Zap } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

/**
 * 获取首页颜色配置
 */
function getHomePageColors(themeName: string) {
  if (themeName === 'cyberpunk') {
    return {
      heroText: '#E0E0E0',
      heroDesc: '#B0B0B0',
      cardBg: '#1A1A1A',
      cardTitle: '#E0E0E0',
      cardDesc: '#B0B0B0',
      ctaBg: '#1A1A1A',
      ctaTitle: '#E0E0E0',
      ctaDesc: '#B0B0B0',
      footerText: '#999999',
      // Feature icons
      blueBg: '#0A0A2A',
      blueIcon: '#00FFFF',
      purpleBg: '#1A0A2A',
      purpleIcon: '#FF00FF',
      pinkBg: '#2A0A1A',
      pinkIcon: '#FF0066',
      yellowBg: '#2A1A0A',
      yellowIcon: '#FFD700',
      greenBg: '#0A2A0A',
      greenIcon: '#00FF00',
      indigoBg: '#0A0A2A',
      indigoIcon: '#9966FF',
    };
  }

  if (themeName === 'minimal') {
    return {
      heroText: '#111827',
      heroDesc: '#4B5563',
      cardBg: '#FFFFFF',
      cardTitle: '#111827',
      cardDesc: '#6B7280',
      ctaBg: '#FFFFFF',
      ctaTitle: '#111827',
      ctaDesc: '#4B5563',
      footerText: '#6B7280',
      // Feature icons
      blueBg: '#EFF6FF',
      blueIcon: '#2563EB',
      purpleBg: '#F5F3FF',
      purpleIcon: '#9333EA',
      pinkBg: '#FDF2F8',
      pinkIcon: '#DB2777',
      yellowBg: '#FEF9C3',
      yellowIcon: '#CA8A04',
      greenBg: '#F0FDF4',
      greenIcon: '#16A34A',
      indigoBg: '#EEF2FF',
      indigoIcon: '#4F46E5',
    };
  }

  // chinese (default)
  return {
    heroText: '#1F2937',
    heroDesc: '#4B5563',
    cardBg: '#FFFFFF',
    cardTitle: '#111827',
    cardDesc: '#6B7280',
    ctaBg: '#FFFFFF',
    ctaTitle: '#111827',
    ctaDesc: '#4B5563',
    footerText: '#6B7280',
    // Feature icons
    blueBg: '#EFF6FF',
    blueIcon: '#2563EB',
    purpleBg: '#F5F3FF',
    purpleIcon: '#9333EA',
    pinkBg: '#FDF2F8',
    pinkIcon: '#DB2777',
    yellowBg: '#FEF9C3',
    yellowIcon: '#CA8A04',
    greenBg: '#F0FDF4',
    greenIcon: '#16A34A',
    indigoBg: '#EEF2FF',
    indigoIcon: '#4F46E5',
  };
}

export function HomePage() {
  const { themeName } = useTheme();
  const colors = getHomePageColors(themeName);

  const getBackgroundClass = () => {
    switch (themeName) {
      case 'cyberpunk':
        return 'min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-pink-950';
      case 'minimal':
        return 'min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200';
      default:
        return 'min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
    }
  };

  const getHeroTextClass = () => {
    switch (themeName) {
      case 'cyberpunk':
        return 'text-white';
      case 'minimal':
        return 'text-gray-900';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className={getBackgroundClass()}>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className={`w-12 h-12 mr-3 ${getHeroTextClass()}`} />
            <h1 className={`text-5xl md:text-6xl font-bold ${themeName === 'cyberpunk' ? 'text-white' : 'text-gradient'}`}>
              人生 K 线
            </h1>
          </div>
          <p className={`text-xl md:text-2xl mb-4 transition-colors duration-300 ${themeName === 'cyberpunk' ? 'text-white' : ''}`} style={{ color: colors.heroText }}>
            探索命运起伏，预见人生轨迹
          </p>
          <p className={`text-base max-w-2xl mx-auto transition-colors duration-300 ${themeName === 'cyberpunk' ? 'text-gray-300' : ''}`} style={{ color: colors.heroDesc }}>
            结合传统八字命理与现代 AI 技术，为您呈现可视化的命运分析报告
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="K 线图分析"
            description="可视化展示 100 年人生运势起伏，把握命运趋势"
            color="blue"
            colors={colors}
            themeName={themeName}
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="八字排盘"
            description="精准计算八字排盘，深入解析五行强弱"
            color="purple"
            colors={colors}
            themeName={themeName}
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="六维分析"
            description="事业、财富、婚姻、健康、性格、风水全方位分析"
            color="pink"
            colors={colors}
            themeName={themeName}
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI 驱动"
            description="基于传统命理与现代 AI 智能分析"
            color="yellow"
            colors={colors}
            themeName={themeName}
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="即时生成"
            description="秒级响应，快速获取完整分析报告"
            color="green"
            colors={colors}
            themeName={themeName}
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="导出报告"
            description="支持 PDF 导出和社交分享，保存您的分析结果"
            color="indigo"
            colors={colors}
            themeName={themeName}
          />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className={`rounded-2xl shadow-xl p-8 max-w-2xl mx-auto transition-all duration-300 ${themeName === 'cyberpunk' ? 'border-2 border-purple-500' : ''}`} style={{ backgroundColor: colors.ctaBg }}>
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${themeName === 'cyberpunk' ? 'text-white' : ''}`} style={{ color: colors.ctaTitle }}>
              开始探索您的人生轨迹
            </h2>
            <p className={`mb-6 transition-colors duration-300 ${themeName === 'cyberpunk' ? 'text-gray-300' : ''}`} style={{ color: colors.ctaDesc }}>
              输入出生信息，即可获得完整的八字分析和人生 K 线图
            </p>
            <Link
              to="/input"
              className={`inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl ${themeName === 'cyberpunk' ? 'hover:bg-primary/90 hover:shadow-cyan-500/50' : 'hover:bg-primary/90 hover:shadow-xl'}`}
            >
              立即开始
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center mt-16 text-sm transition-colors duration-300 ${themeName === 'cyberpunk' ? 'text-gray-400' : ''}`} style={{ color: colors.footerText }}>
          <p>由阿里云 ESA 提供加速支持</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 功能卡片
 */
function FeatureCard({
  icon,
  title,
  description,
  color,
  colors,
  themeName,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'pink' | 'yellow' | 'green' | 'indigo';
  colors: ReturnType<typeof getHomePageColors>;
  themeName: string;
}) {
  const colorConfig = {
    blue: { bg: colors.blueBg, icon: colors.blueIcon },
    purple: { bg: colors.purpleBg, icon: colors.purpleIcon },
    pink: { bg: colors.pinkBg, icon: colors.pinkIcon },
    yellow: { bg: colors.yellowBg, icon: colors.yellowIcon },
    green: { bg: colors.greenBg, icon: colors.greenIcon },
    indigo: { bg: colors.indigoBg, icon: colors.indigoIcon },
  };

  const config = colorConfig[color];
  const isCyberpunk = themeName === 'cyberpunk';

  return (
    <div
      className={`rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 ${isCyberpunk ? 'border border-gray-700' : ''}`}
      style={{ backgroundColor: colors.cardBg }}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${isCyberpunk ? 'border border-gray-600' : ''}`}
        style={{ backgroundColor: config.bg }}
      >
        <div style={{ color: config.icon }}>
          {icon}
        </div>
      </div>
      <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isCyberpunk ? 'text-white' : ''}`} style={{ color: colors.cardTitle }}>
        {title}
      </h3>
      <p className={`transition-colors duration-300 ${isCyberpunk ? 'text-gray-300' : ''}`} style={{ color: colors.cardDesc }}>
        {description}
      </p>
    </div>
  );
}

export default HomePage;
