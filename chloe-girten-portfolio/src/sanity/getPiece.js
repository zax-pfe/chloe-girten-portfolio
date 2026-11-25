import { sanityFetch } from "./live";
import { PIECE_QUERY } from "./queries";

// Piece of a /pieces/[slug] route, null when there is none.
export async function getPiece(params) {
  const { slug } = await params;
  const { data: piece } = await sanityFetch({ query: PIECE_QUERY, params: { slug } });
  return piece;
}
