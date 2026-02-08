import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export function DataCard({
  children,
  className,
  title,
  description,
  action,
  noPadding = false,
}: DataCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card overflow-hidden",
        className
      )}
    >
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 md:px-6 md:py-5 border-b bg-muted/30">
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-semibold font-display text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "p-4 md:p-6")}>{children}</div>
    </div>
  );
}

// Responsive table wrapper that scrolls on mobile
interface ResponsiveTableProps {
  children: ReactNode;
}

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle px-4 md:px-0">
        {children}
      </div>
    </div>
  );
}

// Mobile-friendly list item for data display
interface DataListItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DataListItem({ children, className, onClick }: DataListItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Empty state component
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
