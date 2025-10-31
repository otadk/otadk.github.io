
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

export const dateStringToDays = (dateString: string): number => {
  if (!/^\d{8}$/.test(dateString)) {
    throw new Error("Invalid date string format, expected YYYYMMDD");
  }

  const year = Number(dateString.slice(0, 4));
  const month = Number(dateString.slice(4, 6)) - 1; // 月份从0开始
  const day = Number(dateString.slice(6, 8));

  const baseDate = new Date(Date.UTC(1970, 0, 1));
  const targetDate = new Date(Date.UTC(year, month, day));

  const diffMs = targetDate.getTime() - baseDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)); // 转换为天数
};
