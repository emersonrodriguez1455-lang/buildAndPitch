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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/30 p-4">
      <div className="w-full max-w-lg animate-fadeUp rounded-elevated bg-paper shadow-artifact">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-[26px] tracking-tight text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-pill p-2 text-slate transition hover:bg-mist hover:text-ink"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4 text-[16px]">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
