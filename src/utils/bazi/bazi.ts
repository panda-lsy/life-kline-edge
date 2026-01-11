/**
 * 四柱八字计算
 * 基于 lunar-javascript 库
 */

import { Lunar } from 'lunar-javascript';
import { calculateTrueSolarTime } from './solar';
import type { BirthData, BaziResult, TianGanDiZhi, WuXingStrength } from '@/types';

/**
 * 计算四柱八字
 * @param birthData 出生数据
 * @returns 八字结果
 */
export function calculateSiZhu(birthData: BirthData): BaziResult {
  const startTime = Date.now();

  // 解析出生日期时间
  const [year, month, day] = birthData.birthDate.split('-').map(Number);
  const [hour, minute] = birthData.birthTime.split(':').map(Number);

  // 创建日期对象
  const birthDate = new Date(year, month - 1, day, hour, minute);

  // 计算真太阳时
  const trueSolarTime = calculateTrueSolarTime(
    birthDate,
    birthData.location.longitude,
    parseFloat(birthData.location.timezone.split('UTC')[1] || '8') / 100 || 8
  );

  // 使用 lunar-javascript 计算八字
  const solar = birthDate;
  const lunar = Lunar.fromYmd(
    solar.getFullYear(),
    solar.getMonth() + 1,
    solar.getDate()
  );

  // 获取八Z
  const bazi = lunar.getEightChar();

  // 获取时柱（根据真太阳时）
  const hourIndex = Math.floor(trueSolarTime.getUTCHours() / 2);
  const hourZhi = bazi.getTimeZhi(hourIndex);

  // 构建四柱八字
  const siZhu = {
    year: {
      gan: bazi.getYearGan() as any,
      zhi: bazi.getYearZhi() as any,
    },
    month: {
      gan: bazi.getMonthGan() as any,
      zhi: bazi.getMonthZhi() as any,
    },
    day: {
      gan: bazi.getDayGan() as any,
      zhi: bazi.getDayZhi() as any,
    },
    hour: {
      gan: bazi.getTimeGan(hourIndex) as any,
      zhi: hourZhi as any,
    },
  };

  // 计算五行强弱
  const wuXing = calculateWuXingStrength(siZhu);

  // 计算大运
  const daYun = calculateDaYun(lunar, birthData.gender);

  const endTime = Date.now();

  return {
    siZhu,
    wuXing,
    daYun,
    trueSolarTime,
    calculatedAt: new Date(),
    calculationTime: endTime - startTime,
  };
}

/**
 * 计算五行强弱
 */
function calculateWuXingStrength(siZhu: {
  year: TianGanDiZhi;
  month: TianGanDiZhi;
  day: TianGanDiZhi;
  hour: TianGanDiZhi;
}): WuXingStrength {
  const pillars = [
    siZhu.year,
    siZhu.month,
    siZhu.day,
    siZhu.hour,
  ];

  const counts: Record<string, number> = {
    金: 0,
    木: 0,
    水: 0,
    火: 0,
    土: 0,
  };

  // 天干地支五行映射
  const ganWuXing: Record<string, string> = {
    甲: '木', 乙: '木',
    丙: '火', 丁: '火',
    戊: '土', 己: '土',
    庚: '金', 辛: '金',
    壬: '水', 癸: '水',
  };

  const zhiWuXing: Record<string, string> = {
    子: '水', 丑: '土', 寅: '木', 卯: '木',
    辰: '土', 巳: '火', 午: '火', 未: '土',
    申: '金', 酉: '金', 戌: '土', 亥: '水',
  };

  pillars.forEach((pillar) => {
    counts[ganWuXing[pillar.gan]]++;
    counts[zhiWuXing[pillar.zhi]]++;
  });

  return {
    metal: counts.金,
    wood: counts.木,
    water: counts.水,
    fire: counts.火,
    earth: counts.土,
  };
}

/**
 * 计算大运
 */
function calculateDaYun(lunar: Lunar, gender: string) {
  try {
    // 简化大运计算，使用基本的八字规则
    const eightChar = lunar.getEightChar();
    const yearGan = eightChar.getYearGan();

    // 判断年干阴阳（甲丙戊庚壬为阳，乙丁己辛癸为阴）
    const yangGan = ['甲', '丙', '戊', '庚', '壬'];
    const isYangYear = yangGan.includes(yearGan);

    // 计算大运方向：阳男阴女顺行，阴男阳女逆行
    const direction = (((gender === 'male') === isYangYear) ? 'forward' : 'backward') as 'forward' | 'backward';

    // 简化的起运年龄计算（通常为几岁起运）
    const startAge = 1;

    // 生成8个大运周期（每10年一运）
    const cycles = Array.from({ length: 8 }, (_, i) => {
      const age = startAge + (i * 10);
      return {
        age,
        ganZhi: `${i + 1}运`, // 简化显示
        years: [age, age + 9],
      };
    });

    return {
      startAge,
      direction,
      cycles,
    };
  } catch (error) {
    // 如果大运计算失败，返回默认值
    return {
      startAge: 1,
      direction: (gender === 'male' ? 'forward' : 'backward') as 'forward' | 'backward',
      cycles: [],
    };
  }
}
