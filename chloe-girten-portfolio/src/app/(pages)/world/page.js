import PageWrapper from "@/components/PageWrapper/PageWrapper";
import WorldGrid from "@/components/WorldGrid/WorldGrid";
import { worldData } from "@/data/worldData";

export default function World() {
  return (
    <PageWrapper>
      <WorldGrid items={worldData} />
    </PageWrapper>
  );
}
