import { FileTextIcon, LockKeyholeIcon } from "lucide-react";
import { type CSSProperties, Suspense } from "react";

import { ApplicationsProviders } from "@/app/(protected)/applications/ApplicationsProviders";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { deleteApplication, getApplicationDetail } from "@/lib/actions";
import { updateApplicationNotes } from "@/lib/actions/updateApplicationNotes";
import { updateApplicationStatus } from "@/lib/actions/updateApplicationStatus";
import { updateJobDescription } from "@/lib/actions/updateJobDescription";

import { ApplicationDetailHero } from "./_components/ApplicationDetailHero";
import { BackLink } from "./_components/BackLink";
import { DetailSectionPanel } from "./_components/DetailSectionPanel";
import { ErrorState } from "./_components/ErrorState";
import { InterviewSection } from "./_components/InterviewSection";
import { JobDescriptionEditor, MemoEditor } from "./_components/LazyClient";
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

const DETAIL_PAGE_BACKGROUND_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, color-mix(in srgb, var(--color-muted) 72%, transparent) 0%, color-mix(in srgb, var(--color-background) 88%, transparent) 18%, var(--color-background) 40%)",
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
  return (
    <Suspense fallback={<ApplicationDetailPageSkeleton />}>
      <ApplicationDetailContent params={params} />
    </Suspense>
  );
}

async function ApplicationDetailContent({
  params,
}: ApplicationDetailPageProps) {
  const { applicationId } = await params;
  const result = await getApplicationDetail(applicationId);

  if (!result.ok) {
    const errorMeta = ERROR_STATE_META[result.code];

    return (
      <main className="min-h-screen bg-muted/30">
        <header className="sticky top-16 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
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
  const shouldShowJobDescription = detail.platform !== "MANUAL";

  return (
    <main
      className="min-h-screen bg-background pb-20"
      style={DETAIL_PAGE_BACKGROUND_STYLE}
    >
      <ApplicationsProviders>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <ApplicationDetailHero
            deleteAction={deleteApplication}
            detail={detail}
            updateStatusAction={updateApplicationStatus}
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
            <div className="order-2 grid gap-6 lg:order-1">
              {shouldShowJobDescription ? (
                <DetailSectionPanel
                  className="motion-safe:animate-fade-up"
                  style={{
                    animationDelay:
                      DETAIL_PANEL_ANIMATION_DELAYS.jobDescription,
                  }}
                >
                  <JobDescriptionEditor
                    applicationId={detail.id}
                    description={detail.description}
                    updateDescriptionAction={updateJobDescription}
                  />
                </DetailSectionPanel>
              ) : null}

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
      </ApplicationsProviders>
    </main>
  );
}

function ApplicationDetailPageSkeleton() {
  return (
    <main
      className="min-h-screen bg-background pb-20"
      style={DETAIL_PAGE_BACKGROUND_STYLE}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section
          aria-busy="true"
          aria-label="지원 상세 정보를 불러오는 중입니다"
          className="relative overflow-hidden rounded-[32px] border border-border/60 bg-background p-5 shadow-[0_36px_120px_-64px_rgba(23,23,23,0.45)] sm:p-8"
          role="status"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:gap-10">
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-18 rounded-full" />
                  <Skeleton className="h-4 w-28 rounded-full" />
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-12 w-full max-w-2xl rounded-2xl" />
                </div>

                <Skeleton className="h-10 w-32 rounded-full" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    className="rounded-2xl border border-border/50 bg-background/70 px-4 py-4"
                    key={index}
                  >
                    <Skeleton className="h-4 w-14 rounded-full" />
                    <Skeleton className="mt-2 h-5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border/60 bg-background/90 p-5 sm:p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-18 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-4 w-40 rounded-full" />
              </div>

              <div className="mt-6 space-y-3">
                <Skeleton className="h-4 w-16 rounded-full" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton className="h-11 w-20 rounded-full" key={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
          <div className="order-2 grid gap-6 lg:order-1">
            <DetailSectionPanel>
              <EditorSectionSkeleton />
            </DetailSectionPanel>
            <DetailSectionPanel>
              <EditorSectionSkeleton />
            </DetailSectionPanel>
          </div>

          <div className="order-1 lg:order-2">
            <DetailSectionPanel>
              <InterviewSectionSkeleton />
            </DetailSectionPanel>
          </div>
        </div>
      </div>
    </main>
  );
}

function EditorSectionSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="편집 영역을 불러오는 중입니다"
      className="space-y-4"
      role="status"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
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
