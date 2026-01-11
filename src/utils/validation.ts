/**
 * 数据验证 Schema
 * 使用 Zod 进行运行时类型验证
 */

import { z } from 'zod';

/**
 * 性别枚举
 */
export const GenderSchema = z.enum(['male', 'female'], {
  message: '请选择性别',
});

/**
 * 地理位置验证
 */
export const LocationSchema = z.object({
  country: z.string().min(1, '请输入国家'),
  province: z.string().min(1, '请输入省份'),
  city: z.string().min(1, '请输入城市'),
  latitude: z.number().min(-90, '纬度必须在-90到90之间').max(90, '纬度必须在-90到90之间'),
  longitude: z.number().min(-180, '经度必须在-180到180之间').max(180, '经度必须在-180到180之间'),
  timezone: z.string().min(1, '请选择时区'),
});

/**
 * 出生日期验证（YYYY-MM-DD 格式）
 */
export const BirthDateSchema = z.string().refine(
  (date) => {
    // 验证格式
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
      return false;
    }

    // 验证日期有效性
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return false;
    }

    // 验证年份范围（1900-2100）
    const year = parseInt(date.split('-')[0]);
    if (year < 1900 || year > 2100) {
      return false;
    }

    return true;
  },
  {
    message: '请输入有效的出生日期（YYYY-MM-DD格式，年份1900-2100）',
  }
);

/**
 * 出生时间验证（HH:mm 格式）
 */
export const BirthTimeSchema = z.string().refine(
  (time) => {
    // 验证格式
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time)) {
      return false;
    }

    return true;
  },
  {
    message: '请输入有效的出生时间（HH:mm格式，24小时制）',
  }
);

/**
 * 用户出生数据验证 Schema
 */
export const BirthDataSchema = z.object({
  name: z.string().max(50, '姓名不能超过50个字符').optional(),
  gender: GenderSchema,
  birthDate: BirthDateSchema,
  birthTime: BirthTimeSchema,
  location: LocationSchema,
  submittedAt: z.date().optional(),
  userId: z.string().optional(),
});

/**
 * 从表单数据验证出生数据
 */
export function validateBirthData(data: unknown) {
  return BirthDataSchema.safeParse(data);
}

/**
 * 验证并抛出错误
 */
export function validateBirthDataStrict(data: unknown) {
  return BirthDataSchema.parse(data);
}

/**
 * AI 模型选择验证
 */
export const AIModelSchema = z.enum([
  'gemini-2.5-flash-thinking',
  'gemini-3-pro-preview-low',
  'deepseek-v3',
  'gpt-4o',
]).optional();

/**
 * 历史记录查询参数验证
 */
export const HistoryQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

/**
 * 分页参数验证
 */
export const PaginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

/**
 * 导出类型：出生数据类型推断
 */
export type BirthDataInput = z.infer<typeof BirthDataSchema>;
export type LocationInput = z.infer<typeof LocationSchema>;
export type GenderType = z.infer<typeof GenderSchema>;
export type AIModelType = z.infer<typeof AIModelSchema>;

/**
 * 验证错误格式化
 */
export function formatZodError(error: z.ZodError): string {
  const issues = error.issues;
  return issues
    .map((err) => {
      const path = err.path.join('.');
      return path ? `${path}: ${err.message}` : err.message;
    })
    .join('; ');
}
