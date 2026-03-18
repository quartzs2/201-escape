import { CalendarIcon } from "lucide-react";

import type { InterviewDetail } from "@/lib/types/interview";

import { deleteInterview } from "@/lib/actions/deleteInterview";
import { getInterviews } from "@/lib/actions/getInterviews";
import { upsertInterview } from "@/lib/actions/upsertInterview";
import { INTERVIEW_TYPE_LABEL } from "@/lib/constants/interview-type";
import { formatScheduledAt } from "@/lib/utils";

import { DeleteInterviewButton } from "./DeleteInterviewButton";
import { InterviewFormSheet } from "./InterviewFormSheet";

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

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          <CalendarIcon aria-hidden="true" className="size-5" />
        </span>
        <h2 className="text-base font-semibold tracking-[-0.01em]">
          면접 일정
        </h2>
        <div className="ml-auto">
          <InterviewFormSheet
            applicationId={applicationId}
            defaultRound={result.ok ? result.data.length + 1 : 1}
            mode="add"
            upsertAction={upsertInterview}
          />
        </div>
      </div>

      {!result.ok ? (
        <p className="text-[15px] text-muted-foreground">
          면접 일정을 불러오지 못했습니다.
        </p>
      ) : (
        <InterviewList applicationId={applicationId} interviews={result.data} />
      )}
    </section>
  );
}

function InterviewList({ applicationId, interviews }: InterviewListProps) {
  if (interviews.length === 0) {
    return (
      <p className="text-[15px] text-muted-foreground">
        등록된 면접 일정이 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {interviews.map((interview) => (
        <li
          className="space-y-1 rounded-lg border border-border px-4 py-3"
          key={interview.id}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {interview.round}차 —{" "}
              {INTERVIEW_TYPE_LABEL[interview.interviewType]}
            </span>
            {interview.isDraft && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                임시저장
              </span>
            )}
            <div className="ml-auto flex items-center gap-1">
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
          <p className="text-sm text-muted-foreground">
            {formatScheduledAt(interview.scheduledAt)}
          </p>
          {interview.location !== null && (
            <p className="text-sm text-muted-foreground">
              {interview.location}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
