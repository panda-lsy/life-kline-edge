/**
 * AI Prompt 模板
 * 用于生成八字命理分析和人生K线数据
 */

import type { BaziResult, AIAnalysisResult } from '@/types';

/**
 * AI 分析配置
 */
export interface AnalysisConfig {
  /** 使用的AI模型 */
  model: 'openai-compatible' | 'gpt-4o' | 'deepseek' | 'gemini';
  /** 分析语言 */
  language: 'zh-CN' | 'en-US';
  /** 是否包含详细解释 */
  verbose: boolean;
}

/**
 * 系统角色定义
 */
const SYSTEM_ROLE = `你是一位精通中国传统八字命理的现代命理分析师，具备以下特点：

1. **专业知识**：精通四柱八字、五行生克制化、十神理论、大运流年推演
2. **现代视角**：将传统命理与现代心理学、社会学相结合，提供积极正向的分析
3. **数据驱动**：基于八字排盘数据，进行客观理性的分析，避免迷信色彩
4. **结构化输出**：严格按照 JSON 格式输出分析结果
5. **用户友好**：使用通俗易懂的语言，提供可行的建议

**重要原则**：
- 分析内容必须积极正向，避免宿命论
- 强调人的主观能动性，命运可以改变
- 提供建设性建议，而非绝对化预测
- 尊重用户，不传播迷信思想`;

/**
 * JSON 输出格式规范
 */
const JSON_FORMAT_SPEC = `你必须严格按照以下 JSON 格式输出分析结果，不得添加任何其他文字说明：

\`\`\`json
{
  "dimensions": {
    "career": {
      "score": 事业评分 (0-100),
      "overview": "事业运势概述 (1-2句话)",
      "details": ["事业详细分析点1", "事业详细分析点2", "事业详细分析点3"],
      "advice": ["事业建议1", "事业建议2", "事业建议3"]
    },
    "wealth": {
      "score": 财富评分 (0-100),
      "overview": "财富运势概述 (1-2句话)",
      "details": ["财富详细分析点1", "财富详细分析点2", "财富详细分析点3"],
      "advice": ["财富建议1", "财富建议2", "财富建议3"]
    },
    "marriage": {
      "score": 婚姻评分 (0-100),
      "overview": "婚姻运势概述 (1-2句话)",
      "details": ["婚姻详细分析点1", "婚姻详细分析点2", "婚姻详细分析点3"],
      "advice": ["婚姻建议1", "婚姻建议2", "婚姻建议3"]
    },
    "health": {
      "score": 健康评分 (0-100),
      "overview": "健康运势概述 (1-2句话)",
      "details": ["健康详细分析点1", "健康详细分析点2", "健康详细分析点3"],
      "advice": ["健康建议1", "健康建议2", "健康建议3"]
    },
    "personality": {
      "score": 性格评分 (0-100),
      "overview": "性格特征概述 (1-2句话)",
      "details": ["性格详细分析点1", "性格详细分析点2", "性格详细分析点3"],
      "advice": ["性格建议1", "性格建议2", "性格建议3"]
    },
    "fengshui": {
      "score": 风水评分 (0-100),
      "overview": "风水运势概述 (1-2句话)",
      "details": ["风水详细分析点1", "风水详细分析点2", "风水详细分析点3"],
      "advice": ["风水建议1", "风水建议2", "风水建议3"]
    }
  }
}
\`\`\`

**字段说明**：
- **dimensions**: 包含六个维度的全面分析
- 每个维度包含评分、概述、详细分析点（3个）、建议（3个）
- 评分范围：0-100 分
- 概述：1-2 句话概括该维度运势
- details：具体的分析要点
- advice：可操作的建议`;

/**
 * 分析指南
 */
const ANALYSIS_GUIDELINES = `**分析方法**：

1. **四柱分析**：
   - 年柱：祖辈、幼年运、先天体质
   - 月柱：父母、青年运、事业基础
   - 日柱：自身、中年运、配偶关系
   - 时柱：子女、晚年运、事业成果

2. **五行强弱**：
   - 分析五行分布，找出喜用神
   - 判断命局强弱（身强/身弱）
   - 推算五行互补建议

3. **大运流年**：
   - 根据大运方向（顺行/逆行）推演人生阶段
   - 每个大运周期（10年）的整体趋势
   - 关键流年的转折点识别

4. **六大维度分析**：
   - **事业**：看官杀、食伤、财星
   - **财富**：看财星、日主强弱
   - **婚姻**：看夫妻宫、财官配置
   - **健康**：看五行平衡、忌神
   - **性格**：看日主、十神特性
   - **风水**：看五行喜忌、方位建议

**评分标准**：
- 90-100：极佳，运势亨通
- 75-89：良好，机遇较多
- 60-74：平稳，有起有伏
- 45-59：较弱，需努力
- 0-44：困难，需谨慎

**注意事项**：
- 保持客观理性，不夸大其词
- 提供建设性建议，而非绝对化预测
- 强调后天努力可以改变命运
- 避免消极悲观的表达`;

/**
 * 输出示例
 */
const OUTPUT_EXAMPLE = `以下是一个示例输出（仅供参考格式，内容需要根据实际八字分析）：

输入：1990年出生，男性，庚午年、己丑月、丙寅日、癸卯时

输出：
\`\`\`json
{
  "dimensions": {
    "career": {
      "score": 75,
      "overview": "事业运势整体良好，具备领导才能和创新能力",
      "details": [
        "年柱庚金，性格坚毅，做事有韧性",
        "月令财官相生，利于事业发展",
        "食伤透出，才华易被赏识"
      ],
      "advice": [
        "适合从事管理、金融、技术类工作",
        "中年时期（35-45岁）事业最为顺利",
        "宜多培养团队合作能力"
      ]
    },
    "wealth": {
      "score": 70,
      "overview": "财运平稳，正财稳健，偏财有机会",
      "details": [
        "日主坐财，有理财天赋",
        "月令财星有力，财运来源稳定",
        "食伤生财，善于通过技能赚钱"
      ],
      "advice": [
        "稳健投资为主，避免高风险投机",
        "发挥专业技能，提高收入",
        "注意储蓄，为未来做准备"
      ]
    },
    "marriage": {
      "score": 65,
      "overview": "婚姻感情运势平稳，需要用心经营",
      "details": [
        "夫妻宫坐寅木，配偶能干顾家",
        "财官相生，感情关系稳定",
        "需注意沟通，避免误解"
      ],
      "advice": [
        "多倾听对方想法，增进理解",
        "适当表达情感，避免冷战",
        "共同规划未来，增强凝聚力"
      ]
    },
    "health": {
      "score": 72,
      "overview": "整体健康状况良好，注意保养",
      "details": [
        "五行较为平衡，不易患大病",
        "火土偏旺，注意心血管保养",
        "适合运动锻炼，增强体质"
      ],
      "advice": [
        "定期体检，预防为主",
        "保持规律作息，避免熬夜",
        "适度运动，增强免疫力"
      ]
    },
    "personality": {
      "score": 78,
      "overview": "性格稳重，有责任感，略显内向",
      "details": [
        "日主丙火，热情开朗",
        "庚金坚毅，做事有原则",
        "食伤透出，思维活跃"
      ],
      "advice": [
        "保持积极乐观的心态",
        "多与人交流，拓展社交圈",
        "坚持自我，也要学会妥协"
      ]
    },
    "fengshui": {
      "score": 68,
      "overview": "风水运势整体平稳，可适当调整",
      "details": [
        "喜用神为木火，东方南方有利",
        "颜色上适合绿、红、紫等暖色调",
        "数字上3、4、9为吉利数字"
      ],
      "advice": [
        "卧室或办公室可朝东或东南",
        "多穿绿色或红色衣服",
        "重要事项选择3、4、9的日子进行"
      ]
    }
  }
}
\`\`\``;

/**
 * 生成完整的分析 Prompt
 */
export function generateAnalysisPrompt(
  baziResult: BaziResult,
  _config: AnalysisConfig = { model: 'gemini', language: 'zh-CN', verbose: false }
): string {
  const { siZhu, wuXing, daYun } = baziResult;

  // 格式化八字数据
  const baziInfo = `
## 八字排盘数据

**出生时间**：${new Date(baziResult.calculatedAt).toLocaleString('zh-CN')}

**四柱八字**：
- 年柱：${siZhu.year.gan}${siZhu.year.zhi}
- 月柱：${siZhu.month.gan}${siZhu.month.zhi}
- 日柱：${siZhu.day.gan}${siZhu.day.zhi}
- 时柱：${siZhu.hour.gan}${siZhu.hour.zhi}

**五行强弱**：
- 金：${wuXing.metal} 个
- 木：${wuXing.wood} 个
- 水：${wuXing.water} 个
- 火：${wuXing.fire} 个
- 土：${wuXing.earth} 个

**大运信息**：
- 起运年龄：${daYun.startAge} 岁
- 大运方向：${daYun.direction === 'forward' ? '顺行' : '逆行'}
- 大运周期：
${daYun.cycles.map(cycle =>
  `  ${cycle.age}岁 (${cycle.years[0]}-${cycle.years[1]}年): ${cycle.ganZhi}`
).join('\n')}
`.trim();

  // 构建完整 Prompt
  return `
${SYSTEM_ROLE}

${ANALYSIS_GUIDELINES}

${JSON_FORMAT_SPEC}

${OUTPUT_EXAMPLE}

---

## 任务

请根据以下八字排盘数据，生成完整的六大维度评估：

${baziInfo}

**要求**：
1. 对六大维度进行全面分析，每个维度至少3个详细点和3个建议
2. 所有分析必须基于传统命理理论，结合现代视角
3. 输出必须严格符合上述JSON格式，不得有任何额外内容

**输出格式**：仅输出JSON，不要包含任何其他文字。
`.trim();
}

/**
 * 生成简化版 Prompt（用于快速测试）
 */
export function generateSimplePrompt(baziResult: BaziResult): string {
  const { siZhu, wuXing } = baziResult;

  return `
你是一位八字命理分析师。请根据以下八字数据，生成JSON格式的人生分析：

八字：${siZhu.year.gan}${siZhu.year.zhi} ${siZhu.month.gan}${siZhu.month.zhi} ${siZhu.day.gan}${siZhu.day.zhi} ${siZhu.hour.gan}${siZhu.hour.zhi}
五行：金${wuXing.metal} 木${wuXing.wood} 水${wuXing.water} 火${wuXing.fire} 土${wuXing.earth}

请输出包含以下字段的JSON：
- klineData: 100年数据，每年包含year/open/close/high/low
- dimensions: career/wealth/marriage/health/personality/fengshui，每个包含score/overview/details/advice
- turningPoints: 3-5个关键转折点

仅输出JSON，不要其他文字。
`.trim();
}

/**
 * 验证 AI 输出的格式
 */
export function validateAIOutput(output: string): {
  valid: boolean;
  error?: string;
  data?: AIAnalysisResult;
} {
  try {
    // 尝试提取 JSON（处理可能的 markdown 代码块）
    let jsonStr = output.trim();

    // 移除可能的 markdown 代码块标记
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const data = JSON.parse(jsonStr) as AIAnalysisResult;

    // 基本验证
    if (!data.dimensions || typeof data.dimensions !== 'object') {
      return { valid: false, error: '缺少维度分析数据' };
    }

    const requiredDimensions = ['career', 'wealth', 'marriage', 'health', 'personality', 'fengshui'];
    for (const dim of requiredDimensions) {
      if (!data.dimensions[dim as keyof typeof data.dimensions]) {
        return { valid: false, error: `缺少${dim}维度分析` };
      }
    }

    return { valid: true, data };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : '解析失败'
    };
  }
}

/**
 * 生成重试 Prompt（当 AI 输出格式不正确时）
 */
export function generateRetryPrompt(
  originalPrompt: string,
  error: string,
  previousOutput: string
): string {
  return `
${originalPrompt}

**错误提示**：你的上一次输出格式不正确：${error}

**上一次输出**：
${previousOutput.slice(0, 500)}...

**请重新生成**：
1. 严格按照 JSON 格式输出
2. 不要包含任何其他文字说明
3. 确保包含所有六大维度分析（career、wealth、marriage、health、personality、fengshui）
4. 确保 JSON 格式正确（括号匹配、逗号正确）
`.trim();
}
