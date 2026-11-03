import PageWrapper from "@/components/PageWrapper/PageWrapper";
import PieceGallery from "@/components/PieceGallery/PieceGallery";
import { pieceImgData } from "@/data/pieceImgData";

export default function Pieces() {
  return (
    <PageWrapper>
      <PieceGallery items={pieceImgData} />
    </PageWrapper>
  );
}
