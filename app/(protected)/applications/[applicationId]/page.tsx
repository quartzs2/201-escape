import {
  ExternalLinkIcon,
  FileTextIcon,
  LockKeyholeIcon,
  NotebookPenIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button/Button";
import { getApplicationDetail } from "@/lib/actions";
import { PLATFORM_LABEL } from "@/lib/constants/job-platform";
import { formatAppliedAt } from "@/lib/utils";

import { BackLink } from "./_components/BackLink";
import { DetailSection } from "./_components/DetailSection";
import { ErrorState } from "./_components/ErrorState";

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
    description: "삭제되었거나 접근할 수 없는 공고일 수 있습니다.",
    icon: FileTextIcon,
    title: "공고 상세를 찾을 수 없습니다",
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
    title: "유효하지 않은 공고 경로입니다",
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
      <main className="px-5 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <BackLink />
          <ErrorState
            description={errorMeta.description}
            icon={errorMeta.icon}
            reason={result.reason}
            title={errorMeta.title}
          />
        </div>
      </main>
    );
  }

  const detail = result.data;
  const hasOriginUrl = detail.originUrl.trim() !== "";

  return (
    <main className="px-5 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <BackLink />

        <section className="space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-sm font-medium tracking-[0.08em] text-muted-foreground uppercase">
                {PLATFORM_LABEL[detail.platform]}
              </span>
              <span aria-hidden="true" className="text-muted-foreground">
                /
              </span>
              <span className="text-sm text-muted-foreground">
                지원일 {formatAppliedAt(detail.appliedAt)}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-base font-medium text-muted-foreground">
                {detail.companyName}
              </p>
              <div className="flex items-start gap-3">
                <h1 className="max-w-3xl flex-1 text-[28px] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground sm:text-[32px]">
                  {detail.positionTitle}
                </h1>
                {hasOriginUrl && (
                  <Button
                    asChild
                    className="size-10 shrink-0 rounded-full border border-border px-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                    variant="ghost"
                  >
                    <a
                      aria-label="원문 공고 보러가기"
                      href={detail.originUrl}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      <ExternalLinkIcon aria-hidden="true" className="size-5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div aria-hidden="true" className="h-px w-full bg-border" />

        <div className="grid gap-7">
          <DetailSection
            body={detail.description ?? "공고 설명이 없습니다"}
            icon={<FileTextIcon aria-hidden="true" className="size-5" />}
            title="공고 설명"
          />
          <DetailSection
            body={detail.notes ?? "메모가 없습니다"}
            icon={<NotebookPenIcon aria-hidden="true" className="size-5" />}
            title="개인 메모"
          />
        </div>
      </div>
    </main>
  );
}
