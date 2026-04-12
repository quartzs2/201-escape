import GitHubIcon from "@/assets/github.svg";
import { Button } from "@/components/ui/button/Button";

import { ThemeToggle } from "./ThemeToggle";

const GITHUB_REPOSITORY_URL = "https://github.com/quartzs2/201-escape";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Button asChild size="icon" variant="ghost">
        <a
          aria-label="GitHub 저장소"
          href={GITHUB_REPOSITORY_URL}
          rel="noreferrer"
          target="_blank"
        >
          <GitHubIcon className="size-4" />
        </a>
      </Button>
    </div>
  );
}
