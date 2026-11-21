import { useId } from "react";

type Props = {
  className?: string;
  title?: string;
};

const HALF =
  "M0 2 C-2.2 -4.5 -5.5 -10.2 -7.8 -15.5 C-9.6 -19.8 -11.4 -24.2 -10.2 -28.4 C-9.2 -31.6 -7.2 -33.8 -4.8 -34.6 C-2.6 -35.4 -0.8 -34.6 0.2 -32.4 C1.1 -30.4 0.6 -28.2 -0.2 -26.2 C-1.4 -23.2 -2.8 -20.4 -3.2 -17.2 C-3.6 -14.2 -2.8 -11.2 -2.2 -8.2 C-1.5 -5 -0.6 -1.5 0 2 Z";

/** Mark: par opuesto de hojas de café. Usa currentColor. */
export function AgroAlertaMark({ className = "h-5 w-5", title }: Props) {
  const uid = useId().replace(/:/g, "");
  const halfId = `leaf-half-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <defs>
        <path id={halfId} d={HALF} />
      </defs>
      <g fill="currentColor">
        <g transform="translate(31.4 40) rotate(-30)">
          <use href={`#${halfId}`} />
          <use href={`#${halfId}`} transform="scale(-1,1)" />
        </g>
        <g transform="translate(32.6 40) rotate(30)">
          <use href={`#${halfId}`} />
          <use href={`#${halfId}`} transform="scale(-1,1)" />
        </g>
        <circle cx="32" cy="41" r="1.65" />
      </g>
      <g stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.45">
        <g transform="translate(31.4 40) rotate(-30)">
          <path d="M0 0.5 C-0.1 -8 0 -18 0.2 -32" />
          <path d="M0 -24 C-2.6 -22.4 -4.4 -20.6 -5.6 -18.4" />
          <path d="M0 -16 C-2.8 -14.4 -4.6 -12.4 -5.6 -10" />
          <path d="M0 -8 C-2.4 -6.6 -4 -4.8 -5 -2.8" />
          <path d="M0 -24 C2.6 -22.4 4.4 -20.6 5.6 -18.4" />
          <path d="M0 -16 C2.8 -14.4 4.6 -12.4 5.6 -10" />
          <path d="M0 -8 C2.4 -6.6 4 -4.8 5 -2.8" />
        </g>
        <g transform="translate(32.6 40) rotate(30)">
          <path d="M0 0.5 C0.1 -8 0 -18 -0.2 -32" />
          <path d="M0 -24 C-2.6 -22.4 -4.4 -20.6 -5.6 -18.4" />
          <path d="M0 -16 C-2.8 -14.4 -4.6 -12.4 -5.6 -10" />
          <path d="M0 -8 C-2.4 -6.6 -4 -4.8 -5 -2.8" />
          <path d="M0 -24 C2.6 -22.4 4.4 -20.6 5.6 -18.4" />
          <path d="M0 -16 C2.8 -14.4 4.6 -12.4 5.6 -10" />
          <path d="M0 -8 C2.4 -6.6 4 -4.8 5 -2.8" />
        </g>
      </g>
    </svg>
  );
}
