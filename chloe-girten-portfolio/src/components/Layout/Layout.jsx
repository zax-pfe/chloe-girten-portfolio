import styles from "./style.module.scss";
import NavBar from "../NavBar/NavBar";
import Modal from "../ModalPiece/Modal";
import Title from "../Title/Title";
import Background from "../Background/Background";
import CloseZone from "../CloseZone/CloseZone";
import CursorFollower from "../CursorFollower/CursorFollower";
import PieceBlur from "../PieceBlur/PieceBlur";
import BlurController from "../BlurController/BlurController";

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <BlurController />
      <Background />
      <CloseZone />
      <div className={styles.content}>
        <Title />
        <div className={styles.botPageContainer}>
          <NavBar />
          <main className={styles.main}>
            <Modal />
            {children}
            {/* After the page panel: drawn above it, under the piece panel. */}
            <PieceBlur />
          </main>
        </div>
      </div>
      <CursorFollower />
    </div>
  );
}

