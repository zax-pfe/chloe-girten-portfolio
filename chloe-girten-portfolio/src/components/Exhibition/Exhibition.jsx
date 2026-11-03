import Image from "next/image";
import ArrowSVG from "../ArrowSVG/ArrowSVG";
import styles from "./style.module.scss";

export default function Exhibition({ name, year, description, image }) {
  return (
    <article className={styles.exhibitionContainer}>
      <div className={styles.infos}>
        <div className={styles.name}>
          <p>{name}</p>
        </div>
        <div className={styles.year}>
          <p>{year}</p>
        </div>
        <div className={styles.description}>
          <p>{description}</p>
          <ArrowSVG />
        </div>
      </div>

      <div className={styles.imageContainer}>
        <Image src={image} alt={name} fill sizes="50vw" className={styles.image} />
      </div>
    </article>
  );
}
