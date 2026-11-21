import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mint bg-white/70 px-6 py-14 text-center animate-fadeUp">
      <div className="mb-4 rounded-2xl bg-mint p-3 text-leaf">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-mist">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
