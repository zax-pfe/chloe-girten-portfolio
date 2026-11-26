import { notFound } from "next/navigation";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import PieceDetail from "@/components/PieceDetail/PieceDetail";
import { sanityFetch } from "@/sanity/live";
import { PIECE_QUERY } from "@/sanity/queries";

// One piece, opened from the grid (/pieces). The slug is set in the studio; the Sanity document
// id works too, for the pieces that don't have a slug yet.
export default async function Piece({ params }) {
  const { slug } = await params;
  const { data: piece } = await sanityFetch({ query: PIECE_QUERY, params: { slug } });

  if (!piece) notFound();

  return (
    <PageWrapper>
      <PieceDetail piece={piece} />
    </PageWrapper>
  );
}
