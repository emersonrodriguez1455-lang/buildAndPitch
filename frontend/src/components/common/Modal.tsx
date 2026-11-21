import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-forest/40 p-4">
      <div className="w-full max-w-lg animate-fadeUp rounded-2xl bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-mint px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-mist transition hover:bg-mint hover:text-forest"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-mint px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
