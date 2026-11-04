// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { sanityFetch } from "@/sanity/live";
import { ABOUT_QUERY } from "@/sanity/queries";
import styles from "./page.module.scss";

export default async function About() {
  const { data: about } = await sanityFetch({ query: ABOUT_QUERY });

  return (
    <PageWrapper>
      <div className={styles.about}>
        <div className={styles.text}>
          {about?.paragraphs?.map((paragraph) => (
            <p key={paragraph.key}>{paragraph.text}</p>
          ))}
        </div>

        <div className={styles.imageContainer}>
          <div className={styles.imageFrame}>
            {about?.url && (
              <Image src={about.url} alt={about.alt ?? ""} className={styles.image} fill sizes="35vw" preload />
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
