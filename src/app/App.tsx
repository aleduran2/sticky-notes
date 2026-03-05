import { useEffect, useMemo, useReducer } from "react";
import { Board } from "../ui/Board";
import { Toolbar } from "../ui/Toolbar";
import { createInitialState, notesReducer } from "../domain/reducer";
import { loadState, saveState, clearState } from "../infra/storage";
import type { Rect } from "../domain/types";
import { TEXTS } from "../constants/text";

export default function App() {
  const [state, dispatch] = useReducer(notesReducer, undefined, () => {
    const restored = loadState();
    return restored ?? createInitialState();
  });

  // Debounced-ish persistence (simple): save after state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

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
    dispatch({ type: "NOTES_CLEAR" });
    clearState();
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
    </div>
  );
}