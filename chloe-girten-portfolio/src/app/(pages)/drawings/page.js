import PageWrapper from "@/components/PageWrapper/PageWrapper";
import DrawingGallery from "@/components/DrawingGallery/DrawingGallery";
import { drawingData } from "@/data/drawingData";

export default function Drawings() {
  return (
    <PageWrapper>
      <DrawingGallery items={drawingData} />
    </PageWrapper>
  );
}
