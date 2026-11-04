import PageWrapper from "@/components/PageWrapper/PageWrapper";
import ContactLink from "@/components/ContactLink/ContactLink";
import CopyEmail from "@/components/CopyEmail/CopyEmail";
import { contactData } from "@/data/contactData";
import styles from "./page.module.scss";

export default function Contact() {
  return (
    <PageWrapper>
      <div className={styles.contact}>
        <ContactLink className={styles.row} href={contactData.instagram} arrow>
          Instagram
        </ContactLink>
        <CopyEmail email={contactData.email} className={styles.row} />

        <p className={styles.text}>{contactData.text}</p>
      </div>
    </PageWrapper>
  );
}
