"use client";

import type { Route } from "next";

import {
  AlertCircleIcon,
  ChevronRightIcon,
  FileTextIcon,
  ListChecksIcon,
  StickyNoteIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import type {
  ApplicationDetail,
  ApplicationListItem,
} from "@/lib/types/application";
import type { JobStatus } from "@/lib/types/job";

import { ApplicationStatusSelector } from "@/app/(protected)/_components/ApplicationStatusSelector";
import { BottomSheet, Button, Skeleton } from "@/components/ui";
import { getApplicationDetail } from "@/lib/actions";
import { updateApplicationStatus } from "@/lib/actions/updateApplicationStatus";

import {
  formatAppliedAt,
  getDescriptionMeta,
  getErrorSummary,
  getNotesMeta,
} from "../../_utils/preview";
import { PLATFORM_LABEL } from "../constants";
import { ApplicationPreviewSection } from "./ApplicationPreviewSection";

type ApplicationPreviewSheetProps = {
  application: ApplicationListItem | null;
  isOpen: boolean;
  onCloseAction: () => void;
  onStatusChangeAction: (applicationId: string, nextStatus: JobStatus) => void;
};

type ApplicationPreviewState =
  | {
      detail: ApplicationDetail;
      status: "ready";
    }
  | {
      status: "error";
      summary: string;
    }
  | {
      status: "idle";
    }
  | {
      status: "loading";
    };

const DEFAULT_PREVIEW_BODY_MIN_HEIGHT_CLASS = "min-h-58";
const DEFAULT_PREVIEW_SHEET_HEIGHT_CLASS = "min-h-[40vh]";
const MANUAL_PREVIEW_BODY_MIN_HEIGHT_CLASS = "min-h-36";
const MANUAL_PREVIEW_SHEET_HEIGHT_CLASS = "min-h-[30vh]";
const DEFAULT_PREVIEW_SKELETON_COUNT = 2;
const MANUAL_PREVIEW_SKELETON_COUNT = 1;

export function ApplicationPreviewSheet({
  application,
  isOpen,
  onCloseAction,
  onStatusChangeAction,
}: ApplicationPreviewSheetProps) {
  const [previewState, setPreviewState] = useState<ApplicationPreviewState>({
    status: "idle",
  });
  const requestSequenceRef = useRef(0);
  const applicationId = application?.id;

  const loadApplicationDetail = useEffectEvent(
    async (applicationId: string) => {
      requestSequenceRef.current += 1;
      const requestSequence = requestSequenceRef.current;

      setPreviewState({ status: "loading" });

      const result = await getApplicationDetail(applicationId);

      if (requestSequenceRef.current !== requestSequence) {
        return;
      }

      if (!result.ok) {
        setPreviewState({
          status: "error",
          summary: getErrorSummary(result),
        });
        return;
      }

      setPreviewState({
        detail: result.data,
        status: "ready",
      });
    },
  );

  useEffect(() => {
    if (!isOpen || !applicationId) {
      requestSequenceRef.current += 1;
      return;
    }

    void loadApplicationDetail(applicationId);
  }, [applicationId, isOpen]);

  // effect 내부에서 setState를 호출하는 대신 렌더 시 파생하여 이전 데이터 플래시를 방지합니다.
  const visiblePreviewState: ApplicationPreviewState = isOpen
    ? previewState
    : { status: "idle" };

  const detail =
    visiblePreviewState.status === "ready" ? visiblePreviewState.detail : null;
  const title =
    detail?.positionTitle ?? application?.positionTitle ?? "지원 미리보기";
  const companyName = detail?.companyName ?? application?.companyName ?? "";
  const platform = detail?.platform ?? application?.platform;
  const appliedAt = detail?.appliedAt ?? application?.appliedAt;
  const status = detail?.status ?? application?.status;
  const descriptionMeta = getDescriptionMeta(detail);
  const notesMeta = getNotesMeta(detail);
  const isManualPlatform = platform === "MANUAL";
  const shouldShowDescription = !isManualPlatform;
  const previewSkeletonCount = isManualPlatform
    ? MANUAL_PREVIEW_SKELETON_COUNT
    : DEFAULT_PREVIEW_SKELETON_COUNT;

  const footerButtonContent = (
    <>
      지원 상세 보기
      <ChevronRightIcon aria-hidden="true" className="size-4" />
    </>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onCloseAction}>
      <BottomSheet.Overlay />
      <BottomSheet.Content
        className={
          isManualPlatform
            ? MANUAL_PREVIEW_SHEET_HEIGHT_CLASS
            : DEFAULT_PREVIEW_SHEET_HEIGHT_CLASS
        }
      >
        <BottomSheet.Header />
        <div className="px-6 pb-4">
          {(platform || appliedAt) && (
            <div className="mb-2 flex flex-wrap items-center gap-0">
              {platform && platform !== "MANUAL" && (
                <span className="text-xs font-medium text-muted-foreground">
                  {PLATFORM_LABEL[platform]}
                </span>
              )}
              {platform && platform !== "MANUAL" && appliedAt && (
                <span className="mx-2 text-xs text-muted-foreground/40">|</span>
              )}
              {appliedAt && (
                <span className="flex gap-1 text-xs font-medium text-muted-foreground">
                  <span>{status === "SAVED" ? "저장일" : "지원일"}</span>
                  <span>{formatAppliedAt(appliedAt)}</span>
                </span>
              )}
            </div>
          )}
          <BottomSheet.Title className="text-xl tracking-[-0.02em] text-foreground">
            {title}
          </BottomSheet.Title>
          {companyName && (
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {companyName}
            </p>
          )}
        </div>

        <BottomSheet.Body className="space-y-4 px-6 pb-4">
          {application && (
            <ApplicationStatusSelector
              applicationId={application.id}
              ariaLabel="지원 상태 변경"
              className="mt-2"
              icon={<ListChecksIcon aria-hidden="true" className="size-4" />}
              key={application.id}
              label="지원 상태"
              onStatusChangeAction={(nextStatus) => {
                onStatusChangeAction(application.id, nextStatus);
              }}
              status={application.status}
              updateStatusAction={updateApplicationStatus}
            />
          )}

          {/* min-h는 로딩→콘텐츠 전환 시 시트 높이 변동(레이아웃 시프트)을 방지합니다. */}
          <div
            className={
              isManualPlatform
                ? MANUAL_PREVIEW_BODY_MIN_HEIGHT_CLASS
                : DEFAULT_PREVIEW_BODY_MIN_HEIGHT_CLASS
            }
          >
            {visiblePreviewState.status === "loading" && (
              <div
                aria-busy="true"
                aria-label="지원 정보를 불러오는 중입니다"
                className="space-y-4"
                role="status"
              >
                {Array.from({ length: previewSkeletonCount }).map(
                  (_, index) => (
                    <ApplicationPreviewSectionSkeleton key={index} />
                  ),
                )}
              </div>
            )}

            {visiblePreviewState.status === "error" && (
              <section
                aria-live="polite"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700"
              >
                <div className="flex items-start gap-3">
                  <AlertCircleIcon
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      미리보기를 불러오지 못했습니다
                    </p>
                    <p className="text-sm leading-6">
                      {visiblePreviewState.summary}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {detail && (
              <>
                {shouldShowDescription ? (
                  <ApplicationPreviewSection
                    body={descriptionMeta.text}
                    icon={
                      <FileTextIcon aria-hidden="true" className="size-4" />
                    }
                    isEmpty={descriptionMeta.isEmpty}
                    title="공고 설명"
                  />
                ) : null}
                <ApplicationPreviewSection
                  body={notesMeta.text}
                  icon={
                    <StickyNoteIcon aria-hidden="true" className="size-4" />
                  }
                  isEmpty={notesMeta.isEmpty}
                  title="개인 메모"
                />
              </>
            )}
          </div>
        </BottomSheet.Body>

        <div className="border-t border-border bg-background px-6 py-4">
          {application ? (
            <Button
              asChild
              className="h-11 w-full justify-between rounded-xl px-4"
            >
              <Link href={`/applications/${application.id}` as Route}>
                {footerButtonContent}
              </Link>
            </Button>
          ) : (
            <Button
              className="h-11 w-full justify-between rounded-xl px-4"
              disabled
            >
              {footerButtonContent}
            </Button>
          )}
        </div>
      </BottomSheet.Content>
    </BottomSheet>
  );
}

function ApplicationPreviewSectionSkeleton() {
  return (
    <section className="space-y-2 py-1">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4" />
        {/* h-5: text-sm(14px)의 line-height(20px)와 일치 */}
        <Skeleton className="h-5 w-16" />
      </div>
      {/* 간격 없음: leading-6 텍스트 3줄(72px)과 높이 일치 */}
      <div className="flex flex-col">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    </section>
  );
}
