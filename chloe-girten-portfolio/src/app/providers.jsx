"use client";

import { useEffect } from "react";
import { ReactLenis } from "lenis/react";
import { listenDeviceMode } from "@/store/store";

export default function Providers({ children }) {
  useEffect(() => listenDeviceMode(), []);

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
