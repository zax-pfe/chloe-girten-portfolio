import Image from "next/image";
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

function ArrowSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="62"
      height="10"
      viewBox="0 0 62 10"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M55.9634 0.530334L60.2061 4.77297L55.9634 9.01562M60.2061 4.77297H-1.87061e-05"
        strokeWidth="1.5"
        stroke="#161616"
      />
    </svg>
  );
}
