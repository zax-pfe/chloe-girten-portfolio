import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { SANITY_CONTENT_TAG } from "@/sanity/live";

// Called by a Sanity webhook on every publish, so the site updates even when
// nobody has it open. parseBody also waits a few seconds for the Sanity CDN.
export async function POST(req) {
  const { isValidSignature } = await parseBody(
    req,
    process.env.SANITY_REVALIDATE_SECRET,
  );

  // Also rejects calls when the secret env variable is missing.
  if (!isValidSignature) {
    return new Response("Invalid signature", { status: 401 });
  }

  // expire: 0 so the next visit gets the new content, not the old one once more.
  revalidateTag(SANITY_CONTENT_TAG, { expire: 0 });

  return Response.json({ revalidated: true, now: Date.now() });
}
