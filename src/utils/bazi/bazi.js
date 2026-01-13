/**
 * 八字计算工具
 * 基于 lunar-javascript 库
 */

import { Lunar, Solar } from 'lunar-javascript';
import { calculateTrueSolarTime } from './solar.js';

export function calculateSiZhu(birthData) {
  const startTime = Date.now();

  const [year, month, day] = birthData.birthDate.split('-').map(Number);
  const [hour, minute] = birthData.birthTime.split(':').map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error('出生日期格式错误，请使用 YYYY-MM-DD 格式');
  }

  if (year < 1900 || year > 2100) {
    throw new Error('出生年份必须在 1900-2100 之间');
  }

  if (month < 1 || month > 12) {
    throw new Error('出生月份必须在 1-12 之间');
  }

  if (day < 1 || day > 31) {
    throw new Error('出生日期必须在 1-31 之间');
  }

  if (isNaN(hour) || isNaN(minute)) {
    throw new Error('出生时间格式错误，请使用 HH:mm 格式');
  }

  if (hour < 0 || hour > 23) {
    throw new Error('出生小时必须在 0-23 之间');
  }

  if (minute < 0 || minute > 59) {
    throw new Error('出生分钟必须在 0-59 之间');
  }

  const birthDate = new Date(year, month - 1, day, hour, minute);

  if (isNaN(birthDate.getTime())) {
    throw new Error(`无效的日期：${year}-${month}-${day}，请检查月份和日期的组合`);
  }

  const trueSolarTime = calculateTrueSolarTime(
    birthDate,
    birthData.location.longitude,
    parseFloat(birthData.location.timezone.split('UTC')[1] || '8') / 100
  );

  const solar = Solar.fromDate(birthDate);
  const lunar = solar.getLunar();

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
