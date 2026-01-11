/**
 * 农历转换功能
 * 基于 lunar-javascript 库
 */

import { Lunar, Solar } from 'lunar-javascript';

/**
 * 公历转农历
 * @param solarDate 公历日期
 * @returns 农历日期
 */
export function solarToLunar(solarDate: Date): Lunar {
  const solar = Solar.fromDate(solarDate);
  return solar.getLunar();
}

/**
 * 农历转公历
 * @param lunarYear 农历年
 * @param lunarMonth 农历月
 * @param lunarDay 农历日
 * @returns 公历日期
 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number): Date {
  const lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
  return lunar.getSolar().toDate();
}

/**
 * 获取农历信息
 * @param date 公历日期
 * @returns 农历详细信息
 */
export function getLunarInfo(date: Date) {
  const lunar = solarToLunar(date);
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    yearCn: lunar.getYearInChinese(),
    monthCn: lunar.getMonthInChinese(),
    dayCn: lunar.getDayInChinese(),
    isLeap: lunar.isLeap(),
    fullString: lunar.toString(),
    // 节气
    jieQi: lunar.getJieQi(),
    // 生肖
    zodiac: lunar.getYearShengXiao(),
    // 星座
    constellation: lunar.getXingZuo(),
  };
}
