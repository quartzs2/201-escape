import { LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button/Button";

import { HeaderActions } from "./HeaderActions";
import styles from "./PublicHeader.module.css";

export function PublicHeader() {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Public entrypoints intentionally avoid client navigation JS. */}
        <a className={styles.brand} href="/">
          201 escape
        </a>

        <div className={styles.actions}>
          <HeaderActions />
          <Button asChild size="icon" title="로그인" variant="ghost">
            <a aria-label="로그인" href="/login">
              <LogInIcon className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
