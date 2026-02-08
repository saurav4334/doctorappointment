import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "secondary" | "accent" | "gradient";
  loading?: boolean;
  description?: string;
}

const variantStyles = {
  default: {
    card: "bg-card border",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  primary: {
    card: "bg-card border",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  secondary: {
    card: "bg-card border",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  accent: {
    card: "bg-card border",
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  gradient: {
    card: "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0",
    iconBg: "bg-white/20",
    iconColor: "text-white",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  loading = false,
  description,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const isGradient = variant === "gradient";

  return (
    <div
      className={cn(
        "rounded-2xl p-5 md:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group",
        styles.card
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 min-w-0 flex-1">
          <p className={cn(
            "text-sm font-medium truncate",
            isGradient ? "text-white/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          
          <div className="flex items-baseline gap-2 flex-wrap">
            {loading ? (
              <div className={cn(
                "h-9 w-20 rounded animate-pulse",
                isGradient ? "bg-white/20" : "bg-muted"
              )} />
            ) : (
              <span className={cn(
                "text-2xl md:text-3xl font-bold font-display tracking-tight",
                isGradient && "text-white"
              )}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </span>
            )}
            
            {trend && !loading && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full",
                  isGradient
                    ? trend.isPositive
                      ? "bg-white/20 text-white"
                      : "bg-red-500/30 text-white"
                    : trend.isPositive
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-red-600 bg-red-50"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          
          {description && (
            <p className={cn(
              "text-xs",
              isGradient ? "text-white/60" : "text-muted-foreground"
            )}>
              {description}
            </p>
          )}
        </div>
        
        <div
          className={cn(
            "p-3 md:p-4 rounded-xl transition-transform duration-300 group-hover:scale-110 shrink-0",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5 md:h-6 md:w-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
