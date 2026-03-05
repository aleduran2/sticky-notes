
import { TEXTS } from "../constants/text";

type Props = {
  onCreateDefault: () => void;
  onClear: () => void;
};

export function Toolbar({ onCreateDefault, onClear }: Props) {
  return (
    <div className="toolbar">
      <div className="toolbarActions">

        <div className="tooltipWrapper">
          <button onClick={onCreateDefault}>{TEXTS.NEW_NOTE_BUTTON}</button>

          <div className="tooltip">
            <div className="tipsTitle">{TEXTS.QUICK_TIPS_TITLE}</div>

            <ul className="tipsList">
              <li><span className="tipIcon">{TEXTS.TIP_ICON_CREATE}</span>{TEXTS.TIP_TEXT_CREATE}</li>
              <li><span className="tipIcon">{TEXTS.TIP_ICON_MOVE}</span>{TEXTS.TIP_TEXT_MOVE}</li>
              <li><span className="tipIcon">{TEXTS.TIP_ICON_RESIZE}</span>{TEXTS.TIP_TEXT_RESIZE}</li>
              <li><span className="tipIcon">{TEXTS.TIP_ICON_DELETE}</span>{TEXTS.TIP_TEXT_DELETE}</li>
            </ul>
          </div>
        </div>

        <button onClick={onClear}>{TEXTS.CLEAR_BUTTON}</button>

      </div>
    </div>
  );
}