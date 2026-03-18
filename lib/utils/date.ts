const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;
const KST_TIMEZONE = "Asia/Seoul";
const DOW_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

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
  const { day, dayOfWeek, month, year } = getKstComponents(date);
  const includeDayName = options?.includeDayName ?? true;

  if (!includeDayName) {
    return `${year}년 ${month}월 ${day}일`;
  }

  const dayName = DAY_NAMES[dayOfWeek];

  return `${year}년 ${month}월 ${day}일 ${dayName}요일`;
}

export function formatScheduledAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const { hours, minutes } = getKstComponents(date);
  const formatted = formatKoreanDate(date, { includeDayName: true });
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");

  return `${formatted} ${h}:${m}`;
}

export function getTimeAgo(dateString: string): string {
  const diffMs = new Date().getTime() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "오늘";
  }

  return `${diffDays}일 전`;
}

/**
 * ISO 문자열을 <input type="datetime-local"> 값 형식으로 변환합니다.
 * 브라우저 로컬 시간대 기준으로 표시합니다 (클라이언트 전용).
 */
export function toDatetimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * 날짜를 KST 기준 컴포넌트로 분해합니다.
 * 서버(UTC)와 클라이언트 어느 환경에서 호출해도 KST 값을 반환합니다.
 */
function getKstComponents(date: Date): {
  day: number;
  dayOfWeek: number;
  hours: number;
  minutes: number;
  month: number;
  year: number;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: KST_TIMEZONE,
    year: "numeric",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0");

  const weekdayStr = new Intl.DateTimeFormat("en-US", {
    timeZone: KST_TIMEZONE,
    weekday: "short",
  }).format(date);

  const hourRaw = get("hour");

  return {
    day: get("day"),
    dayOfWeek: Math.max(
      0,
      DOW_EN.indexOf(weekdayStr as (typeof DOW_EN)[number]),
    ),
    hours: hourRaw === 24 ? 0 : hourRaw,
    minutes: get("minute"),
    month: get("month"),
    year: get("year"),
  };
}
