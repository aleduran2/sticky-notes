// Root application component: sets up reducer-based state, persistence
// and renders toolbar + board. All actions flow through dispatch to keep
// components stateless and easy to test.

import { useEffect, useMemo, useReducer, useState } from "react";
import { Board } from "../ui/Board";
import { Toolbar } from "../ui/Toolbar";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { createInitialState, notesReducer } from "../domain/reducer";
import { loadState, saveState, clearState } from "../infra/storage";
import type { Rect } from "../domain/types";
import { TEXTS } from "../constants/text";

export default function App() {
  // Lazy initializer: attempt to hydrate from storage first, fall back to
  // an empty state. using the 3rd argument avoids running on every render.
  const [state, dispatch] = useReducer(notesReducer, undefined, () => {
    const restored = loadState();
    return restored ?? createInitialState();
  });

  // State for confirmation dialog visibility
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Persist state whenever it changes; cheap enough even if triggered
  // frequently since JSON stringify is fast for small objects.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Derive simple stats for display; memoized to avoid object churn
  const stats = useMemo(() => {
    return { count: state.notes.length };
  }, [state.notes.length]);

  function createDefaultNote() {
    // create near top-left, cascading
    const offset = (state.notes.length * 18) % 240;
    const rect: Rect = { x: 40 + offset, y: 40 + offset, w: 220, h: 160 };
    dispatch({ type: "NOTE_CREATE", payload: { rect } });
  }

  function clearAll() {
    setShowConfirmClear(true);
  }

  function handleConfirmClear() {
    dispatch({ type: "NOTES_CLEAR" });
    clearState();
    setShowConfirmClear(false);
  }

  function handleCancelClear() {
    setShowConfirmClear(false);
  }

  return (
    <div className="appShell">
      <div className="topbar">
        <div className="brand">
          <h1>{TEXTS.APP_TITLE}</h1>
          <span>({stats.count} {TEXTS.NOTES_COUNT_SUFFIX})</span>
        </div>

        <Toolbar onCreateDefault={createDefaultNote} onClear={clearAll} />
      </div>

      <div className="boardWrap">
        <Board
          notes={state.notes}
          onCreateRect={(rect) => dispatch({ type: "NOTE_CREATE", payload: { rect } })}
          onCommitRect={(id, rect) => dispatch({ type: "NOTE_UPDATE_RECT", payload: { id, rect } })}
          onCommitText={(id, text) => dispatch({ type: "NOTE_UPDATE_TEXT", payload: { id, text } })}
          onBringToFront={(id) => dispatch({ type: "NOTE_BRING_TO_FRONT", payload: { id } })}
          onDelete={(id) => dispatch({ type: "NOTE_DELETE", payload: { id } })}
        />
      </div>

      {showConfirmClear && (
        <ConfirmDialog
          message={TEXTS.CONFIRM_CLEAR_MESSAGE}
          onConfirm={handleConfirmClear}
          onCancel={handleCancelClear}
        />
      )}
    </div>
  );
}