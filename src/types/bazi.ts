/**
 * 八字命理相关类型定义
 */

/**
 * 天干地支类型
 */
export type TianGan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';
export type DiZhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

/**
 * 天干地支组合
 */
export interface TianGanDiZhi {
  /** 天干 */
  gan: TianGan;
  /** 地支 */
  zhi: DiZhi;
}

/**
 * 性别
 */
export type Gender = 'male' | 'female';

/**
 * 地理位置
 */
export interface Location {
  /** 国家 */
  country: string;
  /** 省份 */
  province: string;
  /** 城市 */
  city: string;
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 时区（如 Asia/Shanghai） */
  timezone: string;
}

/**
 * 用户输入的出生数据
 */
export interface BirthData {
  /** 姓名（可选） */
  name?: string;
  /** 性别 */
  gender: Gender;
  /** 出生日期（YYYY-MM-DD 格式） */
  birthDate: string;
  /** 出生时间（HH:mm 格式） */
  birthTime: string;
  /** 出生地 */
  location: Location;
  /** 提交时间戳 */
  submittedAt?: Date;
  /** 用户ID（可选，用于历史记录） */
  userId?: string;
}

/**
 * 四柱八字
 */
export interface SiZhu {
  /** 年柱 */
  year: TianGanDiZhi;
  /** 月柱 */
  month: TianGanDiZhi;
  /** 日柱 */
  day: TianGanDiZhi;
  /** 时柱 */
  hour: TianGanDiZhi;
}

/**
 * 五行
 */
export type WuXing = 'metal' | 'wood' | 'water' | 'fire' | 'earth';

/**
 * 五行强弱
 */
export interface WuXingStrength {
  /** 金 */
  metal: number;
  /** 木 */
  wood: number;
  /** 水 */
  water: number;
  /** 火 */
  fire: number;
  /** 土 */
  earth: number;
}

/**
 * 大运周期
 */
export interface DaYunCycle {
  /** 起始年龄 */
  age: number;
  /** 干支 */
  ganZhi: string;
  /** 覆盖的年份 */
  years: number[];
}

/**
 * 大运信息
 */
export interface DaYun {
  /** 起运年龄 */
  startAge: number;
  /** 大运方向（顺行/逆行） */
  direction: 'forward' | 'backward';
  /** 大运周期（每10年一运） */
  cycles: DaYunCycle[];
}

/**
 * 八字排盘完整结果
 */
export interface BaziResult {
  /** 四柱八字 */
  siZhu: SiZhu;
  /** 五行强弱 */
  wuXing: WuXingStrength;
  /** 大运信息 */
  daYun: DaYun;
  /** 真太阳时 */
  trueSolarTime: Date;
  /** 计算元数据 */
  calculatedAt: Date;
  /** 计算耗时（毫秒） */
  calculationTime: number;
}
