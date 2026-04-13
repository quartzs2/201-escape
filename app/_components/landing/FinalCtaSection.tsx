import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button/Button";

import styles from "./FinalCtaSection.module.css";

export function FinalCtaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.shell}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>시작하기</p>
          <h2 className={styles.title}>
            흩어진 지원 기록을 한곳에 모아보세요.
          </h2>
          <p className={styles.description}>
            지금 바로 로그인해서 공고와 일정을 정리할 수 있습니다.
          </p>
        </div>

        <Button asChild className={styles.button}>
          <a href="/login">
            로그인하고 시작하기
            <ArrowRightIcon className="size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
