import { defineQuery } from "next-sanity";

// Pieces without both images are skipped, the gallery needs the two to overlay them.
export const PIECES_QUERY = defineQuery(`
  *[_type == "piece" && defined(image.asset) && defined(imageNoBg.asset)] | order(date desc, _createdAt desc) {
    "id": _id,
    title,
    date,
    description,
    "url": image.asset->url,
    "urlNoBg": imageNoBg.asset->url
  }
`);
