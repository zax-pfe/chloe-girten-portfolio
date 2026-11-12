import story1 from "../../public/drawing_img/Story/section_1/drawing_story_1.png";
import story2 from "../../public/drawing_img/Story/section_1/drawing_story_2.png";
import story3 from "../../public/drawing_img/Story/section_1/drawing_story_3.png";
import story4 from "../../public/drawing_img/Story/section_1/drawing_story_4.png";
import story5 from "../../public/drawing_img/Story/section_1/drawing_story_5.png";
import story6 from "../../public/drawing_img/Story/section_1/drawing_story_6.png";
import story7 from "../../public/drawing_img/Story/section_1/drawing_story_7.png";

// Story mode of the Drawings page.
// "text" stays in the middle of the panel (sticky) while section1 scrolls behind it.
// Sections are rendered in order: section1 (drawings scrolling behind the text), then section2 (to be designed).
//
// section1:
//   height     section height, in cqh (100 = one panel height)
//   imageWidth base width of a drawing, in % of the panel width (before its scale)
//   images     one entry per drawing, all values free to edit:
//     x        center of the drawing, in % of the panel width (0 = left edge, 100 = right edge)
//     y        center of the drawing, in cqh from the top of the section (0 to height)
//     rotate   rotation in degrees (negative = counter-clockwise)
//     scale    multiplies imageWidth (1 = imageWidth, 2 = twice as big)
//   Later drawings in the array are drawn above earlier ones.
export const drawingStoryData = {
  text: "Ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",

  sections: [
    {
      id: "section1",
      height: 670,
      imageWidth: 30,
      images: [
        { id: 1, src: story1, alt: "Dessin 1", x: 20, y: 55, rotate: 0, scale: 1.3 },
        { id: 2, src: story2, alt: "Dessin 2", x: 75, y: 110, rotate: -8, scale: 1.8 },
        { id: 3, src: story3, alt: "Dessin 3", x: 50, y: 210, rotate: 0, scale: 2 },
        { id: 4, src: story4, alt: "Dessin 4", x: 25, y: 340, rotate: -15, scale: 1.3 },
        { id: 5, src: story5, alt: "Dessin 5", x: 75, y: 360, rotate: -10, scale: 1.6 },
        { id: 6, src: story6, alt: "Dessin 6", x: 50, y: 490, rotate: 0, scale: 2 },
        { id: 7, src: story7, alt: "Dessin 7", x: 75, y: 600, rotate: 0, scale: 1 },
      ],
    },
    {
      id: "section2",
      images: [],
    },
  ],
};
