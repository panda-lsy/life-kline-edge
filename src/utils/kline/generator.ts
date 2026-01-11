/**
 * K 线数据生成算法
 * 基于八字命理数据生成 100 年的人生运势 K 线图
 *
 * 特点：
 * - 确定性：相同八字输入 → 相同 K 线输出
 * - 快速：算法生成，无需 AI 调用
 * - 合理：基于传统命理理论，结合现代算法
 */

import type { BaziResult } from '@/types/bazi';
import type { KLineData, TurningPoint } from '@/types/kline';

/**
 * 天干五行数值映射
 */
const GAN_VALUE: Record<string, number> = {
  '甲': 1, '乙': 2,  // 木
  '丙': 3, '丁': 4,  // 火
  '戊': 5, '己': 6,  // 土
  '庚': 7, '辛': 8,  // 金
  '壬': 9, '癸': 10, // 水
};

/**
 * 地支五行数值映射
 */
const ZHI_VALUE: Record<string, number> = {
  '子': 1,  // 水
  '丑': 2,  // 土
  '寅': 3,  // 木
  '卯': 4,  // 木
  '辰': 5,  // 土
  '巳': 6,  // 火
  '午': 7,  // 火
  '未': 8,  // 土
  '申': 9,  // 金
  '酉': 10, // 金
  '戌': 11, // 土
  '亥': 12, // 水
};

/**
 * 五行生克关系
 */
const WUXING_RELATION: Record<string, { produces: string; weakens: string }> = {
  '金': { produces: '水', weakens: '木' },
  '木': { produces: '火', weakens: '土' },
  '水': { produces: '木', weakens: '火' },
  '火': { produces: '土', weakens: '金' },
  '土': { produces: '金', weakens: '水' },
};

/**
 * 基于八字生成随机种子
 * 确保相同的八字产生相同的随机序列
 */
class BaziRandom {
  private seed: number;

  constructor(bazi: BaziResult) {
    // 使用八字数据生成种子
    const { siZhu, wuXing } = bazi;
    const ganStr = siZhu.year.gan + siZhu.month.gan + siZhu.day.gan + siZhu.hour.gan;
    const zhiStr = siZhu.year.zhi + siZhu.month.zhi + siZhu.day.zhi + siZhu.hour.zhi;

    // 计算种子值
    let hash = 0;
    const str = ganStr + zhiStr + wuXing.metal + wuXing.wood + wuXing.water + wuXing.fire + wuXing.earth;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // 转换为 32 位整数
    }
    this.seed = Math.abs(hash);
  }

  /**
   * 生成 0-1 之间的随机数
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * 生成指定范围内的随机整数
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * 生成正态分布随机数
   */
  nextNormal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * stdDev + mean;
  }
}

/**
 * 计算基础运势分数
 */
function calculateBaseScore(bazi: BaziResult): number {
  const { wuXing, siZhu } = bazi;

  // 基础分 60
  let score = 60;

  // 五行平衡加分（满分 20）
  const counts = [wuXing.metal, wuXing.wood, wuXing.water, wuXing.fire, wuXing.earth];
  const avg = counts.reduce((a, b) => a + b, 0) / 5;
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / 5;
  const balanceScore = Math.max(0, 20 - variance * 2); // 越平衡分数越高
  score += balanceScore;

  // 日主强弱加分（满分 20）
  // 简化判断：看日主是否得令、得地、得势
  const dayGan = siZhu.day.gan;
  const monthZhi = siZhu.month.zhi;
  const dayGanElement = getWuXing(dayGan);
  const monthZhiElement = getWuXing(monthZhi);

  let strengthScore = 10;
  if (dayGanElement === monthZhiElement) {
    strengthScore += 10; // 日主得令
  } else if (WUXING_RELATION[monthZhiElement]?.produces === dayGanElement) {
    strengthScore += 5; // 月支生日主
  }
  score += Math.min(20, strengthScore);

  return Math.min(100, Math.max(40, score)); // 限制在 40-100 之间
}

/**
 * 获取天干或地支的五行属性
 */
function getWuXing(char: string): string {
  // 天干
  if (['甲', '乙'].includes(char)) return '木';
  if (['丙', '丁'].includes(char)) return '火';
  if (['戊', '己'].includes(char)) return '土';
  if (['庚', '辛'].includes(char)) return '金';
  if (['壬', '癸'].includes(char)) return '水';

  // 地支
  if (['寅', '卯'].includes(char)) return '木';
  if (['巳', '午'].includes(char)) return '火';
  if (['辰', '戌', '丑', '未'].includes(char)) return '土';
  if (['申', '酉'].includes(char)) return '金';
  if (['亥', '子'].includes(char)) return '水';

  return '土'; // 默认
}

/**
 * 计算大运对运势的影响
 */
function calculateDaYunImpact(
  bazi: BaziResult,
  year: number,
  rng: BaziRandom
): number {
  const { daYun, siZhu } = bazi;

  // 找到当前年份对应的大运
  const currentDaYun = daYun.cycles.find(cycle =>
    year >= cycle.years[0] && year <= cycle.years[1]
  );

  if (!currentDaYun) return 0;

  // 大运干支与日主的关系
  const dayGan = siZhu.day.gan;
  const dayGanElement = getWuXing(dayGan);
  const daYunGan = currentDaYun.ganZhi[0];
  const daYunGanElement = getWuXing(daYunGan);

  let impact = 0;

  // 同五行：+5
  if (dayGanElement === daYunGanElement) {
    impact += 5;
  }
  // 相生：+3
  else if (WUXING_RELATION[daYunGanElement]?.produces === dayGanElement) {
    impact += 3;
  }
  // 相克：-3
  else if (WUXING_RELATION[daYunGanElement]?.weakens === dayGanElement) {
    impact -= 3;
  }

  // 大运周期位置影响（大运初期波动大）
  const yearInCycle = year - currentDaYun.years[0];
  if (yearInCycle <= 2) {
    impact += rng.nextInt(-3, 3); // 初期随机波动
  } else if (yearInCycle >= 7) {
    impact += rng.nextInt(-2, 2); // 后期小幅波动
  }

  return impact;
}

/**
 * 计算流年对运势的影响
 */
function calculateLiuNianImpact(
  bazi: BaziResult,
  year: number,
  rng: BaziRandom
): number {
  const { siZhu } = bazi;

  // 计算流年干支
  const baseYear = parseInt(siZhu.year.gan + siZhu.year.zhi);
  const yearOffset = year - baseYear;

  // 简化的干支计算（实际应该更复杂）
  const ganIndex = (yearOffset + GAN_VALUE[siZhu.year.gan] - 1) % 10;
  const zhiIndex = (yearOffset + ZHI_VALUE[siZhu.year.zhi] - 1) % 12;

  const ganChars = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhiChars = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const liuNianGan = ganChars[ganIndex];
  const liuNianZhi = zhiChars[zhiIndex];

  // 流年与日主的关系
  const dayGan = siZhu.day.gan;
  const dayGanElement = getWuXing(dayGan);
  const liuNianGanElement = getWuXing(liuNianGan);

  let impact = 0;

  // 流年干为喜用神（简化判断）
  if (dayGanElement === liuNianGanElement) {
    impact += 3; // 同五行为喜
  } else if (WUXING_RELATION[liuNianGanElement]?.produces === dayGanElement) {
    impact += 2; // 相生为喜
  } else if (WUXING_RELATION[liuNianGanElement]?.weakens === dayGanElement) {
    impact -= 2; // 相克为忌
  }

  // 本命年（生肖年）波动
  if (liuNianZhi === siZhu.year.zhi) {
    impact += rng.nextInt(-5, 5); // 本命年波动较大
  }

  return impact;
}

/**
 * 生成单年的 K 线数据
 */
function generateYearKLine(
  bazi: BaziResult,
  year: number,
  baseScore: number,
  prevClose: number,
  rng: BaziRandom
): KLineData {
  // 计算各种影响
  const daYunImpact = calculateDaYunImpact(bazi, year, rng);
  const liuNianImpact = calculateLiuNianImpact(bazi, year, rng);

  // 随机波动（使用正态分布，使波动更自然）
  const randomFluctuation = rng.nextNormal(0, 3);

  // 计算年初分数（基于去年年末）
  const yearStartChange = rng.nextNormal(0, 2);
  let open = prevClose + yearStartChange;
  open = Math.max(20, Math.min(100, open)); // 限制范围

  // 计算年末分数
  const totalChange = daYunImpact + liuNianImpact + randomFluctuation;
  let close = baseScore + totalChange;
  close = Math.max(20, Math.min(100, close)); // 限制范围

  // 确保波动合理（年末与年初差异不超过 30）
  if (Math.abs(close - open) > 30) {
    close = open + Math.sign(close - open) * 30;
  }

  // 计算年度最高和最低
  const volatility = rng.nextNormal(10, 5); // 波动幅度
  const high = Math.max(open, close) + Math.abs(rng.nextNormal(0, volatility));
  const low = Math.min(open, close) - Math.abs(rng.nextNormal(0, volatility));

  // 限制范围
  const finalHigh = Math.max(20, Math.min(100, high));
  const finalLow = Math.max(20, Math.min(100, low));
  const finalOpen = Math.max(20, Math.min(100, open));
  const finalClose = Math.max(20, Math.min(100, close));

  // 影响因子（可选）
  const volume = rng.nextInt(50, 100);

  return {
    year,
    open: Number(finalOpen.toFixed(2)),
    close: Number(finalClose.toFixed(2)),
    high: Number(finalHigh.toFixed(2)),
    low: Number(finalLow.toFixed(2)),
    volume,
  };
}

/**
 * 识别关键转折点
 */
function identifyTurningPoints(klineData: KLineData[], bazi: BaziResult): TurningPoint[] {
  const turningPoints: TurningPoint[] = [];
  const { daYun, siZhu } = bazi;

  // 1. 大运交替年份（每 10 年）
  for (let i = 1; i < daYun.cycles.length; i++) {
    const cycle = daYun.cycles[i];
    const turnYear = cycle.years[0]; // 大运开始年份

    if (turnYear > klineData[0].year && turnYear <= klineData[klineData.length - 1].year) {
      const yearData = klineData.find(d => d.year === turnYear);
      if (yearData) {
        const change = ((yearData.close - yearData.open) / yearData.open * 100);
        const type = change > 5 ? 'peak' : change < -5 ? 'trough' : 'change';

        turningPoints.push({
          year: turnYear,
          type,
          reason: `进入${cycle.ganZhi}大运，人生阶段发生重要转变`,
          advice: type === 'peak' ? '把握机遇，大展宏图' : type === 'trough' ? '谨慎行事，蓄势待发' : '平稳过渡，顺势而为',
          score: yearData.close,
        });
      }
    }
  }

  // 2. 极值点（局部最高和最低）
  for (let i = 2; i < klineData.length - 2; i++) {
    const current = klineData[i];
    const prev1 = klineData[i - 1];
    const prev2 = klineData[i - 2];
    const next1 = klineData[i + 1];
    const next2 = klineData[i + 2];

    // 局部最高点
    if (current.close > prev1.close && current.close > prev2.close &&
        current.close > next1.close && current.close > next2.close) {
      if (current.close > 75) { // 只标记高分峰值
        turningPoints.push({
          year: current.year,
          type: 'peak',
          reason: `${current.year}年运势达到峰值，各方面条件最为有利`,
          advice: '抓住黄金机遇，大胆施展才华',
          score: current.close,
        });
      }
    }

    // 局部最低点
    if (current.close < prev1.close && current.close < prev2.close &&
        current.close < next1.close && current.close < next2.close) {
      if (current.close < 45) { // 只标记低分低谷
        turningPoints.push({
          year: current.year,
          type: 'trough',
          reason: `${current.year}年运势处于低谷，面临挑战和考验`,
          advice: '保持耐心，修身养性，等待时机',
          score: current.close,
        });
      }
    }
  }

  // 3. 特殊年份（成年、退休等）
  const birthYear = parseInt(siZhu.year.gan + siZhu.year.zhi); // 近似计算
  const age18 = birthYear + 18;
  const age30 = birthYear + 30;
  const age60 = birthYear + 60;

  [age18, age30, age60].forEach(specialYear => {
    if (specialYear >= klineData[0].year && specialYear <= klineData[klineData.length - 1].year) {
      const yearData = klineData.find(d => d.year === specialYear);
      if (yearData && !turningPoints.find(tp => tp.year === specialYear)) {
        turningPoints.push({
          year: specialYear,
          type: 'change',
          reason: `${specialYear}年是人生重要节点，${specialYear - birthYear}岁`,
          advice: '认真规划人生方向，做出重要决策',
          score: yearData.close,
        });
      }
    }
  });

  // 按年份排序并限制数量
  turningPoints.sort((a, b) => a.year - b.year);
  return turningPoints.slice(0, 8); // 最多返回 8 个转折点
}

/**
 * 生成完整的 100 年 K 线数据
 */
export function generateKLineData(bazi: BaziResult): KLineData[] {
  const rng = new BaziRandom(bazi);

  // 计算基础分数
  const baseScore = calculateBaseScore(bazi);

  // 起始年份（从计算时间中获取出生年份）
  const startYear = new Date(bazi.calculatedAt).getFullYear();

  // 生成 100 年数据
  const klineData: KLineData[] = [];
  let prevClose = baseScore;

  for (let i = 0; i < 100; i++) {
    const year = startYear + i;
    const yearData = generateYearKLine(bazi, year, baseScore, prevClose, rng);
    klineData.push(yearData);
    prevClose = yearData.close;
  }

  return klineData;
}

/**
 * 生成关键转折点
 */
export function generateTurningPoints(bazi: BaziResult, klineData: KLineData[]): TurningPoint[] {
  return identifyTurningPoints(klineData, bazi);
}
