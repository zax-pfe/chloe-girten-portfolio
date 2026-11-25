import { notFound } from "next/navigation";
import { getPiece } from "@/sanity/getPiece";

export async function generateMetadata({ params }) {
  const piece = await getPiece(params);
  return piece ? { title: `${piece.title} — Chloe Girten` } : {};
}

// The piece panel is in the @modal slot, over the gallery (see the pieces layout).
export default async function Piece({ params }) {
  const piece = await getPiece(params);
  if (!piece) notFound();
  return null;
}
