import {
  ExternalLinkIcon,
  FileTextIcon,
  ListChecksIcon,
  LockKeyholeIcon,
} from "lucide-react";

import { ApplicationStatusSelector } from "@/app/(protected)/_components/ApplicationStatusSelector";
import { Button } from "@/components/ui/button/Button";
import { deleteApplication, getApplicationDetail } from "@/lib/actions";
import { updateApplicationNotes } from "@/lib/actions/updateApplicationNotes";
import { updateApplicationStatus } from "@/lib/actions/updateApplicationStatus";
import { updateJobDescription } from "@/lib/actions/updateJobDescription";
import { PLATFORM_LABEL } from "@/lib/constants/job-platform";
import { formatAppliedAt } from "@/lib/utils";

import { BackLink } from "./_components/BackLink";
import { DeleteApplicationButton } from "./_components/DeleteApplicationButton";
import { ErrorState } from "./_components/ErrorState";
import { InterviewSection } from "./_components/InterviewSection";
import { JobDescriptionEditor } from "./_components/JobDescriptionEditor";
import { MemoEditor } from "./_components/MemoEditor";

type ApplicationDetailPageProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

const ERROR_STATE_META = {
  AUTH_REQUIRED: {
    description: "상세 내용을 보려면 로그인 상태가 필요합니다.",
    icon: LockKeyholeIcon,
    title: "로그인이 필요합니다",
  },
  NOT_FOUND: {
    description: "삭제되었거나 접근할 수 없는 지원 기록일 수 있습니다.",
    icon: FileTextIcon,
    title: "지원 기록을 찾을 수 없습니다",
  },
  QUERY_ERROR: {
    description: "잠시 후 다시 시도하거나 대시보드에서 다시 진입해 주세요.",
    icon: FileTextIcon,
    title: "상세 정보를 불러오지 못했습니다",
  },
  UNKNOWN_ERROR: {
    description: "응답 형식을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    icon: FileTextIcon,
    title: "예상하지 못한 오류가 발생했습니다",
  },
  VALIDATION_ERROR: {
    description: "잘못된 상세 경로로 접근했습니다.",
    icon: FileTextIcon,
    title: "유효하지 않은 지원 경로입니다",
  },
} as const;

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { applicationId } = await params;
  const result = await getApplicationDetail(applicationId);

  if (!result.ok) {
    const errorMeta = ERROR_STATE_META[result.code];

    return (
      <main className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <BackLink />
          <h1 className="text-sm font-semibold tracking-tight">오류</h1>
        </header>
        <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-6 lg:px-8">
          <ErrorState
            description={errorMeta.description}
            icon={errorMeta.icon}
            title={errorMeta.title}
          />
        </div>
      </main>
    );
  }

  const detail = result.data;
  const hasOriginUrl =
    detail.originUrl !== null &&
    detail.originUrl.trim() !== "" &&
    !detail.originUrl.startsWith("manual:");

  return (
    <main className="min-h-screen bg-muted/30 pb-20">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <BackLink />
          <DeleteApplicationButton
            applicationId={detail.id}
            companyName={detail.companyName}
            deleteAction={deleteApplication}
            positionTitle={detail.positionTitle}
          />
        </div>

        <section className="space-y-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-muted-foreground">
              {detail.platform !== "MANUAL" && (
                <>
                  <span className="tracking-wider uppercase">
                    {PLATFORM_LABEL[detail.platform]}
                  </span>
                  <span aria-hidden="true" className="opacity-40">
                    /
                  </span>
                </>
              )}
              <span className="flex gap-1">
                <span>{detail.status === "SAVED" ? "저장일" : "지원일"}</span>
                <span>{formatAppliedAt(detail.appliedAt)}</span>
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-lg font-medium text-muted-foreground">
                  {detail.companyName}
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {detail.positionTitle}
                </h1>
              </div>
              {hasOriginUrl && (
                <Button
                  asChild
                  className="size-10 shrink-0 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  variant="ghost"
                >
                  <a
                    aria-label="원문 공고 보러가기"
                    href={detail.originUrl!}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    <ExternalLinkIcon aria-hidden="true" className="size-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
            <ApplicationStatusSelector
              applicationId={detail.id}
              ariaLabel="지원 상태 변경"
              icon={<ListChecksIcon aria-hidden="true" className="size-4" />}
              key={detail.id}
              label="지원 상태"
              status={detail.status}
              updateStatusAction={updateApplicationStatus}
            />
          </div>
        </section>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
            <InterviewSection applicationId={detail.id} />
          </div>

          <div className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
            <JobDescriptionEditor
              applicationId={detail.id}
              description={detail.description}
              updateDescriptionAction={updateJobDescription}
            />
          </div>

          <div className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
            <MemoEditor
              applicationId={detail.id}
              notes={detail.notes}
              updateNotesAction={updateApplicationNotes}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
