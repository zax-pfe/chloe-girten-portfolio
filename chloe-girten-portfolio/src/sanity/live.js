import { defineLive } from "next-sanity/live";
import { client } from "./client";

// Fetches are cached and refreshed by <SanityLive /> when content is published.
// No tokens: only published content is read.
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: false,
  browserToken: false,
});
