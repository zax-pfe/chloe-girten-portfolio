"use client";

import { ReactLenis } from "lenis/react";

export default function Providers({ children }) {
  return (
    <ReactLenis
      root
      options={{
        infinite: false,
        syncTouch: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
