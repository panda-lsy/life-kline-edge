/**
*
完整流程集成测试
*
测试核心组件和服务的集成
*/

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { KLineChart } from '@/components/KLineChart/KLineChart';
import { BaziDisplay } from '@/components/AnalysisResult/BaziDisplay';
import { DimensionAnalysis } from '@/components/AnalysisResult/DimensionAnalysis';
import { ThemeProvider } from '@/components/KLineChart/ThemeProvider';
import { getHistoryService } from '@/services/historyService';
import type { KLineData } from '@/types/kline';
import type { BaziResult } from '@/types/bazi';
import type { SixDimensions } from '@/types/kline';

// Mock 边缘函数
const server = setupServer(
  http.post('/api/ai/analyze', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        overview: '测试用AI分析概述',
        yearlyPredictions: [{ year: 2025, prediction: '运势平稳' }],
        advice: ['建议1', '建议2'],
      },
    });
  })
);

describe('核心功能集成测试', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    });
  });

  it('应正确渲染 K线图', () => {
    const mockData: KLineData[] = [
      { year: 2024, open: 50, close: 55, high: 60, low: 45 },
      { year: 2025, open: 55, close: 48, high: 58, low: 42 },
    ];

    render(
      <ThemeProvider>
        {(theme) => (
          <KLineChart
            data={mockData}
            onDataClick={vi.fn()}
            theme={theme}
            height={400}
          />
        )}
      </ThemeProvider>
    );

    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('应正确显示八字排盘', () => {
    const mockBazi: BaziResult = {
      siZhu: {
        year: { gan: '甲', zhi: '子' },
        month: { gan: '乙', zhi: '丑' },
        day: { gan: '丙', zhi: '寅' },
        hour: { gan: '丁', zhi: '卯' },
      },
      wuXing: { metal: 20, wood: 30, water: 25, fire: 15, earth: 10 },
      daYun: { startAge: 10, cycles: [] },
    };

    render(
      <BaziDisplay data={mockBazi} />
    );

    // 验证八字排盘标题显示
    expect(screen.getByText('八字排盘')).toBeInTheDocument();
    // 验证五行显示
    expect(screen.getByText('金')).toBeInTheDocument();
    expect(screen.getByText('木')).toBeInTheDocument();
    expect(screen.getByText('水')).toBeInTheDocument();
  });

  it('应正确管理历史记录', () => {
    const service = getHistoryService({ userId: 'test-user' });

    const record = service.add({
      birthData: {
        name: '测试',
        gender: 'male',
        birthDate: '1990-01-01',
        birthTime: '午时',
        location: { country: '中国', province: '北京', city: '北京' },
      },
      baziResult: {} as BaziResult,
      dimensionsResult: {} as SixDimensions,
      klineData: [],
    });

    expect(record.id).toBeDefined();
    expect(service.getAll()).toHaveLength(1);
  });
});
