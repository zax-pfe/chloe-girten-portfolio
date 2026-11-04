import PageWrapper from "@/components/PageWrapper/PageWrapper";
import DrawingGrid from "@/components/DrawingGrid/DrawingGrid";
import { drawingData } from "@/data/drawingData";

export default function Drawings() {
  return (
    <PageWrapper>
      <DrawingGrid items={drawingData} />
    </PageWrapper>
  );
}
