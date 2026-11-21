import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card bg-mist px-6 py-14 text-center animate-fadeUp">
      <div className="mb-4 rounded-full bg-paper p-3 text-ink shadow-soft">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-[20px] font-medium text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-[16px] text-slate">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
