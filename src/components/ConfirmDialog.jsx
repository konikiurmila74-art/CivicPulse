import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-start gap-3 p-5">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-red-100' : 'bg-teal-100'}`}>
            <AlertTriangle className={danger ? 'text-red-600' : 'text-teal-600'} size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
