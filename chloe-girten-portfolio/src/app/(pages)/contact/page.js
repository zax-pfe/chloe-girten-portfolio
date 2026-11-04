import PageWrapper from "@/components/PageWrapper/PageWrapper";
import ArrowUpRightSVG from "@/components/ArrowUpRightSVG/ArrowUpRightSVG";
import CopyEmail from "@/components/CopyEmail/CopyEmail";
import { contactData } from "@/data/contactData";
import styles from "./page.module.scss";

export default function Contact() {
  return (
    <PageWrapper>
      <div className={styles.contact}>
        <a className={styles.row} href={contactData.instagram} target="_blank" rel="noopener noreferrer">
          Instagram
          <ArrowUpRightSVG />
        </a>
        <CopyEmail email={contactData.email} className={styles.row} />

        <p className={styles.text}>{contactData.text}</p>
      </div>
    </PageWrapper>
  );
}
