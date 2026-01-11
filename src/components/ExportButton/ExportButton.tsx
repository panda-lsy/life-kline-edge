/**
 * 导出按钮组件
 * 提供打印/导出报告功能
 */

import { useState } from 'react';
import { Download, Printer, FileText } from 'lucide-react';

interface ExportButtonProps {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  baziData?: any;
  dimensionsData?: any;
  themeName?: string;
  label?: string;
}

export function ExportButton({
  name = '张三',
  birthDate = '2000-01-01',
  birthTime = '12:00',
  baziData,
  dimensionsData,
  themeName = 'chinese',
  label = '生成并下载 PDF 报告',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMode, setExportMode] = useState<'print' | 'pdf'>('print');

  const handlePrint = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 100);
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const content = generateReportContent();
      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `人生K线分析报告_${name}_${birthDate}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('报告已下载！');
    } catch (error) {
      console.error('导出失败:', error);
      alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const generateReportContent = () => {
    const themeStyles = themeName === 'cyberpunk' ? getCyberpunkStyles() : getDefaultStyles();

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>人生K线分析报告 - ${name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif;
      line-height: 1.6;
      padding: 40px;
      background: ${themeStyles.background};
      color: ${themeStyles.text};
    }
    
    .report-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${themeStyles.primary};
    }
    
    .report-title {
      font-size: 32px;
      font-weight: bold;
      color: ${themeStyles.primary};
      margin-bottom: 10px;
    }
    
    .report-subtitle {
      font-size: 16px;
      color: ${themeStyles.text};
      opacity: 0.8;
    }
    
    .report-section {
      margin-bottom: 30px;
      padding: 20px;
      background: ${themeStyles.surface};
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: ${themeStyles.primary};
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-content {
      margin-bottom: 20px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 15px;
    }
    
    .info-item {
      padding: 10px;
      background: ${themeStyles.background};
      border-left: 4px solid ${themeStyles.primary};
      border-radius: 4px;
    }
    
    .info-label {
      font-weight: bold;
      color: ${themeStyles.primary};
      margin-bottom: 5px;
    }
    
    .dimension-card {
      padding: 15px;
      margin-bottom: 15px;
      border: 1px solid ${themeStyles.border};
      border-radius: 8px;
    }
    
    .dimension-score {
      font-size: 24px;
      font-weight: bold;
      color: ${themeStyles.primary};
      margin-bottom: 10px;
    }
    
    .dimension-overview {
      margin-bottom: 10px;
      color: ${themeStyles.text};
    }
    
    .dimension-advice {
      font-style: italic;
      color: ${themeStyles.text};
      opacity: 0.8;
    }
    
    .bazi-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .bazi-pillar {
      padding: 15px;
      background: ${themeStyles.primary};
      color: white;
      border-radius: 8px;
    }
    
    .pillar-title {
      font-size: 14px;
      margin-bottom: 5px;
      opacity: 0.9;
    }
    
    .pillar-content {
      font-size: 24px;
      font-weight: bold;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid ${themeStyles.border};
      color: ${themeStyles.text};
      opacity: 0.6;
      font-size: 14px;
    }
    
    .kline-placeholder {
      background: ${themeStyles.background};
      padding: 40px;
      border: 2px dashed ${themeStyles.border};
      border-radius: 8px;
      text-align: center;
      color: ${themeStyles.text};
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="report-title">人生 K 线分析报告</div>
    <div class="report-subtitle">姓名：${name}</div>
    <div class="report-subtitle">出生：${birthDate} ${birthTime}</div>
    <div class="report-subtitle">生成时间：${new Date().toLocaleString('zh-CN')}</div>
  </div>

  ${baziData ? generateBaziSection(baziData) : ''}

  ${dimensionsData ? generateDimensionsSection(dimensionsData) : ''}

  <div class="report-section">
    <div class="section-title">
      <span>📈</span> 人生 K 线图
    </div>
    <div class="kline-placeholder">
      请访问线上应用查看完整的交互式 K 线图
    </div>
  </div>

  <div class="footer">
    <p>本报告由人生 K 线分析系统生成</p>
    <p>基于传统八字命理与现代 AI 技术分析</p>
    <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
  </div>
</body>
</html>
    `;
  };

  const generateBaziSection = (data: any) => {
    const { siZhu } = data || {};
    return `
  <div class="report-section">
    <div class="section-title">
      <span>🌟</span> 八字排盘
    </div>
    <div class="bazi-section">
      <div class="bazi-pillar">
        <div class="pillar-title">年柱</div>
        <div class="pillar-content">${siZhu.year?.gan || ''}${siZhu.year?.zhi || ''}</div>
      </div>
      <div class="bazi-pillar">
        <div class="pillar-title">月柱</div>
        <div class="pillar-content">${siZhu.month?.gan || ''}${siZhu.month?.zhi || ''}</div>
      </div>
      <div class="bazi-pillar">
        <div class="pillar-title">日柱</div>
        <div class="pillar-content">${siZhu.day?.gan || ''}${siZhu.day?.zhi || ''}</div>
      </div>
      <div class="bazi-pillar">
        <div class="pillar-title">时柱</div>
        <div class="pillar-content">${siZhu.hour?.gan || ''}${siZhu.hour?.zhi || ''}</div>
      </div>
    </div>
    <div class="section-content">
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">真太阳时</div>
          <div>${data.trueSolarTime || '-'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">起运年龄</div>
          <div>${data.daYun?.startAge || '-'}岁</div>
        </div>
      </div>
    </div>
  </div>
    `;
  };

  const generateDimensionsSection = (data: any) => {
    const dimensions = [
      { key: 'career', name: '事业运', icon: '💼' },
      { key: 'wealth', name: '财运', icon: '💰' },
      { key: 'marriage', name: '婚姻运', icon: '💕' },
      { key: 'health', name: '健康运', icon: '❤️' },
      { key: 'personality', name: '性格特质', icon: '🎭' },
      { key: 'fengshui', name: '风水运势', icon: '🏠' },
    ];

    return `
  <div class="report-section">
    <div class="section-title">
      <span>🎯</span> 六维度分析
    </div>
    <div class="info-grid">
      ${dimensions.map(dimension => {
        const dim = data[dimension.key] || {};
        return `
        <div class="dimension-card">
          <div style="font-size: 32px; margin-bottom: 10px;">${dimension.icon}</div>
          <div class="info-label">${dimension.name}</div>
          <div class="dimension-score">${dim.score || 0}分</div>
          <div class="dimension-overview">${dim.overview || '暂无分析'}</div>
          ${dim.advice && dim.advice.length > 0 ? `
            <div style="margin-top: 10px;">
              <strong>建议：</strong>
              ${dim.advice.join('；')}
            </div>
          ` : ''}
        </div>
        `;
      }).join('')}
    </div>
  </div>
    `;
  };

  const getDefaultStyles = () => ({
    primary: '#C8102E',
    secondary: '#FFD700',
    background: '#FEF7F0',
    surface: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
  });

  const getCyberpunkStyles = () => ({
    primary: '#FF00FF',
    secondary: '#00FFFF',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    text: '#00FF00',
    border: '#333333',
  });

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handlePrint}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            打印中...
          </>
        ) : (
          <>
            <Printer className="w-4 h-4" />
            打印报告
          </>
        )}
      </button>
      
      <button
        onClick={handleDownloadPDF}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            生成中...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            下载 HTML 报告
          </>
        )}
      </button>
    </div>
  );
}
