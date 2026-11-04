import PageWrapper from "@/components/PageWrapper/PageWrapper";
import Exhibition from "@/components/Exhibition/Exhibition";
import { sanityFetch } from "@/sanity/live";
import { EXHIBITIONS_QUERY } from "@/sanity/queries";
import styles from "./page.module.scss";

export default async function Exhibitions() {
  const { data: exhibitions } = await sanityFetch({ query: EXHIBITIONS_QUERY });

  return (
    <PageWrapper>
      <div className={styles.list}>
        {exhibitions.map((exhibition) => (
          <Exhibition key={exhibition.id} {...exhibition} />
        ))}
      </div>
    </PageWrapper>
  );
}
