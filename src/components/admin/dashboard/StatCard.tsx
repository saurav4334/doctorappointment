import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "secondary" | "accent";
  loading?: boolean;
}

const variantStyles = {
  default: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  primary: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  secondary: {
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  accent: {
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  loading = false,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className="card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display tracking-tight">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-muted animate-pulse rounded" />
                ) : (
                  typeof value === "number" ? value.toLocaleString() : value
                )}
              </span>
              {trend && !loading && (
                <span
                  className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded-full",
                    trend.isPositive
                      ? "text-secondary bg-secondary/10"
                      : "text-destructive bg-destructive/10"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
          </div>
          <div
            className={cn(
              "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
              styles.iconBg
            )}
          >
            <Icon className={cn("h-6 w-6", styles.iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
