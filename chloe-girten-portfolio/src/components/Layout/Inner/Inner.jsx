import styles from "./style.module.scss";

export default function Inner({ children, withPanel = true }) {
  return (
    <div className={`${styles.inner} ${withPanel ? styles.panel : ""}`.trim()}>
      {children}
    </div>
  );
}
