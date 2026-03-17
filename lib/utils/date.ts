const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

type FormatKoreanDateOptions = {
  includeDayName?: boolean;
};

export function formatAppliedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatKoreanDate(date, { includeDayName: false });
}

export function formatKoreanDate(
  date: Date,
  options?: FormatKoreanDateOptions,
): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const includeDayName = options?.includeDayName ?? true;

  if (!includeDayName) {
    return `${year}년 ${month}월 ${day}일`;
  }

  const dayName = DAY_NAMES[date.getDay()];

  return `${year}년 ${month}월 ${day}일 ${dayName}요일`;
}

export function formatScheduledAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const formatted = formatKoreanDate(date, { includeDayName: true });
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${formatted} ${hours}:${minutes}`;
}

export function getTimeAgo(dateString: string): string {
  const diffMs = new Date().getTime() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "오늘";
  }

  return `${diffDays}일 전`;
}

export function toDatetimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
