import styles from "./style.module.scss";
import NavBar from "../NavBar/NavBar";
import Modal from "../ModalPiece/Modal";
import Title from "../Title/Title";
import Background from "../Background/Background";
import CloseZone from "../CloseZone/CloseZone";
import CursorFollower from "../CursorFollower/CursorFollower";

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Background />
      <CloseZone />
      <div className={styles.content}>
        <Title />
        <div className={styles.botPageContainer}>
          <NavBar />
          <main className={styles.main}>
            <Modal />
            {children}
          </main>
        </div>
      </div>
      <CursorFollower />
    </div>
  );
}

