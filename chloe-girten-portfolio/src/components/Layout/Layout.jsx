import styles from "./style.module.scss";
import NavBar from "../NavBar/NavBar";
import Modal from "../ModalPiece/Modal";
import Title from "../Title/Title";
import Background from "../Background/Background";
import BackgroundBlur from "../BackgroundBlur/BackgroundBlur";
import CloseZone from "../CloseZone/CloseZone";
import CursorFollower from "../CursorFollower/CursorFollower";

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Background />
      <BackgroundBlur />
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

