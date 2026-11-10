import ExhibitionCarousel from "../ExhibitionCarousel/ExhibitionCarousel";
import styles from "./style.module.scss";

export default function Exhibition({ name, year, description, images }) {
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
        </div>
      </div>

      <div className={styles.imageContainer}>
        <ExhibitionCarousel images={images} name={name} />
      </div>
    </article>
  );
}
