"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui";

function EditorSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="불러오는 중입니다"
      className="space-y-4"
      role="status"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

function StatusSelectorSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="상태 선택기를 불러오는 중입니다"
      className="space-y-2"
      role="status"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton className="h-11 w-20 rounded-full" key={i} />
        ))}
      </div>
    </div>
  );
}

export const ApplicationStatusSelector = dynamic(
  () =>
    import("@/app/(protected)/_components/ApplicationStatusSelector").then(
      (m) => m.ApplicationStatusSelector,
    ),
  { loading: () => <StatusSelectorSkeleton />, ssr: false },
);

export const DeleteApplicationButton = dynamic(
  () =>
    import("./DeleteApplicationButton").then((m) => m.DeleteApplicationButton),
  { ssr: false },
);

export const JobDescriptionEditor = dynamic(
  () => import("./JobDescriptionEditor").then((m) => m.JobDescriptionEditor),
  { loading: () => <EditorSkeleton />, ssr: false },
);

export const MemoEditor = dynamic(
  () => import("./MemoEditor").then((m) => m.MemoEditor),
  { loading: () => <EditorSkeleton />, ssr: false },
);

export const InterviewFormSheet = dynamic(
  () => import("./InterviewFormSheet").then((m) => m.InterviewFormSheet),
  { ssr: false },
);

export const DeleteInterviewButton = dynamic(
  () => import("./DeleteInterviewButton").then((m) => m.DeleteInterviewButton),
  { ssr: false },
);
