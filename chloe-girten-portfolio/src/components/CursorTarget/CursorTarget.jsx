"use client";

import { useEffect } from "react";
import { useCursorStore } from "@/store/store";

// Shows the cursor follower label of `type` while this element is hovered.
// `as` sets the rendered tag (div by default); other props (onClick…) go to that tag.
export default function CursorTarget({ as: Tag = "div", type, className, children, ...props }) {
  const setHovered = useCursorStore((state) => state.setHovered);
  const clearHovered = useCursorStore((state) => state.clearHovered);

  // Leaving the page while hovering would keep the label visible.
  useEffect(() => () => clearHovered(type), [clearHovered, type]);

  return (
    <Tag {...props} className={className} onPointerEnter={() => setHovered(type)} onPointerLeave={() => clearHovered(type)}>
      {children}
    </Tag>
  );
}
