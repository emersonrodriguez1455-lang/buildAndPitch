import type { ChangeEvent } from "react";
import { Camera, Images } from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

type Props = {
  onPick: (file: File | null) => void;
  disabled?: boolean;
  /** Compact secondary style for “replace” actions */
  variant?: "primary" | "replace";
};

/**
 * Two separate file inputs:
 * - Galería: sin `capture` → abre archivos / fotos del teléfono
 * - Cámara: con `capture="environment"` → abre la cámara trasera
 *
 * Un solo input con `capture` en móviles suele saltar directo a la cámara
 * y no deja elegir de la galería.
 */
export function ImageSourcePicker({ onPick, disabled, variant = "primary" }: Props) {
  const galleryClass =
    variant === "primary" ? "btn-primary cursor-pointer" : "btn-secondary cursor-pointer";
  const cameraClass = "btn-secondary cursor-pointer";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onPick(file);
    // Allow selecting the same file again later
    e.target.value = "";
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <label className={`${galleryClass} ${disabled ? "pointer-events-none opacity-50" : ""}`}>
        <Images className="h-4 w-4" />
        {variant === "replace" ? "Galería" : "Elegir de galería"}
        <input
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={handleChange}
        />
      </label>
      <label className={`${cameraClass} ${disabled ? "pointer-events-none opacity-50" : ""}`}>
        <Camera className="h-4 w-4" />
        Tomar foto
        <input
          type="file"
          accept={ACCEPT}
          capture="environment"
          className="hidden"
          disabled={disabled}
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
