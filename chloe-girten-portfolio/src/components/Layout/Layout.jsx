import styles from "./style.module.scss";
import NavBar from "../NavBar/NavBar";
import CloseButton from "../CloseButton/CloseButton";
import Modal from "../ModalPiece/Modal";
import Title from "../Title/Title";
import Background from "../Background/Background";

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Background />
      <div className={styles.content}>
        <Title />
        <div className={styles.topPageContainer}>
          <CloseButton />
        </div>
        <div className={styles.botPageContainer}>
          <NavBar />
          <main className={styles.main}>
            <Modal />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
