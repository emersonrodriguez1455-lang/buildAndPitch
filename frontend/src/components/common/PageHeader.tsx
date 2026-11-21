interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="animate-enter mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="font-display text-heading tracking-heading text-ink sm:text-[48px]">
          {title}
        </h1>
        {subtitle ? <p className="mt-3 text-body text-slate">{subtitle}</p> : null}
      </div>
      {actions ? <div className="animate-enter-delay-1 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
