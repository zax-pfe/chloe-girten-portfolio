// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import CursorTarget from "../CursorTarget/CursorTarget";
import styles from "./style.module.scss";

export default function Exhibition({ name, year, description, url }) {
  return (
    <CursorTarget as="article" type="exhibition" className={styles.exhibitionContainer}>
      <div className={styles.infos}>
        <div className={styles.name}>
          <p>{name}</p>
        </div>
        <div className={styles.year}>
          <p>{year}</p>
        </div>
        <div className={styles.description}>
          <p>{description}</p>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <Image src={url} alt={name} fill sizes="50vw" className={styles.image} />
      </div>
    </CursorTarget>
  );
}
