import { formatKoreanDate } from "@/lib/utils";

export function formatAppliedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatKoreanDate(date, { includeDayName: false });
}
