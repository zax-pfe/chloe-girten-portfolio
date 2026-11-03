import PageWrapper from "@/components/PageWrapper/PageWrapper";
import Gallery from "@/components/Gallery/Gallery";
import { pieceImgData } from "@/data/pieceImgData";

export default function Pieces() {
  return (
    <PageWrapper>
      <Gallery items={pieceImgData} />
    </PageWrapper>
  );
}
