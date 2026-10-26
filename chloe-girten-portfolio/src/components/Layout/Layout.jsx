import styles from "./style.module.scss";
import NavBar from "../NavBar/NavBar";
import CloseButton from "../CloseButton/CloseButton";
import Title from "../Title/Title";

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <Title />
        <div className={styles.topPageContainer}>
          <CloseButton />
        </div>
        <div className={styles.botPageContainer}>
          <NavBar />
          <main className={styles.main}>{children}</main>
        </div>
      </div>
    </div>
  );
}
