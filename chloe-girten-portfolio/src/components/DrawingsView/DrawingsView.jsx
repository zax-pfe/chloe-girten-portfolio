"use client";

import { useState } from "react";
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

      {mode === MODES.GRID ? <DrawingGrid items={items} /> : <DrawingStory texts={story} />}
    </>
  );
}
