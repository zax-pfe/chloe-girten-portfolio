"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBlurStore, usePieceStore } from "@/store/store";

// A piece open over the gallery (/pieces/<slug>).
const PIECE_PATH = /^\/pieces\/[^/]+/;

// Picks the blur that is on (see useBlurStore):
// - a piece open over the gallery: the page blur;
// - any other page, or a piece selected on the home page: the background blur;
// - the home page with nothing selected: none.
export default function BlurController() {
  const pathname = usePathname();
  const isModalOpen = usePieceStore((state) => state.isModalOpen);
  const setActiveBlur = useBlurStore((state) => state.setActiveBlur);

  useEffect(() => {
    if (PIECE_PATH.test(pathname)) setActiveBlur("page");
    else if (pathname !== "/" || isModalOpen) setActiveBlur("background");
    else setActiveBlur(null);
  }, [pathname, isModalOpen, setActiveBlur]);

  return null;
}
