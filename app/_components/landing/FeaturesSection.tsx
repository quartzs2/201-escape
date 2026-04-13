import styles from "./FeaturesSection.module.css";
import { landingFeatures } from "./utils/content";

export function FeaturesSection() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>기능</p>
          <h2 className={styles.title}>필요한 기능만 간단하게 담았습니다.</h2>
          <p className={styles.description}>
            공고, 일정, 현황처럼 자주 보는 정보만 담았습니다.
          </p>
        </header>

        <ul className={styles.list}>
          {landingFeatures.map(({ description, icon: Icon, title }) => (
            <li key={title}>
              <div className={styles.itemIcon}>
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className={styles.itemTitle}>{title}</h3>
              <p className={styles.itemDescription}>{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
