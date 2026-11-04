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

// Singleton with a fixed id. The text has no styles or marks in the studio,
// so each block is flattened to a plain string, one per paragraph.
export const ABOUT_QUERY = defineQuery(`
  *[_id == "about"][0] {
    "url": image.asset->url,
    "alt": image.alt,
    "paragraphs": text[_type == "block"] {
      "key": _key,
      "text": pt::text(@)
    }
  }
`);

// Exhibitions without an image are skipped, the row layout needs one.
export const EXHIBITIONS_QUERY = defineQuery(`
  *[_type == "exhibition" && defined(image.asset)] | order(year desc, _createdAt desc) {
    "id": _id,
    name,
    year,
    description,
    "url": image.asset->url
  }
`);
