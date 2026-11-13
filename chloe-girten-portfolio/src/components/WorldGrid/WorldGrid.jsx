// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import styles from "./style.module.scss";

export default function WorldGrid({ items }) {
  return (
    <div className={styles.worldGrid}>
      {items.map((item) => (
        <WorldItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function WorldItem({ item }) {
  switch (item.type) {
    case "photoCrop":
      return <PhotoCropItem src={item.src} alt={item.alt} />;
    case "photoFull":
      return <PhotoFullItem src={item.src} alt={item.alt} />;
    case "text":
      return <TextItem text={item.text} />;
    case "video":
      return <VideoItem src={item.src} />;
    default:
      return <EmptyItem />;
  }
}

function EmptyItem() {
  return <div className={styles.worldItem} />;
}

function PhotoCropItem({ src, alt }) {
  return (
    <div className={styles.worldItem}>
      <div className={styles.cropContainer}>
        <Image src={src} alt={alt ?? ""} className={styles.media} fill sizes="10vw" />
      </div>
    </div>
  );
}

function PhotoFullItem({ src, alt }) {
  return (
    <div className={styles.worldItem}>
      <Image src={src} alt={alt ?? ""} className={styles.media} fill sizes="20vw" />
    </div>
  );
}

function TextItem({ text }) {
  return (
    <div className={`${styles.worldItem} ${styles.textItem}`}>
      <p>{text}</p>
    </div>
  );
}

function VideoItem({ src }) {
  return (
    <div className={styles.worldItem}>
      <video className={styles.media} src={src} autoPlay muted loop playsInline />
    </div>
  );
}
