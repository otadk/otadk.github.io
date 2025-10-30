
export const getCurrentDate = () => Math.floor(Date.now() / 86400000)

export const daysToDateString = (days: number): string =>  {
  const baseDate = new Date(Date.UTC(1970, 0, 1)); // 使用 UTC 时间创建基准日期
  const targetDate = new Date(baseDate);
  targetDate.setUTCDate(targetDate.getUTCDate() + days); // 使用 UTC 方法添加天数
  const year = targetDate.getUTCFullYear();
  const month = targetDate.getUTCMonth() + 1;
  const day = targetDate.getUTCDate();
  return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}
