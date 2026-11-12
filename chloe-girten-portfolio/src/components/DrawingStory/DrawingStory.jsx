import Image from "next/image";
import { drawingStoryData } from "@/data/drawingStoryData";
import styles from "./style.module.scss";

// Drawings placed freely in a tall section, every value comes from drawingStoryData.
// The panel scrolls natively (smoothed by the PageWrapper's Lenis): no JS here.
function Section1({ section, text }) {
  return (
    <section className={styles.section1} style={{ height: `${section.height}cqh` }}>
      <div className={styles.drawings}>
        {section.images.map((image) => {
          const width = section.imageWidth * image.scale;

          return (
            <Image
              key={image.id}
              src={image.src}
              alt={image.alt}
              className={styles.drawing}
              sizes={`${Math.ceil(width)}vw`}
              draggable={false}
              style={{
                left: `${image.x}%`,
                top: `${image.y}cqh`,
                width: `${width}%`,
                transform: `translate(-50%, -50%) rotate(${image.rotate}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* Sticky: stays in the middle of the panel until the end of the section. */}
      <div className={styles.textLayer}>
        <p className={styles.text}>{text}</p>
      </div>
    </section>
  );
}

export default function DrawingStory() {
  const { text, sections } = drawingStoryData;

  return (
    <div className={styles.drawingStory}>
      {sections.map((section) => {
        if (section.id === "section1") {
          return <Section1 key={section.id} section={section} text={text} />;
        }
        // section2: to be designed.
        return null;
      })}
    </div>
  );
}
