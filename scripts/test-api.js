/**
 * 智谱 AI API 连接测试脚本
 * 用于验证 API 配置是否正确
 */

const API_KEY = '3e477c124cff4ace9781036ec6a9539a.JD2LjE68x00gcWRq';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const MODEL = 'glm-4-flash';

async function testConnection() {
  console.log('🔍 测试智谱 AI API 连接...\n');
  console.log('配置信息:');
  console.log(`  端点: ${API_URL}`);
  console.log(`  模型: ${MODEL}`);
  console.log(`  密钥: ${API_KEY.slice(0, 10)}...${API_KEY.slice(-4)}\n`);

  try {
    const startTime = Date.now();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: '你好，请回复"连接成功"来测试 API 是否正常工作。'
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    const duration = Date.now() - startTime;

    console.log(`⏱️  响应时间: ${duration}ms`);
    console.log(`📊 状态码: ${response.status}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 请求失败');
      console.error(`错误信息: ${errorText}\n`);
      return false;
    }

    const data = await response.json();

    console.log('✅ API 连接成功!\n');
    console.log('响应数据:');
    console.log(JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      console.log(`\n🤖 AI 回复: "${content}"`);
    }

    console.log('\n✨ 配置验证通过，可以在应用中使用了！');
    return true;

  } catch (error) {
    console.error('❌ 连接测试失败');
    console.error(`错误: ${error.message}\n`);

    if (error.message.includes('fetch')) {
      console.error('💡 可能的原因:');
      console.error('  1. 网络连接问题');
      console.error('  2. API 端点地址错误');
      console.error('  3. 防火墙阻止了请求\n');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.error('💡 可能的原因:');
      console.error('  1. API 密钥无效或已过期');
      console.error('  2. API 密钥格式错误\n');
    }

    return false;
  }
}

// 运行测试
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
