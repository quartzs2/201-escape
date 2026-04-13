import { useRouter } from "next/navigation";
import { useState } from "react";

import { useIsMounted } from "@/hooks";
import { extractJobData } from "@/lib/actions/extractJobData";
import { saveJobApplication } from "@/lib/actions/saveJobApplication";
import { trackEvent } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { JobId, type JobPost, MANUAL_JOB_DEFAULTS } from "@/lib/types/job";

import {
  COMMON_POSITION_TITLE_SUGGESTIONS,
  getDefaultPositionTitle,
  LAST_POSITION_TITLE_STORAGE_KEY,
  normalizePositionTitle,
} from "../utils/positionTitle";

export type AddJobState =
  | ExtractingState
  | IdleState
  | ReviewState
  | SavingState;

type ExtractingState = {
  step: "extracting";
  url: string;
};

type IdleState = {
  error: null | string;
  step: "idle";
  url: string;
};

type ReviewState = {
  error: null | string;
  jobData: JobPost;
  step: "review";
  url: string;
};

type SavingState = {
  jobData: JobPost;
  step: "saving";
  url: string;
};

type UseAddJobProps = {
  onSuccess: () => void;
};

export function useAddJob({ onSuccess }: UseAddJobProps) {
  const isMounted = useIsMounted();
  const router = useRouter();
  const [lastSubmittedPositionTitle, setLastSubmittedPositionTitle] = useState<
    null | string
  >(null);
  const [state, setState] = useState<AddJobState>({
    error: null,
    step: "idle",
    url: "",
  });
  const defaultManualPositionTitle = getDefaultPositionTitle(
    lastSubmittedPositionTitle ?? readStoredPositionTitle(isMounted),
  );

  function setUrl(url: string) {
    if (state.step === "idle" && state.url !== url) {
      setState({ ...state, url });
    }
  }

  function handleManualSubmit(fields: {
    companyName: string;
    title: string;
    url: string;
  }) {
    if (state.step !== "idle") {
      return;
    }

    const normalizedTitle =
      normalizePositionTitle(fields.title) || MANUAL_JOB_DEFAULTS.title;

    try {
      window.localStorage.setItem(
        LAST_POSITION_TITLE_STORAGE_KEY,
        normalizedTitle,
      );
      setLastSubmittedPositionTitle(normalizedTitle);
    } catch {
      setLastSubmittedPositionTitle(normalizedTitle);
    }

    const jobData: JobPost = {
      companyName: fields.companyName.trim() || MANUAL_JOB_DEFAULTS.companyName,
      id: crypto.randomUUID() as JobId,
      platform: MANUAL_JOB_DEFAULTS.platform,
      status: MANUAL_JOB_DEFAULTS.status,
      title: normalizedTitle,
      // URL 미입력 시 DB의 NOT NULL + 사용자 범위 UNIQUE 제약을 충족하기 위해
      // 고유 식별자를 생성합니다. Zod v4의 z.url()은 manual: 스킴을 허용합니다.
      url: fields.url.trim() || `manual:${crypto.randomUUID()}`,
    };

    trackEvent(ANALYTICS_EVENTS.APPLICATION_ADD_SUBMITTED, {
      has_url: !!fields.url.trim(),
    });
    setState({ error: null, jobData, step: "review", url: fields.url.trim() });
  }

  async function handleExtract() {
    if (state.step !== "idle") {
      return;
    }

    const { url } = state;
    setState({ step: "extracting", url });

    const result = await extractJobData(url);

    if (!result.ok) {
      setState({ error: result.reason, step: "idle", url });
      return;
    }

    setState({ error: null, jobData: result.data, step: "review", url });
  }

  async function handleSave() {
    if (state.step !== "review") {
      return;
    }

    const { jobData, url } = state;
    setState({ jobData, step: "saving", url });

    const result = await saveJobApplication({
      companyName: jobData.companyName,
      originUrl: jobData.url || url,
      platform: jobData.platform,
      positionTitle: jobData.title,
    });

    if (!result.ok) {
      setState({ error: result.reason, jobData, step: "review", url });
      return;
    }

    router.refresh();
    onSuccess();
  }

  function handleReset() {
    trackEvent(ANALYTICS_EVENTS.APPLICATION_ADD_RESET);
    setState({ error: null, step: "idle", url: state.url });
  }

  function reset() {
    setState({ error: null, step: "idle", url: "" });
  }

  return {
    defaultManualPositionTitle,
    handleExtract,
    handleManualSubmit,
    handleReset,
    handleSave,
    positionTitleSuggestions: COMMON_POSITION_TITLE_SUGGESTIONS,
    reset,
    setUrl,
    state,
  };
}

function readStoredPositionTitle(isMounted: boolean) {
  if (!isMounted) {
    return null;
  }

  try {
    return window.localStorage.getItem(LAST_POSITION_TITLE_STORAGE_KEY);
  } catch {
    return null;
  }
}
