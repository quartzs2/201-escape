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

  if (!result.ok) {
    throw new Error(result.reason);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <span className="text-muted-foreground">
            <CalendarIcon aria-hidden="true" className="size-5" />
          </span>
          <h2 className="text-sm font-bold tracking-tight uppercase">
            면접 일정
          </h2>
        </div>
        <div className="ml-auto">
          <InterviewFormSheet
            applicationId={applicationId}
            defaultRound={result.data.length + 1}
            mode="add"
            upsertAction={upsertInterview}
          />
        </div>
      </div>

      <InterviewList applicationId={applicationId} interviews={result.data} />
    </div>
  );
}

function InterviewList({ applicationId, interviews }: InterviewListProps) {
  if (interviews.length === 0) {
    return (
      <div className="rounded-xl bg-muted/30 p-4">
        <p className="text-[15px] text-muted-foreground/60 italic">
          등록된 면접 일정이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {interviews.map((interview) => (
        <li
          className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/30"
          key={interview.id}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                <span>{interview.round}차 —</span>
                <span>{INTERVIEW_TYPE_LABEL[interview.interviewType]}</span>
              </span>
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
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-muted-foreground">
              {formatScheduledAt(interview.scheduledAt)}
            </p>
            {interview.location !== null && (
              <p className="text-xs text-muted-foreground/80">
                {interview.location}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
