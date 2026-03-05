// Confirmation dialog component: displays a modal with message and yes/no buttons
// for user-friendly confirmations instead of browser alerts.

import { TEXTS } from "../constants/text";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="confirmOverlay">
      <div className="confirmDialog">
        <p>{message}</p>
        <div className="confirmButtons">
          <button onClick={onCancel}>{TEXTS.CONFIRM_CANCEL}</button>
          <button onClick={onConfirm} className="confirmYes">{TEXTS.CONFIRM_YES}</button>
        </div>
      </div>
    </div>
  );
}