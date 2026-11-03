import world1 from "../../public/world/img/world_1.png";
import world2 from "../../public/world/img/world_2.png";
import world3 from "../../public/world/img/world_3.png";
import world4 from "../../public/world/img/world_4.png";
import world5 from "../../public/world/img/world_5.png";
import world6 from "../../public/world/img/world_6.png";

const text =
  "Ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

// One element per grid cell, read row by row (5 cells per row).
// Types: "empty", "photoCrop" (small image in the cell), "photoFull" (image filling the cell),
// "text", "video" (src is a path in /public, videos cannot be imported like images).
export const worldData = [
  // Row 1
  { id: 1, type: "photoCrop", src: world6, alt: "Sculpture à l'atelier" },
  { id: 2, type: "empty" },
  { id: 3, type: "empty" },
  { id: 4, type: "photoCrop", src: world5, alt: "Dessins sur la table de l'atelier" },
  { id: 5, type: "photoFull", src: world3, alt: "Dessin de cheval" },

  // Row 2
  { id: 6, type: "empty" },
  { id: 7, type: "photoCrop", src: world1, alt: "Sculpture devant le four" },
  { id: 8, type: "text", text },
  { id: 9, type: "empty" },
  { id: 10, type: "empty" },

  // Row 3
  { id: 11, type: "photoFull", src: world2, alt: "Dessin de plante" },
  { id: 12, type: "empty" },
  { id: 13, type: "empty" },
  { id: 14, type: "photoCrop", src: world4, alt: "Sculpture de cheval en cours" },
  { id: 15, type: "empty" },

  // Row 4
  { id: 16, type: "empty" },
  { id: 17, type: "video", src: "/world/video/world_video_1.mp4" },
  { id: 18, type: "empty" },
  { id: 19, type: "empty" },
  { id: 20, type: "video", src: "/world/video/world_video_2.mp4" },

  // Row 5
  { id: 21, type: "video", src: "/world/video/world_video_3.mp4" },
  { id: 22, type: "empty" },
  { id: 23, type: "video", src: "/world/video/world_video_4.mp4" },
  { id: 24, type: "text", text },
  { id: 25, type: "video", src: "/world/video/world_video_5.mp4" },
];
