import PieceDetail from "@/components/PieceDetail/PieceDetail";
import { getPiece } from "@/sanity/getPiece";

// Piece panel over the blurred gallery. A missing piece is a 404 (see pieces/[slug]).
export default async function PieceModal({ params }) {
  const piece = await getPiece(params);
  if (!piece) return null;

  // A new panel for each piece: it starts at the top.
  return <PieceDetail key={piece.id} piece={piece} />;
}
