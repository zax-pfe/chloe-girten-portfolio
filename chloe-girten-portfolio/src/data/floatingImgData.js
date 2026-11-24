import floating1 from "../../public/floating_img/floating_1.png";
import floating2 from "../../public/floating_img/floating_2.png";
import floating3 from "../../public/floating_img/floating_3.png";
import floating4 from "../../public/floating_img/floating_4.png";
import floating5 from "../../public/floating_img/floating_5.png";
import floating6 from "../../public/floating_img/floating_6.png";
import floating7 from "../../public/floating_img/floating_7.png";
import floating8 from "../../public/floating_img/floating_8.png";

const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

// Every floating piece of the home page: its sheet (title, date, description)
// and how it floats. The rest of its motion is generated from the seed (FloatingImages/movement/traits.js).
//
// - speed: speed of the piece, 1 = normal, 2 = twice as fast.
// - scaleFloating: height while floating, as a ratio of the screen height (0.4 = 40%).
// - scaleOpen: size once opened, as a ratio of the screen (1 = as big as fits on screen).
//
// Not connected yet: for now the debug panel's "Pieces" values apply to every piece.
export const floatingImgData = [
  { id: 1, image: floating1, title: "Good boy", date: "2022", description, speed: 0.8, scaleFloating: 0.46, scaleOpen: 1 },
  { id: 2, image: floating2, title: "Chouette chien", date: "2023", description, speed: 1, scaleFloating: 0.42, scaleOpen: 1 },
  { id: 3, image: floating3, title: "Chienchien", date: "2021", description, speed: 0.7, scaleFloating: 0.5, scaleOpen: 1 },
  { id: 4, image: floating4, title: "Toutou", date: "2024", description, speed: 1.05, scaleFloating: 0.44, scaleOpen: 1 },
  { id: 5, image: floating5, title: "Toudoux", date: "2025", description, speed: 0.9, scaleFloating: 0.4, scaleOpen: 1 },
  { id: 6, image: floating6, title: "Bon toutou", date: "2022", description, speed: 1.2, scaleFloating: 0.36, scaleOpen: 1 },
  { id: 7, image: floating7, title: "Petit chien", date: "2023", description, speed: 1.4, scaleFloating: 0.32, scaleOpen: 1 },
  { id: 8, image: floating8, title: "Gros chien", date: "2024", description, speed: 1.15, scaleFloating: 0.34, scaleOpen: 1 },
];
