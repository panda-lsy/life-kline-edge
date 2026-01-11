/**
 * K线图集成示例
 * 展示如何使用ThemeProvider、KLineChart和TurningPoints组件
 */

import { KLineChart, ThemeProvider, TurningPoints } from './index';
import type { KLineData, TurningPoint } from '@/types/kline';

/**
 * 示例1: 基础用法 - 仅显示K线图（带主题）
 */
export function BasicExample({ data }: { data: KLineData[] }) {
  return (
    <ThemeProvider>
      {(theme) => <KLineChart data={data} theme={theme} />}
    </ThemeProvider>
  );
}

/**
 * 示例2: 完整用法 - K线图 + 转折点标注
 */
export function FullExample({
  data,
  turningPoints,
}: {
  data: KLineData[];
  turningPoints: TurningPoint[];
}) {
  return (
    <ThemeProvider>
      {(theme) => (
        <div className="space-y-4">
          {/* K线图 */}
          <KLineChart
            data={data}
            theme={theme}
            onDataClick={(year, data) => {
              console.log('点击年份:', year, '数据:', data);
            }}
          />

          {/* 可选：显示转折点列表 */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3">关键转折点</h3>
            <TurningPointsList turningPoints={turningPoints} theme={theme} />
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}

/**
 * 示例3: 自定义高度和回调
 */
export function CustomExample({
  data,
  turningPoints,
}: {
  data: KLineData[];
  turningPoints: TurningPoint[];
}) {
  return (
    <ThemeProvider>
      {(theme) => (
        <KLineChart
          data={data}
          theme={theme}
          height={600}
          onDataClick={(year) => {
            // 查找并点击对应的转折点
            const point = turningPoints.find(p => p.year === year);
            if (point) {
              console.log('转折点:', point);
            }
          }}
        />
      )}
    </ThemeProvider>
  );
}

/**
 * 示例4: 在分析页面中使用
 */
export function AnalysisPageExample({
  klineData,
  turningPoints,
}: {
  klineData: KLineData[];
  turningPoints: TurningPoint[];
}) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<TurningPoint | null>(null);

  return (
    <ThemeProvider>
      {(theme) => (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">人生K线分析</h1>

          {/* K线图区域 */}
          <div className="mb-8">
            <KLineChart
              data={klineData}
              theme={theme}
              onDataClick={(year) => {
                setSelectedYear(year);
                // 查找对应的转折点
                const point = turningPoints.find(p => p.year === year);
                setSelectedPoint(point || null);
              }}
            />
          </div>

          {/* 转折点标注（在图表上显示） */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">转折点标注</h2>
            <div className="bg-white rounded-lg p-6 shadow">
              {/* 这里使用自定义渲染来集成转折点 */}
              <KLineChartWithTurningPoints
                data={klineData}
                turningPoints={turningPoints}
                theme={theme}
              />
            </div>
          </div>

          {/* 选中年份的详细信息 */}
          {selectedYear && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {selectedYear}年详细分析
              </h2>
              <div className="bg-white rounded-lg p-6 shadow">
                {selectedPoint ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedPoint.type === 'peak' && '📈 运势高峰'}
                      {selectedPoint.type === 'trough' && '📉 运势低谷'}
                      {selectedPoint.type === 'change' && '🔄 重大转折'}
                    </h3>
                    <p className="mb-2">{selectedPoint.reason}</p>
                    <p className="text-sm text-gray-600">{selectedPoint.advice}</p>
                  </div>
                ) : (
                  <p>该年份没有特殊转折点</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </ThemeProvider>
  );
}

/**
 * 示例5: 直接使用Recharts集成转折点
 */
export function KLineChartWithTurningPoints({
  data,
  turningPoints,
  theme,
}: {
  data: KLineData[];
  turningPoints: TurningPoint[];
  theme: any;
}) {
  return (
    <div>
      <KLineChart data={data} theme={theme} />
      {/* 转折点会在K线图内部通过Recharts的ReferenceLine和ReferenceDot渲染 */}
      <TurningPoints
        klineData={data}
        turningPoints={turningPoints}
        theme={theme}
        onPointClick={(point) => {
          console.log('点击转折点:', point);
        }}
      />
    </div>
  );
}

// 注意: 示例中使用了 useState,需要从 React 导入
import { useState } from 'react';
import { TurningPointsList } from './index';
