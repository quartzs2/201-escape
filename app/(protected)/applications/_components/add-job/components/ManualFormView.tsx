import { useState } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type ManualFormViewProps = {
  error: null | string;
  onSubmit: (fields: {
    companyName: string;
    title: string;
    url: string;
  }) => void;
};

export function ManualFormView({ error, onSubmit }: ManualFormViewProps) {
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [fieldError, setFieldError] = useState<null | string>(null);

  function handleSubmit() {
    if (!companyName.trim() || !title.trim()) {
      setFieldError("회사명과 포지션은 필수입니다.");
      return;
    }
    setFieldError(null);
    onSubmit({ companyName, title, url });
  }

  const displayError = fieldError ?? error;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            className="flex items-center gap-1 text-sm font-medium text-foreground"
            htmlFor="manual-company"
          >
            회사명
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </label>
          <input
            className={cn(
              "h-10 w-full rounded-md border border-input bg-background px-3 text-base",
              "placeholder:text-muted-foreground",
              "focus:ring-1 focus:ring-ring focus:outline-none",
            )}
            id="manual-company"
            onChange={(e) => setCompanyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            placeholder="(주)회사명"
            required
            type="text"
            value={companyName}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="flex items-center gap-1 text-sm font-medium text-foreground"
            htmlFor="manual-title"
          >
            포지션
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </label>
          <input
            className={cn(
              "h-10 w-full rounded-md border border-input bg-background px-3 text-base",
              "placeholder:text-muted-foreground",
              "focus:ring-1 focus:ring-ring focus:outline-none",
            )}
            id="manual-title"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            placeholder="프론트엔드 엔지니어"
            required
            type="text"
            value={title}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="flex items-center gap-1 text-sm font-medium text-foreground"
            htmlFor="manual-url"
          >
            공고 URL
            <span className="text-xs text-muted-foreground">(선택)</span>
          </label>
          <input
            className={cn(
              "h-10 w-full rounded-md border border-input bg-background px-3 text-base",
              "placeholder:text-muted-foreground",
              "focus:ring-1 focus:ring-ring focus:outline-none",
            )}
            id="manual-url"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            placeholder="https://..."
            type="url"
            value={url}
          />
        </div>
      </div>
      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}
      <Button
        className="w-full"
        disabled={!companyName.trim() || !title.trim()}
        onClick={handleSubmit}
      >
        공고 추가
      </Button>
    </div>
  );
}
