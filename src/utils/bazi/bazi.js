/**
 * 八字计算工具
 * 基于 lunar-javascript 库
 */

import { Lunar } from 'lunar-javascript';
import { calculateTrueSolarTime } from './solar.js';

/**
 * 计算四柱八字
 * @param {Object} birthData 出生数据
 * @returns {Object} 八字结果
 */
export function calculateSiZhu(birthData) {
  const startTime = Date.now();

  const [year, month, day] = birthData.birthDate.split('-').map(Number);
  const [hour, minute] = birthData.birthTime.split(':').map(Number);

  const birthDate = new Date(year, month - 1, day, hour, minute);

  const trueSolarTime = calculateTrueSolarTime(
    birthDate,
    birthData.location.longitude,
    parseFloat(birthData.location.timezone.split('UTC')[1] || '8') / 100
  );

  const lunar = Lunar.fromYmd(
    birthDate.getFullYear(),
    birthDate.getMonth() + 1,
    birthDate.getDate()
  );

  const bazi = lunar.getEightChar();

  const hourIndex = Math.floor(trueSolarTime.getUTCHours() / 2);
  const hourZhi = bazi.getTimeZhi(hourIndex);

  const siZhu = {
    year: {
      gan: bazi.getYearGan(),
      zhi: bazi.getYearZhi(),
    },
    month: {
      gan: bazi.getMonthGan(),
      zhi: bazi.getMonthZhi(),
    },
    day: {
      gan: bazi.getDayGan(),
      zhi: bazi.getDayZhi(),
    },
    hour: {
      gan: bazi.getTimeGan(hourIndex),
      zhi: hourZhi,
    },
  };

  const wuXing = calculateWuXingStrength(siZhu);
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
function calculateWuXingStrength(siZhu) {
  const year = siZhu.year;
  const month = siZhu.month;
  const day = siZhu.day;
  const hour = siZhu.hour;

  const counts = {
    金: 0,
    木: 0,
    水: 0,
    火: 0,
    土: 0,
  };

  const pillars = [
    siZhu.year,
    siZhu.month,
    siZhu.day,
    siZhu.hour,
  ];

  pillars.forEach((pillar) => {
    counts.金++;
    counts.木++;
    counts.水++;
    counts.火++;
    counts.土++;
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
function calculateDaYun(lunar, gender) {
  try {
    const eightChar = lunar.getEightChar();

    const yearGan = eightChar.getYearGan();
    const yangGan = ['甲', '丙', '戊', '庚', '壬'];
    const isYangYear = yangGan.includes(yearGan);

    const direction = (((gender === 'male') === isYangYear) ? 'forward' : 'backward');

    const startAge = 1;

    const cycles = Array.from({ length: 8 }, (_, i) => {
      const age = startAge + (i * 10);
      const ganZhi = `${i + 1}运`;

      return {
        age,
        ganZhi,
        years: [age, age + 9],
      };
    });

    return {
      startAge,
      direction,
      cycles,
    };
  } catch (error) {
    console.error('大运计算失败:', error);
    return {
      startAge: 1,
      direction: 'forward',
      cycles: [],
    };
  }
}
