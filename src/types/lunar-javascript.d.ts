/**
 * lunar-javascript 类型声明
 */

declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    toDate(): Date;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDate(): number;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    isLeap(): boolean;
    toString(): string;
    getJieQi(): string;
    getYearShengXiao(): string;
    getXingZuo(): string;
    getEightChar(): EightChar;
    getDaYun(gender: number): DaYun;
    getSolar(): Solar;
  }

  export class EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(hourIndex: number): string;
    getTimeZhi(hourIndex: number): string;
  }

  export class DaYun {
    getStartAge(): number;
    get(index: number): DaYunYun;
  }

  export class DaYunYun {
    getStartAge(): number;
    getGanZhi(): string;
    getStartYear(): number;
  }
}
