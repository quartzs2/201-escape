const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatKoreanDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];

  return `${year}년 ${month}월 ${day}일 ${dayName}요일`;
}

export function getTimeAgo(dateString: string): string {
  const diffMs = new Date().getTime() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "오늘";
  }

  return `${diffDays}일 전`;
}
