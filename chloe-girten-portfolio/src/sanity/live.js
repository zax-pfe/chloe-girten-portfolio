import { defineLive } from "next-sanity/live";
import { client } from "./client";

// Fetches are cached and refreshed by <SanityLive /> when content is published.
// No tokens: only published content is read.
const live = defineLive({
  client,
  serverToken: false,
  browserToken: false,
});

export const SanityLive = live.SanityLive;

// <SanityLive /> only refreshes the cache while someone has the site open.
// Every fetch also carries this tag so the publish webhook (app/api/revalidate)
// can refresh all Sanity content when nobody is on the site.
export const SANITY_CONTENT_TAG = "sanity-content";

export function sanityFetch(options) {
  return live.sanityFetch({
    ...options,
    tags: [SANITY_CONTENT_TAG, ...(options.tags ?? [])],
  });
}
