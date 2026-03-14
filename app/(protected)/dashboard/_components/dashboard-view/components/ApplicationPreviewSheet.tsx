"use client";

import type { Route } from "next";

import {
  AlertCircleIcon,
  ChevronRightIcon,
  FileTextIcon,
  StickyNoteIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import type {
  ApplicationDetail,
  ApplicationListItem,
} from "@/lib/types/application";

import { BottomSheet, Button } from "@/components/ui";
import { getApplicationDetail } from "@/lib/actions";
import { cn } from "@/lib/utils";

import {
  formatAppliedAt,
  getDescriptionMeta,
  getErrorSummary,
  getNotesMeta,
} from "../_utils/preview";
import { PLATFORM_LABEL, STATUS_META } from "../constants";
import { ApplicationPreviewSection } from "./ApplicationPreviewSection";

type ApplicationPreviewSheetProps = {
  application: ApplicationListItem | null;
  isOpen: boolean;
  onCloseAction: () => void;
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

export function ApplicationPreviewSheet({
  application,
  isOpen,
  onCloseAction,
}: ApplicationPreviewSheetProps) {
  const [previewState, setPreviewState] = useState<ApplicationPreviewState>({
    status: "idle",
  });
  const requestSequenceRef = useRef(0);

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
    if (!isOpen || !application) {
      requestSequenceRef.current += 1;
      return;
    }

    void loadApplicationDetail(application.id);
  }, [application, isOpen]);

  const detail = previewState.status === "ready" ? previewState.detail : null;
  const { color, label } = application
    ? STATUS_META[application.status]
    : { color: "text-muted-foreground", label: "" };

  const title =
    detail?.positionTitle ?? application?.positionTitle ?? "공고 미리보기";
  const companyName = detail?.companyName ?? application?.companyName ?? "";
  const platform = detail?.platform ?? application?.platform;
  const appliedAt = detail?.appliedAt ?? application?.appliedAt;
  const descriptionMeta = getDescriptionMeta(detail);
  const notesMeta = getNotesMeta(detail);

  const footerButtonContent = (
    <>
      공고 상세 보기
      <ChevronRightIcon aria-hidden="true" className="size-4" />
    </>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onCloseAction}>
      <BottomSheet.Overlay />
      <BottomSheet.Content>
        <BottomSheet.Header />
        <div className="px-6 pb-4">
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
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full bg-muted px-3 py-1 text-xs font-semibold",
                  color,
                )}
              >
                {label}
              </span>
              {platform && (
                <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                  {PLATFORM_LABEL[platform]}
                </span>
              )}
              {appliedAt && (
                <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                  지원일 {formatAppliedAt(appliedAt)}
                </span>
              )}
            </div>
          )}

          {previewState.status === "loading" && (
            <div
              aria-live="polite"
              className="rounded-2xl border border-dashed border-border px-4 py-5"
              role="status"
            >
              <p className="text-sm text-muted-foreground">
                공고 정보를 불러오는 중입니다.
              </p>
            </div>
          )}

          {previewState.status === "error" && (
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
                  <p className="text-sm leading-6">{previewState.summary}</p>
                </div>
              </div>
            </section>
          )}

          {detail && (
            <>
              <ApplicationPreviewSection
                body={descriptionMeta.text}
                className="pt-6"
                icon={<FileTextIcon aria-hidden="true" className="size-4" />}
                isEmpty={descriptionMeta.isEmpty}
                title="공고 설명"
              />
              <ApplicationPreviewSection
                body={notesMeta.text}
                icon={<StickyNoteIcon aria-hidden="true" className="size-4" />}
                isEmpty={notesMeta.isEmpty}
                title="개인 메모"
              />
            </>
          )}
        </BottomSheet.Body>

        <div className="border-t border-border bg-white px-6 py-4">
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
