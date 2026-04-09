import type { JobPlatform, JobPost } from "@/lib/types/job";

import { Button } from "@/components/ui";
import { PLATFORM_LABEL } from "@/lib/constants/job-platform";

type ReviewFieldProps = {
  label: string;
  value: string;
};

type ReviewViewProps = {
  error: null | string;
  isSaving: boolean;
  jobData: JobPost;
  onReset: () => void;
  onSave: () => void;
};

export function ReviewView({
  error,
  isSaving,
  jobData,
  onReset,
  onSave,
}: ReviewViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg bg-muted p-4">
        <ReviewField label="회사" value={jobData.companyName} />
        <ReviewField label="포지션" value={jobData.title} />
        <ReviewField
          label="플랫폼"
          value={PLATFORM_LABEL[jobData.platform as JobPlatform]}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={isSaving}
          onClick={onReset}
          variant="outline"
        >
          다시 입력
        </Button>
        <Button className="flex-1" disabled={isSaving} onClick={onSave}>
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
