"use client";

import { useEffect, useRef } from "react";
import { lastPointer, useCursorStore } from "@/store/store";

// Shows the cursor follower label of `type` while this element is hovered.
// `as` sets the rendered tag (div by default); other props (onClick…) go to that tag.
// `ref` also gets that tag.
export default function CursorTarget({ as: Tag = "div", type, className, children, ref: outerRef, ...props }) {
  const setHovered = useCursorStore((state) => state.setHovered);
  const clearHovered = useCursorStore((state) => state.clearHovered);
  const ref = useRef(null);
  const setRef = (element) => {
    ref.current = element;
    if (typeof outerRef === "function") outerRef(element);
    else if (outerRef) outerRef.current = element;
  };

  // Appearing under the pointer (a panel opened by a click): no pointerenter until the pointer
  // moves, so it shows its label right away when it's the element under the pointer.
  useEffect(() => {
    const { x, y } = lastPointer;
    if (x === null) return;
    if (ref.current?.contains(document.elementFromPoint(x, y))) setHovered(type);
  }, [setHovered, type]);

  // Leaving the page while hovering would keep the label visible.
  useEffect(() => () => clearHovered(type), [clearHovered, type]);

  // Any move over it shows its label again. Some browsers update what is hovered when an element
  // appears under the pointer without sending pointerenter, and then don't send it on the next
  // move either: the label would only come back after leaving the element and coming back.
  const handlePointerMove = () => {
    if (useCursorStore.getState().hovered !== type) setHovered(type);
  };

  return (
    <Tag
      {...props}
      ref={setRef}
      className={className}
      onPointerEnter={() => setHovered(type)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => clearHovered(type)}
    >
      {children}
    </Tag>
  );
}
