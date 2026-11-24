import { notFound } from "next/navigation";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import PieceDetail from "@/components/PieceDetail/PieceDetail";
import { sanityFetch } from "@/sanity/live";
import { PIECE_QUERY } from "@/sanity/queries";

// One piece, opened from the grid (/pieces). The id is the Sanity document id.
export default async function Piece({ params }) {
  const { id } = await params;
  const { data: piece } = await sanityFetch({ query: PIECE_QUERY, params: { id } });

  if (!piece) notFound();

  return (
    <PageWrapper>
      <PieceDetail piece={piece} />
    </PageWrapper>
  );
}
