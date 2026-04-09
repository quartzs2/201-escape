import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";

import { extractJobData } from "@/lib/actions/extractJobData";
import { saveJobApplication } from "@/lib/actions/saveJobApplication";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";
import { JobId, type JobPost, MANUAL_JOB_DEFAULTS } from "@/lib/types/job";

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
  const router = useRouter();
  const posthog = usePostHog();
  const [state, setState] = useState<AddJobState>({
    error: null,
    step: "idle",
    url: "",
  });

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

    const jobData: JobPost = {
      companyName: fields.companyName.trim() || MANUAL_JOB_DEFAULTS.companyName,
      id: crypto.randomUUID() as JobId,
      platform: MANUAL_JOB_DEFAULTS.platform,
      status: MANUAL_JOB_DEFAULTS.status,
      title: fields.title.trim() || MANUAL_JOB_DEFAULTS.title,
      // URL 미입력 시 DB의 NOT NULL + UNIQUE (platform, origin_url) 제약을 충족하기 위해
      // 고유 식별자를 생성합니다. Zod v4의 z.url()은 manual: 스킴을 허용합니다.
      url: fields.url.trim() || `manual:${crypto.randomUUID()}`,
    };

    posthog.capture(POSTHOG_EVENTS.APPLICATION_ADD_SUBMITTED, {
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

    posthog.capture(POSTHOG_EVENTS.APPLICATION_ADD_SAVED);
    router.refresh();
    onSuccess();
  }

  function handleReset() {
    posthog.capture(POSTHOG_EVENTS.APPLICATION_ADD_RESET);
    setState({ error: null, step: "idle", url: state.url });
  }

  function reset() {
    setState({ error: null, step: "idle", url: "" });
  }

  return {
    handleExtract,
    handleManualSubmit,
    handleReset,
    handleSave,
    reset,
    setUrl,
    state,
  };
}
