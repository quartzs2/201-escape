import { getTimeAgo } from "@/lib/utils";

type TimeAgoProps = {
  dateString: string;
};

export function TimeAgo({ dateString }: TimeAgoProps) {
  return <>{getTimeAgo(dateString)}</>;
}
