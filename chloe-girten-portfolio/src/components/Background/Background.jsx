import FloatingImages from "./FloatingImages/FloatingImages";
import styles from "./style.module.scss";

export default function Background() {
  return (
    <div className={styles.background}>
      <FloatingImages />
    </div>
  );
}
