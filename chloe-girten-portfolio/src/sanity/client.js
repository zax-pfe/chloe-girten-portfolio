import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Served by the Sanity API CDN: faster, published content only.
  useCdn: true,
});
