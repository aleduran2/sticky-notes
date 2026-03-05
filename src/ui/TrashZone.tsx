// TrashZone renders a drop target in the bottom-right corner. The parent component passes a ref so it can compute its location for hit
// testing, and an `active` flag to highlight when a note is hovering over it.

import React from "react";
import { TEXTS } from "../constants/text";

type Props = {
  active: boolean;
  trashRef: React.RefObject<HTMLDivElement>;
};

export function TrashZone({ active, trashRef }: Props) {
  return (
    <div ref={trashRef} className={`trash ${active ? "trashActive" : ""}`}>
      <div style={{ fontSize: 18 }}>🗑️</div>
      <div style={{ fontSize: 12, textAlign: "center" }}>
        {TEXTS.DROP_HERE}
        <div style={{ opacity: 0.9 }}>{TEXTS.TO_DELETE}</div>
      </div>
    </div>
  );
}