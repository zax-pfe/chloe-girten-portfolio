import PageWrapper from "@/components/PageWrapper/PageWrapper";
import Gallery from "@/components/Gallery/Gallery";
import { drawingData } from "@/data/drawingData";

export default function Drawings() {
  return (
    <PageWrapper>
      <Gallery items={drawingData} />
    </PageWrapper>
  );
}
