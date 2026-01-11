/**
 * 人生 K 线分析边缘函数
 * 部署到 ESA Edge Functions 或 Cloudflare Workers
 */

/**
 * 八字分析函数
 * 处理前端传入的生日数据,返回八字计算结果
 */
export async function klineAnalysisHandler(request) {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 解析请求体
    const body = await request.json();
    const { name, birthDate, birthTime, gender } = body;

    // 验证必填字段
    if (!birthDate) {
      return new Response(
        JSON.stringify({ error: '出生日期必填' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: 在实际部署时,这里应该调用真实的八字计算服务
    // 这里返回模拟数据
    const mockResult = {
      id: crypto.randomUUID(),
      name: name || '匿名',
      birthData: {
        birthDate,
        birthTime: birthTime || '12:00',
        gender: gender || 'unknown',
      },
      bazi: {
        year: '甲子',
        month: '乙丑',
        day: '丙寅',
        hour: '丁卯',
        wuxing: {
          year: '金',
          month: '木',
          day: '火',
          hour: '火',
        },
      },
      klineData: generateMockKLineData(),
      dimensions: {
        career: 75,
        wealth: 68,
        health: 82,
        love: 71,
        study: 79,
      },
      createdAt: new Date().toISOString(),
    };

    // 返回结果,设置 CORS 头
    return new Response(JSON.stringify(mockResult), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * 生成模拟 K 线数据
 */
function generateMockKLineData() {
  const data = [];
  const basePrice = 100;
  let currentPrice = basePrice;

  for (let age = 0; age <= 100; age++) {
    // 模拟价格波动
    const volatility = Math.random() * 20 - 10;
    currentPrice += volatility;

    // 限制价格范围
    currentPrice = Math.max(50, Math.min(150, currentPrice));

    const open = currentPrice;
    const change = Math.random() * 10 - 5;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;

    data.push({
      year: new Date().getFullYear() - 100 + age,
      age,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000) + 1000,
    });
  }

  return data;
}

/**
 * 处理 OPTIONS 预检请求
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * 主入口函数
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 路由处理
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    if (url.pathname === '/api/kline-analysis') {
      return klineAnalysisHandler(request);
    }

    // 404
    return new Response('Not found', { status: 404 });
  },
};
