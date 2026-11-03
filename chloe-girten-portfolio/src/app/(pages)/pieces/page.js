import PageWrapper from "@/components/PageWrapper/PageWrapper";
import PieceGallery from "@/components/PieceGallery/PieceGallery";
import { sanityFetch } from "@/sanity/live";
import { PIECES_QUERY } from "@/sanity/queries";

export default async function Pieces() {
  const { data: pieces } = await sanityFetch({ query: PIECES_QUERY });

  return (
    <PageWrapper>
      <PieceGallery items={pieces} />
    </PageWrapper>
  );
}
