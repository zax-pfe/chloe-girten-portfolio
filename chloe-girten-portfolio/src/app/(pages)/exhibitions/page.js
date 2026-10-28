import PageWrapper from "@/components/PageWrapper/PageWrapper";
import Exhibition from "@/components/Exhibition/Exhibition";
import { exhibitionData } from "@/data/exhibitionData";
import styles from "./page.module.scss";

export default function Exhibitions() {
  return (
    <PageWrapper>
      <div className={styles.list}>
        {exhibitionData.map((exhibition) => (
          <Exhibition key={exhibition.id} {...exhibition} />
        ))}
      </div>
    </PageWrapper>
  );
}
