import PageWrapper from "@/components/PageWrapper/PageWrapper";
import DrawingGrid from "@/components/DrawingGrid/DrawingGrid";
import { sanityFetch } from "@/sanity/live";
import { DRAWINGS_QUERY } from "@/sanity/queries";

export default async function Drawings() {
  const { data: drawings } = await sanityFetch({ query: DRAWINGS_QUERY });

  return (
    <PageWrapper>
      <DrawingGrid items={drawings} />
    </PageWrapper>
  );
}
