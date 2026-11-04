"use client";

import { useEffect } from "react";
import { useCursorStore } from "@/store/store";

// Shows the cursor follower label of `type` while this element is hovered.
// `as` sets the rendered tag (div by default).
export default function CursorTarget({ as: Tag = "div", type, className, children }) {
  const setHovered = useCursorStore((state) => state.setHovered);
  const clearHovered = useCursorStore((state) => state.clearHovered);

  // Leaving the page while hovering would keep the label visible.
  useEffect(() => () => clearHovered(type), [clearHovered, type]);

  return (
    <Tag className={className} onPointerEnter={() => setHovered(type)} onPointerLeave={() => clearHovered(type)}>
      {children}
    </Tag>
  );
}
