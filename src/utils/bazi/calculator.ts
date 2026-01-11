/**
 * 八字计算器统一接口
 * 整合所有八字计算功能
 */

import { calculateSiZhu } from './bazi';
import { getLunarInfo } from './calendar';
import type { BirthData, BaziResult } from '@/types';

/**
 * 计算八字（统一接口）
 * @param birthData 出生数据
 * @returns 八字结果
 */
export function calculateBazi(birthData: BirthData): BaziResult {
  try {
    // 计算四柱八字
    const result = calculateSiZhu(birthData);

    return result;
  } catch (error) {
    console.error('八字计算失败:', error);
    throw new Error('八字计算失败，请检查输入信息');
  }
}

/**
 * 获取完整的八字信息（包括农历信息）
 * @param birthData 出生数据
 * @returns 完整信息
 */
export function getBaziInfo(birthData: BirthData) {
  const baziResult = calculateBazi(birthData);
  const lunarInfo = getLunarInfo(new Date(birthData.birthDate));

  return {
    bazi: baziResult,
    lunar: lunarInfo,
  };
}
