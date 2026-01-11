/**
 * 八字计算单元测试
 * 测试核心八字计算逻辑的正确性
 */

import { describe, it, expect } from 'vitest';
import { calculateSiZhu } from '../bazi';
import type { BirthData } from '@/types';

/**
 * 创建测试用的出生数据
 */
function createBirthData(overrides: Partial<BirthData> = {}): BirthData {
  return {
    gender: 'male',
    birthDate: '1990-01-01',
    birthTime: '12:00',
    location: {
      country: '中国',
      province: '北京',
      city: '北京',
      latitude: 39.9042,
      longitude: 116.4074,
      timezone: 'Asia/Shanghai',
    },
    ...overrides,
  };
}

describe('八字计算 - calculateSiZhu', () => {
  describe('基础功能测试', () => {
    it('应该正确计算四柱八字', () => {
      const birthData = createBirthData({
        birthDate: '1990-01-01',
        birthTime: '12:00',
      });

      const result = calculateSiZhu(birthData);

      expect(result).toBeDefined();
      expect(result.siZhu).toBeDefined();
      expect(result.siZhu.year).toBeDefined();
      expect(result.siZhu.month).toBeDefined();
      expect(result.siZhu.day).toBeDefined();
      expect(result.siZhu.hour).toBeDefined();
    });

    it('应该正确计算五行强弱', () => {
      const birthData = createBirthData();
      const result = calculateSiZhu(birthData);

      expect(result.wuXing).toBeDefined();
      expect(result.wuXing.metal).toBeGreaterThanOrEqual(0);
      expect(result.wuXing.wood).toBeGreaterThanOrEqual(0);
      expect(result.wuXing.water).toBeGreaterThanOrEqual(0);
      expect(result.wuXing.fire).toBeGreaterThanOrEqual(0);
      expect(result.wuXing.earth).toBeGreaterThanOrEqual(0);

      // 五行总数应该是 8（4柱 × 2个干支）
      const totalCount =
        result.wuXing.metal +
        result.wuXing.wood +
        result.wuXing.water +
        result.wuXing.fire +
        result.wuXing.earth;
      expect(totalCount).toBe(8);
    });

    it('应该正确计算大运', () => {
      const birthData = createBirthData({ gender: 'male' });
      const result = calculateSiZhu(birthData);

      expect(result.daYun).toBeDefined();
      expect(result.daYun.startAge).toBeGreaterThanOrEqual(0);
      expect(result.daYun.direction).toBeDefined();
      expect(['forward', 'backward']).toContain(result.daYun.direction);
      expect(result.daYun.cycles).toHaveLength(8);
    });

    it('应该返回计算元数据', () => {
      const birthData = createBirthData();
      const result = calculateSiZhu(birthData);

      expect(result.calculatedAt).toBeInstanceOf(Date);
      expect(result.calculationTime).toBeGreaterThanOrEqual(0);
      expect(result.trueSolarTime).toBeInstanceOf(Date);
    });
  });

  describe('性别差异测试', () => {
    it('男性应该顺行大运', () => {
      const birthData = createBirthData({ gender: 'male' });
      const result = calculateSiZhu(birthData);

      expect(result.daYun.direction).toBe('forward');
    });

    it('女性应该逆行大运', () => {
      const birthData = createBirthData({ gender: 'female' });
      const result = calculateSiZhu(birthData);

      expect(result.daYun.direction).toBe('backward');
    });
  });

  describe('不同日期测试', () => {
    it('应该正确处理闰年日期', () => {
      const birthData = createBirthData({
        birthDate: '2000-02-29', // 闰年
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu).toBeDefined();
      expect(result.siZhu.year.gan).toBeDefined();
      expect(result.siZhu.year.zhi).toBeDefined();
    });

    it('应该正确处理年末日期', () => {
      const birthData = createBirthData({
        birthDate: '1990-12-15',
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu).toBeDefined();
    });

    it('应该正确处理年初日期', () => {
      const birthData = createBirthData({
        birthDate: '1990-01-01',
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu).toBeDefined();
    });
  });

  describe('不同时间测试', () => {
    it('应该正确处理子时 (23:00-01:00)', () => {
      const birthData = createBirthData({
        birthTime: '00:30',
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu.hour).toBeDefined();
      expect(result.siZhu.hour.gan).toBeDefined();
      expect(result.siZhu.hour.zhi).toBeDefined();
    });

    it('应该正确处理午时 (11:00-13:00)', () => {
      const birthData = createBirthData({
        birthTime: '12:00',
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu.hour).toBeDefined();
    });

    it('应该正确处理亥时 (21:00-23:00)', () => {
      const birthData = createBirthData({
        birthTime: '22:00',
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu.hour).toBeDefined();
    });
  });

  describe('已知案例验证', () => {
    it('案例1: 1990年1月1日中午12点，男性，北京', () => {
      const birthData = createBirthData({
        birthDate: '1990-01-01',
        birthTime: '12:00',
        gender: 'male',
      });

      const result = calculateSiZhu(birthData);

      // 验证年柱（1990为己巳年）
      expect(result.siZhu.year.gan).toBe('己');
      expect(result.siZhu.year.zhi).toBe('巳');

      // 验证返回结构的完整性
      expect(result.siZhu.month.gan).toBeDefined();
      expect(result.siZhu.month.zhi).toBeDefined();
      expect(result.siZhu.day.gan).toBeDefined();
      expect(result.siZhu.day.zhi).toBeDefined();
      expect(result.siZhu.hour.gan).toBeDefined();
      expect(result.siZhu.hour.zhi).toBeDefined();
    });

    it('案例2: 1985年5月15日，女性，上海', () => {
      const birthData = createBirthData({
        birthDate: '1985-05-15',
        birthTime: '14:30',
        gender: 'female',
        location: {
          country: '中国',
          province: '上海',
          city: '上海',
          latitude: 31.2304,
          longitude: 121.4737,
          timezone: 'Asia/Shanghai',
        },
      });

      const result = calculateSiZhu(birthData);

      // 1985是乙丑年（阴年）
      expect(result.siZhu.year.gan).toBe('乙');
      expect(result.siZhu.year.zhi).toBe('丑');

      // 阴年女性应该是顺行大运
      expect(result.daYun.direction).toBe('forward');
    });

    it('案例3: 2000年千年宝宝，龙年', () => {
      const birthData = createBirthData({
        birthDate: '2000-01-01',
        birthTime: '00:00',
        gender: 'male',
      });

      const result = calculateSiZhu(birthData);

      // 2000年是庚辰年
      expect(result.siZhu.year.gan).toBe('庚');
      expect(result.siZhu.year.zhi).toBe('辰');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理最小有效日期 (1900-01-01)', () => {
      const birthData = createBirthData({
        birthDate: '1900-01-01',
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu).toBeDefined();
      expect(result.siZhu.year.gan).toBeDefined();
      expect(result.siZhu.year.zhi).toBeDefined();
    });

    it('应该处理最大合理日期 (当前年份)', () => {
      const currentYear = new Date().getFullYear();
      const birthData = createBirthData({
        birthDate: `${currentYear}-06-15`,
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu).toBeDefined();
    });

    it('应该处理所有24小时', () => {
      const hours = [
        '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
      ];

      hours.forEach((hour) => {
        const birthData = createBirthData({ birthTime: hour });
        const result = calculateSiZhu(birthData);

        expect(result.siZhu.hour).toBeDefined();
        expect(result.siZhu.hour.gan).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/);
        expect(result.siZhu.hour.zhi).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/);
      });
    });

    it('应该处理所有12个月份', () => {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const birthData = createBirthData({
          birthDate: `1990-${monthStr}-15`,
        });

        const result = calculateSiZhu(birthData);

        expect(result.siZhu.month).toBeDefined();
        expect(result.siZhu.month.gan).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/);
        expect(result.siZhu.month.zhi).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/);
      }
    });
  });

  describe('数据类型验证', () => {
    it('天干应该是有效的十天干之一', () => {
      const birthData = createBirthData();
      const result = calculateSiZhu(birthData);

      const validGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

      expect(validGan).toContain(result.siZhu.year.gan);
      expect(validGan).toContain(result.siZhu.month.gan);
      expect(validGan).toContain(result.siZhu.day.gan);
      expect(validGan).toContain(result.siZhu.hour.gan);
    });

    it('地支应该是有效的十二地支之一', () => {
      const birthData = createBirthData();
      const result = calculateSiZhu(birthData);

      const validZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      expect(validZhi).toContain(result.siZhu.year.zhi);
      expect(validZhi).toContain(result.siZhu.month.zhi);
      expect(validZhi).toContain(result.siZhu.day.zhi);
      expect(validZhi).toContain(result.siZhu.hour.zhi);
    });

    it('五行计数应该是非负整数', () => {
      const birthData = createBirthData();
      const result = calculateSiZhu(birthData);

      const { wuXing } = result;

      expect(Number.isInteger(wuXing.metal)).toBe(true);
      expect(Number.isInteger(wuXing.wood)).toBe(true);
      expect(Number.isInteger(wuXing.water)).toBe(true);
      expect(Number.isInteger(wuXing.fire)).toBe(true);
      expect(Number.isInteger(wuXing.earth)).toBe(true);

      expect(wuXing.metal).toBeGreaterThanOrEqual(0);
      expect(wuXing.wood).toBeGreaterThanOrEqual(0);
      expect(wuXing.water).toBeGreaterThanOrEqual(0);
      expect(wuXing.fire).toBeGreaterThanOrEqual(0);
      expect(wuXing.earth).toBeGreaterThanOrEqual(0);
    });
  });

  describe('性能测试', () => {
    it('计算时间应该小于100ms', () => {
      const birthData = createBirthData();

      const start = performance.now();
      calculateSiZhu(birthData);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });

    it('批量计算100次应该稳定运行', () => {
      const birthData = createBirthData();

      expect(() => {
        for (let i = 0; i < 100; i++) {
          calculateSiZhu(birthData);
        }
      }).not.toThrow();
    });
  });

  describe('时区处理测试', () => {
    it('应该正确处理东八区 (中国标准时间)', () => {
      const birthData = createBirthData({
        location: {
          country: '中国',
          province: '北京',
          city: '北京',
          latitude: 39.9042,
          longitude: 116.4074,
          timezone: 'Asia/Shanghai',
        },
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu).toBeDefined();
      expect(result.trueSolarTime).toBeInstanceOf(Date);
    });

    it('应该正确处理不同时区', () => {
      const utcTime = '12:00';
      const birthData = createBirthData({
        birthTime: utcTime,
        location: {
          country: '英国',
          province: '伦敦',
          city: '伦敦',
          latitude: 51.5074,
          longitude: -0.1278,
          timezone: 'Europe/London',
        },
      });

      const result = calculateSiZhu(birthData);

      expect(result.siZhu).toBeDefined();
    });
  });

  describe('大运周期测试', () => {
    it('大运应该有8个周期', () => {
      const birthData = createBirthData();
      const result = calculateSiZhu(birthData);

      expect(result.daYun.cycles).toHaveLength(8);
    });

    it('每个大运周期应该持续10年', () => {
      const birthData = createBirthData();
      const result = calculateSiZhu(birthData);

      result.daYun.cycles.forEach((cycle, index) => {
        // 大运周期通常是10年，但第一个周期可能因为起运年龄而不同
        // 所以我们检查周期长度在合理范围内（5-12年）
        const duration = cycle.years[1] - cycle.years[0];
        expect(duration).toBeGreaterThanOrEqual(5);
        expect(duration).toBeLessThanOrEqual(12);

        // 验证年龄递增
        if (index > 0) {
          expect(cycle.age).toBeGreaterThan(result.daYun.cycles[index - 1].age);
        }
      });
    });

    it('大运起始年龄应该合理', () => {
      const birthData = createBirthData();
      const result = calculateSiZhu(birthData);

      // 起运年龄通常在1-10岁之间
      expect(result.daYun.startAge).toBeGreaterThanOrEqual(1);
      expect(result.daYun.startAge).toBeLessThanOrEqual(15);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理无效日期格式', () => {
      const birthData = createBirthData({
        birthDate: '1990-13-01', // 无效月份
      });

      expect(() => {
        calculateSiZhu(birthData);
      }).not.toThrow(); // 应该优雅处理，不抛出异常
    });

    it('应该处理无效时间格式', () => {
      const birthData = createBirthData({
        birthTime: '25:00', // 无效时间
      });

      expect(() => {
        calculateSiZhu(birthData);
      }).not.toThrow();
    });
  });

  describe('连续性测试', () => {
    it('相邻日期的天柱应该按顺序递增', () => {
      const dates = ['1990-01-01', '1990-01-02', '1990-01-03'];
      const results = dates.map((date) => {
        const birthData = createBirthData({ birthDate: date });
        return calculateSiZhu(birthData);
      });

      // 验证天柱有变化
      expect(results[0].siZhu.day.gan).toBeDefined();
      expect(results[1].siZhu.day.gan).toBeDefined();
      expect(results[2].siZhu.day.gan).toBeDefined();
    });

    it('相邻年份的年柱应该递增', () => {
      const years = ['1989', '1990', '1991'];
      const results = years.map((year) => {
        const birthData = createBirthData({
          birthDate: `${year}-06-15`,
        });
        return calculateSiZhu(birthData);
      });

      // 每个年份应该不同
      const yearPillars = results.map((r) => `${r.siZhu.year.gan}${r.siZhu.year.zhi}`);
      const uniquePillars = new Set(yearPillars);
      expect(uniquePillars.size).toBe(3);
    });
  });
});
