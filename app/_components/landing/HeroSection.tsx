import styles from "./HeroSection.module.css";

const HERO_ANIMATION_DELAYS = {
  heading: "140ms",
  intro: "80ms",
  list: "380ms",
  summary: "220ms",
} as const;

export function HeroSection() {
  return (
    <section className={styles.section}>
      <div className={styles.shell}>
        <div className={styles.content}>
          <p className={`${styles.fadeUp} ${styles.eyebrow}`}>201 escape</p>
          <p
            className={`${styles.fadeUp} ${styles.intro}`}
            style={{ animationDelay: HERO_ANIMATION_DELAYS.intro }}
          >
            공고, 지원 단계, 면접 일정을 한곳에서 정리합니다.
          </p>
          <h1
            className={`${styles.fadeUp} ${styles.title}`}
            style={{ animationDelay: HERO_ANIMATION_DELAYS.heading }}
          >
            지원 흐름을
            <br />더 쉽게 정리하세요.
          </h1>
          <p
            className={`${styles.fadeUp} ${styles.summary}`}
            style={{ animationDelay: HERO_ANIMATION_DELAYS.summary }}
          >
            저장한 공고와 현재 상태, 예정된 면접 일정을 한 화면에서 확인할 수
            있습니다. 처음 열어도 바로 이해할 수 있는 흐름에 집중했습니다.
          </p>

          <ul
            className={`${styles.fadeUp} ${styles.list}`}
            style={{ animationDelay: HERO_ANIMATION_DELAYS.list }}
          >
            <li>공고를 저장하고 단계별로 관리</li>
            <li>면접 일정과 메모를 함께 기록</li>
            <li>전체 진행 현황을 빠르게 확인</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
