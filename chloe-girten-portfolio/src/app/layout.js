import localFont from "next/font/local";
import Layout from "@/components/Layout/Layout";
import Providers from "./providers";
import { SanityLive } from "@/sanity/live";
import "./globals.css";

const raleway = localFont({
  src: [
    {
      path: "./fonts/Raleway-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Raleway-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Raleway-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Raleway-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  // Exposed as a CSS variable for the font tokens in globals.css.
  variable: "--font-raleway",
});

export const metadata = {
  title: "Chloe Girten",
  description: "Portfolio of ceramic artist Chloe Girten",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={raleway.variable}>
      <body className={raleway.className}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
        <SanityLive />
      </body>
    </html>
  );
}

// Je veux aussi m'attaquer au background.

// Aux element flottant de l'arriere plan,

// j'aimerai que ca soir pas tout a fait aléatoire.
// je donne deja a chaque element un endroit de depart et un angle, une taille etc ....

// J'aimerai que mes objets ait des trajectoires pas tout a fait aléatoire,
// Parce que j'aimerai qu'ils soient au maximum proche du centre de l'ecran,
// Qu'ils ne se superposent pas trop non plus.

// Dans une autre version de ce projet,
// J'avais un loader, en gros c'etait un ecran qui cachait juste mon canvas avec mes floating images :

// import { motion, useReducedMotion } from "framer-motion";
// import { useSceneStore } from "../store/store";
// import styles from "./style.module.scss";

// const loaderVariants = {
//   visible: { opacity: 1 },
//   hidden: (reduceMotion) => ({
//     opacity: 0,
//     transition: { duration: reduceMotion ? 0 : 0.3, ease: "easeInOut" },
//   }),
// };

// export default function Loader() {
//   const isSceneReady = useSceneStore((state) => state.isSceneReady);
//   const reduceMotion = useReducedMotion();

//   return (
//     <motion.div
//       className={styles.loader}
//       initial={false}
//       variants={loaderVariants}
//       custom={reduceMotion}
//       animate={isSceneReady ? "hidden" : "visible"}
//       style={{ pointerEvents: isSceneReady ? "none" : "auto" }}
//       aria-hidden={isSceneReady}
//     >
//       <div className={styles.titleloader}>Chloe Girten</div>
//     </motion.div>
//   );
// }

// avec ce style :
// .loader {
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100vw;
//   height: 100vh;
//   padding: 20px 22px;

//   display: flex;
//   justify-content: center;
//   background-color: var(--background);
//   z-index: -1;

//   .titleloader {
//     margin: 0;
//     white-space: nowrap;
//     text-box-trim: trim-both;
//     text-box-edge: cap alphabetic;
//     font-size: 210px;
//     font-weight: 500;
//     line-height: normal;
//   }
// }

// et en gros il attendais que la scene soit dispo, une fois dispo zouu ca fade out.

// ici je ne sais pas comment représenter le fait que ca soit dispo, avant j'avais un canvas three js, mais la comment faire ?

// en tout cas réutilise la logique avec un store, je pense que c'est le mieux
