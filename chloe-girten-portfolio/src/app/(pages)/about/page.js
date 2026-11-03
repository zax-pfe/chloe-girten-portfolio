import Image from "next/image";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { aboutData } from "@/data/aboutData";
import styles from "./page.module.scss";

export default function About() {
  return (
    <PageWrapper>
      <div className={styles.about}>
        <div className={styles.text}>
          {aboutData.text.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.imageContainer}>
          <div className={styles.imageFrame}>
            <Image src={aboutData.image} alt={aboutData.alt} className={styles.image} fill sizes="35vw" priority />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
