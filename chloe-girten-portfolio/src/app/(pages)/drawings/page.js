import DrawingsView from "@/components/DrawingsView/DrawingsView";
import { sanityFetch } from "@/sanity/live";
import { DRAWING_STORY_QUERY, DRAWINGS_QUERY } from "@/sanity/queries";

export default async function Drawings() {
  const [{ data: drawings }, { data: story }] = await Promise.all([
    sanityFetch({ query: DRAWINGS_QUERY }),
    sanityFetch({ query: DRAWING_STORY_QUERY }),
  ]);

  return <DrawingsView items={drawings} story={story} />;
}
