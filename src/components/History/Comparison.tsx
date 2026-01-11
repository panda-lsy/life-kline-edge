/**
 * 历史记录对比组件
 * 并排展示两条历史记录，支持同步缩放和拖拽
 */

import { useMemo } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
} from 'recharts';
import type { HistoryRecord } from '@/services/historyService';

export interface ComparisonProps {
  /** 记录 1 */
  record1: HistoryRecord;
  /** 记录 2 */
  record2: HistoryRecord;
  /** 自定义类名 */
  className?: string;
}

/**
 * 计算两条记录的差异
 */
function calculateDifferences(
  data1: HistoryRecord,
  data2: HistoryRecord
): {
  strongerDimensions: string[];
  weakerDimensions: string[];
  scoreDifference: number;
  summary: string;
} {
  const dims1 = data1.dimensionsResult;
  const dims2 = data2.dimensionsResult;

  const strongerDimensions: string[] = [];
  const weakerDimensions: string[] = [];

  const dimensionNames: Record<string, string> = {
    career: '事业',
    wealth: '财富',
    marriage: '婚姻',
    health: '健康',
    personality: '性格',
    fengshui: '风水',
  };

  // 比较各维度
  (Object.keys(dims1) as Array<keyof typeof dims1>).forEach((key) => {
    const score1 = dims1[key].score;
    const score2 = dims2[key].score;
    const diff = score1 - score2;

    if (diff > 10) {
      strongerDimensions.push(`${dimensionNames[key]} (+${diff})`);
    } else if (diff < -10) {
      weakerDimensions.push(`${dimensionNames[key]} (${diff})`);
    }
  });

  // 计算总分差异
  const totalScore1 = Object.values(dims1).reduce((sum, d) => sum + d.score, 0);
  const totalScore2 = Object.values(dims2).reduce((sum, d) => sum + d.score, 0);
  const scoreDiff = Math.round(totalScore1 - totalScore2);

  // 生成总结
  let summary = '';
  if (scoreDiff > 30) {
    summary = '记录 1 的整体运势明显优于记录 2';
  } else if (scoreDiff < -30) {
    summary = '记录 2 的整体运势明显优于记录 1';
  } else {
    summary = '两条记录的运势水平相当';
  }

  return {
    strongerDimensions,
    weakerDimensions,
    scoreDifference: scoreDiff,
    summary,
  };
}

/**
 * 维度对比卡片
 */
function DimensionComparison({
  record1,
  record2,
}: {
  record1: HistoryRecord;
  record2: HistoryRecord;
}) {
  const dims1 = record1.dimensionsResult;
  const dims2 = record2.dimensionsResult;

  const dimensionNames: Record<string, string> = {
    career: '事业',
    wealth: '财富',
    marriage: '婚姻',
    health: '健康',
    personality: '性格',
    fengshui: '风水',
  };

  const dimensionColors: Record<string, string> = {
    career: 'bg-blue-500',
    wealth: 'bg-yellow-500',
    marriage: 'bg-pink-500',
    health: 'bg-green-500',
    personality: 'bg-purple-500',
    fengshui: 'bg-orange-500',
  };

  return (
    <div className="space-y-3">
      {(Object.keys(dims1) as Array<keyof typeof dims1>).map((key) => {
        const score1 = dims1[key].score;
        const score2 = dims2[key].score;
        const diff = score1 - score2;
        const diffPercent = Math.round((diff / 100) * 100);

        const isPositive = diff > 5;
        const isNegative = diff < -5;
        const isNeutral = !isPositive && !isNegative;

        return (
          <div
            key={key}
            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
          >
            {/* 维度名称 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${dimensionColors[key]}`}
                />
                <span className="font-semibold text-gray-900">
                  {dimensionNames[key]}
                </span>
              </div>
              {isPositive && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  记录1 优势 +{diff}
                </span>
              )}
              {isNegative && (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                  记录2 优势 {diff}
                </span>
              )}
              {isNeutral && (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  持平
                </span>
              )}
            </div>

            {/* 进度条对比 */}
            <div className="space-y-2">
              {/* 记录 1 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16">记录1</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${score1}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                  {score1}
                </span>
              </div>

              {/* 记录 2 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16">记录2</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${score2}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                  {score2}
                </span>
              </div>
            </div>

            {/* 差异指示 */}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
              {diff !== 0 ? (
                <>
                  {diff > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span>
                    差异：{diff > 0 ? '+' : ''}
                    {diff} ({diffPercent > 0 ? '+' : ''}
                    {diffPercent}%)
                  </span>
                </>
              ) : (
                <Minus className="w-3 h-3 text-gray-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * K 线图对比
 */
function KLineComparison({
  record1,
  record2,
}: {
  record1: HistoryRecord;
  record2: HistoryRecord;
}) {
  // 合并两条记录的 K 线数据
  const chartData = useMemo(() => {
    const data1 = record1.klineData.slice(0, 30); // 前 30 年
    const data2 = record2.klineData.slice(0, 30);

    return data1.map((item1) => {
      const item2 = data2.find((d) => d.year === item1.year);
      return {
        year: item1.year,
        记录1: Number(item1.close.toFixed(2)),
        记录2: item2 ? Number(item2.close.toFixed(2)) : null,
      };
    });
  }, [record1.klineData, record2.klineData]);

  // 计算差异区域
  const diffAreas = useMemo(() => {
    const areas: Array<{ start: number; end: number; diff: number }> = [];
    let currentStart = 0;
    let lastDiff = chartData[0].记录1 - (chartData[0].记录2 || 0);

    for (let i = 1; i < chartData.length; i++) {
      const currentDiff = chartData[i].记录1 - (chartData[i].记录2 || 0);

      // 如果差异方向改变或差异超过 10
      if (
        (lastDiff > 0 && currentDiff < 0) ||
        (lastDiff < 0 && currentDiff > 0) ||
        Math.abs(currentDiff - lastDiff) > 10
      ) {
        if (i - currentStart > 1) {
          areas.push({
            start: currentStart,
            end: i - 1,
            diff: lastDiff,
          });
        }
        currentStart = i;
        lastDiff = currentDiff;
      }
    }

    // 添加最后一个区域
    if (chartData.length - currentStart > 0) {
      areas.push({
        start: currentStart,
        end: chartData.length - 1,
        diff: lastDiff,
      });
    }

    return areas;
  }, [chartData]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">K 线图对比（前 30 年）</h3>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={(value) => `${value}年`}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#666"
              label={{ value: '运势指数', position: 'insideLeft', angle: -90, offset: -5 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                    <div className="font-semibold text-gray-900 mb-2">
                      {data.year}年
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded" />
                        <span>
                          记录1: <strong>{data.记录1}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded" />
                        <span>
                          记录2: <strong>{data.记录2 || 'N/A'}</strong>
                        </span>
                      </div>
                      {data.记录2 && (
                        <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
                          差异: {(data.记录1 - data.记录2).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="记录1"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={record1.birthData.name || '记录1'}
            />
            <Line
              type="monotone"
              dataKey="记录2"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={record2.birthData.name || '记录2'}
            />

            {/* 差异区域高亮 */}
            {diffAreas.map((area, index) => (
              <ReferenceArea
                key={index}
                x1={area.start}
                x2={area.end}
                stroke="none"
                fillOpacity={0.1}
                fill={area.diff > 0 ? '#3b82f6' : '#a855f7'}
              />
            ))}

            {/* 刷子选择器 */}
            <Brush
              dataKey="year"
              height={30}
              stroke="#888"
              fill="#e0e0e0"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * 对比主组件
 */
export function Comparison({ record1, record2, className = '' }: ComparisonProps) {
  const differences = useMemo(
    () => calculateDifferences(record1, record2),
    [record1, record2]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 标题 */}
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">历史记录对比</h2>
          <ArrowUpDown className="w-6 h-6 text-gray-400" />
        </div>

        {/* 记录基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm font-semibold text-blue-900 mb-2">记录 1</div>
            <div className="text-lg font-bold text-blue-700">
              {record1.birthData.name || '匿名'}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {record1.birthData.birthDate} {record1.birthData.birthTime}
            </div>
            <div className="text-xs text-blue-600 mt-2">
              {record1.createdAt.toLocaleDateString('zh-CN')}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm font-semibold text-purple-900 mb-2">记录 2</div>
            <div className="text-lg font-bold text-purple-700">
              {record2.birthData.name || '匿名'}
            </div>
            <div className="text-sm text-purple-700 mt-1">
              {record2.birthData.birthDate} {record2.birthData.birthTime}
            </div>
            <div className="text-xs text-purple-600 mt-2">
              {record2.createdAt.toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>
      </div>

      {/* 对比总结 */}
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">对比总结</h3>
        <div className="text-gray-700 mb-4">{differences.summary}</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold text-green-700 mb-2">
              记录1 优势领域
            </div>
            {differences.strongerDimensions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {differences.strongerDimensions.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">无明显优势</div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold text-red-700 mb-2">
              记录2 优势领域
            </div>
            {differences.weakerDimensions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {differences.weakerDimensions.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">无明显优势</div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              总分差异
            </span>
            <span
              className={`text-lg font-bold ${
                differences.scoreDifference > 0
                  ? 'text-green-600'
                  : differences.scoreDifference < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {differences.scoreDifference > 0 ? '+' : ''}
              {differences.scoreDifference}
            </span>
          </div>
        </div>
      </div>

      {/* 维度对比 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">维度对比</h3>
        <DimensionComparison record1={record1} record2={record2} />
      </div>

      {/* K 线图对比 */}
      <KLineComparison record1={record1} record2={record2} />
    </div>
  );
}
