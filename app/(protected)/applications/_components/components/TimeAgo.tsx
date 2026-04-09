"use client";

import { useEffect, useState } from "react";

import { getTimeAgo } from "@/lib/utils";

type TimeAgoProps = {
  dateString: string;
};

export function TimeAgo({ dateString }: TimeAgoProps) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  return <>{getTimeAgo(dateString)}</>;
}
