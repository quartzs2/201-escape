import type { CSSProperties } from "react";

import { ExternalLinkIcon } from "lucide-react";

import type {
  ApplicationDetail,
  DeleteApplicationInput,
  DeleteApplicationResult,
  UpdateApplicationStatusInput,
  UpdateApplicationStatusResult,
} from "@/lib/types/application";

import { Button } from "@/components/ui/button/Button";
import { APPLICATION_STATUS_META } from "@/lib/constants/application-status";
import { PLATFORM_LABEL } from "@/lib/constants/job-platform";
import { cn, formatAppliedAt } from "@/lib/utils";

import { BackLink } from "./BackLink";
import { ApplicationStatusSelector } from "./LazyClient";
import { DeleteApplicationButton } from "./LazyClient";

type ApplicationDetailHeroProps = {
  deleteAction: DeleteApplicationAction;
  detail: ApplicationDetail;
  updateStatusAction: UpdateStatusAction;
};

type DeleteApplicationAction = (
  input: DeleteApplicationInput,
) => Promise<DeleteApplicationResult>;

type SummaryItem = {
  label: string;
  value: string;
};

type UpdateStatusAction = (
  input: UpdateApplicationStatusInput,
) => Promise<UpdateApplicationStatusResult>;

const STATUS_PANEL_ANIMATION_DELAY = "120ms";

const HERO_OVERLAY_STYLE: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--color-primary) 16%, transparent) 0%, transparent 36%), linear-gradient(180deg, color-mix(in srgb, var(--color-muted) 78%, transparent) 0%, color-mix(in srgb, var(--color-background) 88%, transparent) 42%, var(--color-background) 100%)",
};

export function ApplicationDetailHero({
  deleteAction,
  detail,
  updateStatusAction,
}: ApplicationDetailHeroProps) {
  const statusMeta = APPLICATION_STATUS_META[detail.status];
  const isManualPlatform = detail.platform === "MANUAL";
  const hasOriginUrl =
    detail.originUrl !== null &&
    detail.originUrl.trim() !== "" &&
    !detail.originUrl.startsWith("manual:");
  const appliedAtLabel = detail.status === "SAVED" ? "저장일" : "지원일";
  const summaryItems: SummaryItem[] = [
    ...(!isManualPlatform
      ? [
          {
            label: "플랫폼",
            value: PLATFORM_LABEL[detail.platform],
          },
        ]
      : []),
    {
      label: appliedAtLabel,
      value: formatAppliedAt(detail.appliedAt),
    },
    {
      label: "현재 상태",
      value: statusMeta.label,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-background shadow-[0_36px_120px_-64px_rgba(23,23,23,0.45)] motion-safe:animate-fade-in">
      <div className="absolute inset-0" style={HERO_OVERLAY_STYLE} />
      <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:gap-10">
        <div className="space-y-8 motion-safe:animate-fade-up">
          <div className="flex items-center justify-between gap-3">
            <BackLink />
            <DeleteApplicationButton
              applicationId={detail.id}
              companyName={detail.companyName}
              deleteAction={deleteAction}
              positionTitle={detail.positionTitle}
            />
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                  statusMeta.badgeClassName,
                )}
              >
                {statusMeta.label}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {appliedAtLabel} {formatAppliedAt(detail.appliedAt)}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-[0.18em] text-primary/75 uppercase">
                {detail.companyName}
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.05]">
                {detail.positionTitle}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              {hasOriginUrl ? (
                <Button
                  asChild
                  className="h-10 rounded-full border-border/70 bg-background/80 px-4 text-sm font-semibold shadow-none"
                  variant="outline"
                >
                  <a
                    aria-label="원문 공고 보러가기"
                    href={detail.originUrl!}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    원문 공고 보기
                    <ExternalLinkIcon aria-hidden="true" className="size-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            {summaryItems.map((item) => (
              <div
                className="rounded-2xl border border-border/50 bg-background/70 px-4 py-4 backdrop-blur-sm"
                key={item.label}
              >
                <dt className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="motion-safe:animate-fade-up"
          style={{ animationDelay: STATUS_PANEL_ANIMATION_DELAY }}
        >
          <div className="rounded-[28px] border border-border/60 bg-background/90 p-5 shadow-[0_24px_60px_-40px_rgba(23,23,23,0.28)] backdrop-blur-sm sm:p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                진행 관리
              </p>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                {statusMeta.label}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                지원 단계 변경은 즉시 저장됩니다.
              </p>
            </div>

            <div className="mt-6">
              <ApplicationStatusSelector
                applicationId={detail.id}
                ariaLabel="지원 상태 변경"
                className="space-y-3"
                label="상태 변경"
                status={detail.status}
                updateStatusAction={updateStatusAction}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
