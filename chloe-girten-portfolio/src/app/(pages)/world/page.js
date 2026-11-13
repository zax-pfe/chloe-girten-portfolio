import PageWrapper from "@/components/PageWrapper/PageWrapper";
import WorldGrid from "@/components/WorldGrid/WorldGrid";
import { sanityFetch } from "@/sanity/live";
import { WORLD_QUERY } from "@/sanity/queries";

export default async function World() {
  const { data: cells } = await sanityFetch({ query: WORLD_QUERY });

  return (
    <PageWrapper>
      <WorldGrid items={cells ?? []} />
    </PageWrapper>
  );
}
