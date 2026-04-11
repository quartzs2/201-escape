import { FileTextIcon, LockKeyholeIcon } from "lucide-react";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui";
import { deleteApplication, getApplicationDetail } from "@/lib/actions";
import { updateApplicationNotes } from "@/lib/actions/updateApplicationNotes";
import { updateApplicationStatus } from "@/lib/actions/updateApplicationStatus";
import { updateJobDescription } from "@/lib/actions/updateJobDescription";

import { ApplicationDetailHero } from "./_components/ApplicationDetailHero";
import { BackLink } from "./_components/BackLink";
import { DetailSectionPanel } from "./_components/DetailSectionPanel";
import { ErrorState } from "./_components/ErrorState";
import { InterviewSection } from "./_components/InterviewSection";
import { JobDescriptionEditor } from "./_components/JobDescriptionEditor";
import { MemoEditor } from "./_components/MemoEditor";
import { SectionErrorBoundary } from "./_components/SectionErrorBoundary";

type ApplicationDetailPageProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

const DETAIL_PANEL_ANIMATION_DELAYS = {
  interview: "200ms",
  jobDescription: "160ms",
  memo: "220ms",
} as const;

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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,rgba(245,245,245,0.9)_0%,rgba(255,255,255,0.82)_18%,rgba(255,255,255,1)_40%)] pb-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ApplicationDetailHero
          deleteAction={deleteApplication}
          detail={detail}
          updateStatusAction={updateApplicationStatus}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
          <div className="order-2 grid gap-6 lg:order-1">
            <DetailSectionPanel
              className="motion-safe:animate-fade-up"
              style={{
                animationDelay: DETAIL_PANEL_ANIMATION_DELAYS.jobDescription,
              }}
            >
              <JobDescriptionEditor
                applicationId={detail.id}
                description={detail.description}
                updateDescriptionAction={updateJobDescription}
              />
            </DetailSectionPanel>

            <DetailSectionPanel
              className="motion-safe:animate-fade-up"
              style={{ animationDelay: DETAIL_PANEL_ANIMATION_DELAYS.memo }}
            >
              <MemoEditor
                applicationId={detail.id}
                notes={detail.notes}
                updateNotesAction={updateApplicationNotes}
              />
            </DetailSectionPanel>
          </div>

          <div className="order-1 grid gap-6 lg:sticky lg:top-6 lg:order-2 lg:self-start">
            <DetailSectionPanel
              className="motion-safe:animate-fade-up"
              style={{
                animationDelay: DETAIL_PANEL_ANIMATION_DELAYS.interview,
              }}
            >
              <SectionErrorBoundary>
                <Suspense fallback={<InterviewSectionSkeleton />}>
                  <InterviewSection applicationId={detail.id} />
                </Suspense>
              </SectionErrorBoundary>
            </DetailSectionPanel>
          </div>
        </div>
      </div>
    </main>
  );
}

function InterviewSectionSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="면접 일정을 불러오는 중입니다"
      className="space-y-4"
      role="status"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
