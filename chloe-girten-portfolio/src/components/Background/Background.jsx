import FloatingImages from "./FloatingImages/FloatingImages";
import BackgroundBlur from "../BackgroundBlur/BackgroundBlur";
import styles from "./style.module.scss";

export default function Background() {
  return (
    <div className={styles.background}>
      <FloatingImages />
      {/* In this layer, so the selected piece can be drawn above it. */}
      <BackgroundBlur />
    </div>
  );
}
