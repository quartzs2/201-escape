import { CalendarIcon } from "lucide-react";

import type { InterviewDetail } from "@/lib/types/interview";

import { deleteInterview } from "@/lib/actions/deleteInterview";
import { getInterviews } from "@/lib/actions/getInterviews";
import { upsertInterview } from "@/lib/actions/upsertInterview";
import { INTERVIEW_TYPE_LABEL } from "@/lib/constants/interview-type";
import { formatScheduledAt } from "@/lib/utils";

import { DetailSectionHeader } from "./DetailSectionHeader";
import { DeleteInterviewButton, InterviewFormSheet } from "./LazyClient";

type InterviewListProps = {
  applicationId: string;
  interviews: InterviewDetail[];
};

type InterviewSectionProps = {
  applicationId: string;
};

export async function InterviewSection({
  applicationId,
}: InterviewSectionProps) {
  const result = await getInterviews(applicationId);

  if (!result.ok) {
    throw new Error(result.reason);
  }

  return (
    <div className="space-y-4">
      <DetailSectionHeader
        action={
          <InterviewFormSheet
            applicationId={applicationId}
            defaultRound={result.data.length + 1}
            mode="add"
            upsertAction={upsertInterview}
          />
        }
        description="다음 면접 일정을 추가하고 기존 일정을 수정합니다."
        icon={<CalendarIcon aria-hidden="true" className="size-5" />}
        title="면접 일정"
      />

      <InterviewList applicationId={applicationId} interviews={result.data} />
    </div>
  );
}

function InterviewList({ applicationId, interviews }: InterviewListProps) {
  if (interviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-5">
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          등록된 면접 일정이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-muted/10">
      {interviews.map((interview) => (
        <li
          className="flex flex-col gap-3 px-4 py-4 sm:px-5"
          key={interview.id}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {interview.round}차
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {INTERVIEW_TYPE_LABEL[interview.interviewType]}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {formatScheduledAt(interview.scheduledAt)}
                </p>
                {interview.location !== null ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {interview.location}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <InterviewFormSheet
                applicationId={applicationId}
                interview={interview}
                mode="edit"
                upsertAction={upsertInterview}
              />
              <DeleteInterviewButton
                applicationId={applicationId}
                deleteAction={deleteInterview}
                interviewId={interview.id}
                round={interview.round}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
