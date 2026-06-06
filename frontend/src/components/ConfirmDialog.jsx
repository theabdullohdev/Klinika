import { AlertTriangle, X } from 'lucide-react';

function ConfirmDialog({ open, title, message, confirmText, cancelText = 'Bekor qilish', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-overlay confirm-overlay">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="confirm-header">
          <div className="confirm-icon">
            <AlertTriangle size={20} />
          </div>
          <button type="button" className="modal-close" onClick={onCancel} title="Yopish">
            <X size={18} />
          </button>
        </div>

        <div className="confirm-body">
          <h2 id="confirm-title">{title}</h2>
          <p>{message}</p>
        </div>

        <div className="confirm-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
