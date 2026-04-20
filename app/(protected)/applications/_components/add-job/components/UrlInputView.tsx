import { Button } from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";

type UrlInputViewProps = {
  error: null | string;
  isLoading: boolean;
  onExtract: () => void;
  onUrlChange: (url: string) => void;
  url: string;
};

export function UrlInputView({
  error,
  isLoading,
  onExtract,
  onUrlChange,
  url,
}: UrlInputViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="job-url"
        >
          공고 URL
        </label>
        <input
          className={cn(
            "h-10 w-full rounded-md border border-input bg-background px-3 text-base",
            "placeholder:text-muted-foreground",
            "focus:ring-1 focus:ring-ring focus:outline-none",
            error && "border-destructive",
          )}
          disabled={isLoading}
          id="job-url"
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onExtract();
            }
          }}
          placeholder="https://www.wanted.co.kr/..."
          type="url"
          value={url}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button
        className="w-full"
        disabled={!url.trim() || isLoading}
        onClick={onExtract}
      >
        {isLoading ? "공고 정보 가져오는 중..." : "공고 정보 가져오기"}
      </Button>
    </div>
  );
}
