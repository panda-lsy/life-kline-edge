/**
 * 真太阳时计算
 * 根据经纬度和时区计算真太阳时
 */

/**
 * 计算真太阳时
 * @param {Date} date 日期时间
 * @param {number} longitude 经度
 * @param {number} timezone 时区偏移（小时，东八区为 8）
 * @returns {Date} 真太阳时
 */
export function calculateTrueSolarTime(
  date,
  longitude,
  timezone
) {
  // 将时间转换为 UTC
  const utc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );

  // 时区差（分钟）
  const timezoneOffset = timezone * 60;

  // 经度差（分钟），每1度4分钟
  const longitudeOffset = longitude * 4;

  // 真太阳时修正（均时差）
  // 使用简化的均时差公式
  const dayOfYear = getDayOfYear(date);
  const B = (360 / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // 真太阳时（分钟）
  const trueSolarOffset = timezoneOffset + longitudeOffset + eot;

  // 转换为毫秒
  const offsetMs = trueSolarOffset * 60 * 1000;

  // 计算真太阳时
  const trueSolarTime = new Date(utc + offsetMs);

  return trueSolarTime;
}

/**
 * 获取一年中的第几天
 * @param {Date} date 日期
 * @returns {number} 一年中的第几天
 */
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * 格式化真太阳时为 HH:mm
 * @param {Date} date 日期
 * @returns {string} 格式化后的时间字符串
 */
export function formatTrueSolarTime(date) {
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
