import Image from "next/image";
import styles from "./style.module.scss";

export default function DrawingGallery({ items }) {
  return (
    <div className={styles.gallery}>
      {items.map((item, index) => (
        <DrawingGalleryItem key={`${item.url}-${index}`} src={item.url} name={item.title} />
      ))}
    </div>
  );
}

function DrawingGalleryItem({ src, name }) {
  return (
    <div className={styles.galleryItem}>
      <Image src={src} alt={name} className={styles.image} fill sizes="33vw" />
    </div>
  );
}
