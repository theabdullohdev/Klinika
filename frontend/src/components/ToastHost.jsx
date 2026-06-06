import { CheckCircle2, XCircle, X } from 'lucide-react';

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="toast-host" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const Icon = toast.type === 'error' ? XCircle : CheckCircle2;

        return (
          <div className={`toast toast-${toast.type}`} key={toast.id}>
            <Icon className="toast-icon" size={18} />
            <div className="toast-content">
              <strong>{toast.title}</strong>
              {toast.message && <span>{toast.message}</span>}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
              title="Xabarni yopish"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastHost;
