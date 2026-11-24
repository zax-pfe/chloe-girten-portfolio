"use client";

import { useState } from "react";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import DrawingGrid from "@/components/DrawingGrid/DrawingGrid";
import DrawingStory from "@/components/DrawingStory/DrawingStory";
import styles from "./style.module.scss";

const MODES = {
  STORY: "story",
  GRID: "grid",
};

export default function DrawingsView({ items, story }) {
  const [mode, setMode] = useState(MODES.GRID);

  return (
    <>
      {/* Outside the PageWrapper: placed in the panel, it stays put while the page scrolls. */}
      <div className={styles.modeSelector} aria-label="Drawing view">
        <button
          type="button"
          className={mode === MODES.STORY ? styles.active : undefined}
          aria-pressed={mode === MODES.STORY}
          onClick={() => setMode(MODES.STORY)}
        >
          Story
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          className={mode === MODES.GRID ? styles.active : undefined}
          aria-pressed={mode === MODES.GRID}
          onClick={() => setMode(MODES.GRID)}
        >
          Grid
        </button>
      </div>

      <PageWrapper>
        {mode === MODES.GRID ? <DrawingGrid items={items} /> : <DrawingStory texts={story} />}
      </PageWrapper>
    </>
  );
}
