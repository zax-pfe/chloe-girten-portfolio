import PageWrapper from "@/components/PageWrapper/PageWrapper";
import DrawingsView from "@/components/DrawingsView/DrawingsView";
import { sanityFetch } from "@/sanity/live";
import { DRAWINGS_QUERY } from "@/sanity/queries";

export default async function Drawings() {
  const { data: drawings } = await sanityFetch({ query: DRAWINGS_QUERY });

  return (
    <PageWrapper>
      <DrawingsView items={drawings} />
    </PageWrapper>
  );
}
