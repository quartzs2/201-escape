import { useRouter } from "next/navigation";
import { useState } from "react";

import type { JobPost } from "@/lib/types/job";

import { extractJobData } from "@/lib/actions/extractJobData";
import { saveJobApplication } from "@/lib/actions/saveJobApplication";

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
    setState({ error: null, step: "idle", url: state.url });
  }

  function reset() {
    setState({ error: null, step: "idle", url: "" });
  }

  return { handleExtract, handleReset, handleSave, reset, setUrl, state };
}
