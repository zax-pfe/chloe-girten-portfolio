import PageWrapper from "@/components/PageWrapper/PageWrapper";
import PieceGallery from "@/components/PieceGallery/PieceGallery";
import { sanityFetch } from "@/sanity/live";
import { PIECES_QUERY } from "@/sanity/queries";

// The gallery lives in the layout: it stays mounted (scroll position included) while a piece
// page (children) opens over it and closes.
export default async function PiecesLayout({ children }) {
  const { data: pieces } = await sanityFetch({ query: PIECES_QUERY });

  return (
    <>
      <PageWrapper>
        <PieceGallery items={pieces} />
      </PageWrapper>
      {children}
    </>
  );
}
