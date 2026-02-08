import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Calendar,
  UserPlus,
  Building2,
  ClipboardList,
  Settings,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { AdminRole } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  role: AdminRole;
}

const actions = {
  super_admin: [
    { label: "Add Doctor", icon: UserPlus, href: "/admin/doctors", gradient: "from-primary to-primary/70" },
    { label: "Add Hospital", icon: Building2, href: "/admin/hospitals", gradient: "from-secondary to-secondary/70" },
    { label: "Appointments", icon: Calendar, href: "/admin/appointments", gradient: "from-amber-500 to-amber-400" },
    { label: "SMS Settings", icon: Settings, href: "/admin/sms-settings", gradient: "from-slate-600 to-slate-500" },
  ],
  hospital_admin: [
    { label: "Add Doctor", icon: UserPlus, href: "/admin/doctors", gradient: "from-primary to-primary/70" },
    { label: "Appointments", icon: Calendar, href: "/admin/appointments", gradient: "from-secondary to-secondary/70" },
    { label: "Schedule", icon: ClipboardList, href: "/admin/schedule", gradient: "from-amber-500 to-amber-400" },
    { label: "Settings", icon: Settings, href: "/admin/hospital-settings", gradient: "from-slate-600 to-slate-500" },
  ],
  doctor: [
    { label: "My Schedule", icon: ClipboardList, href: "/admin/schedule", gradient: "from-primary to-primary/70" },
    { label: "Appointments", icon: Calendar, href: "/admin/appointments", gradient: "from-secondary to-secondary/70" },
    { label: "My Profile", icon: Stethoscope, href: "/admin/profile", gradient: "from-amber-500 to-amber-400" },
  ],
};

export function QuickActions({ role }: QuickActionsProps) {
  const roleActions = actions[role] || [];

  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b py-4">
        <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">Common tasks at your fingertips</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {roleActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={cn(
                "group relative overflow-hidden rounded-xl p-4 transition-all duration-300",
                "hover:scale-[1.02] hover:shadow-lg",
                "bg-gradient-to-br",
                action.gradient
              )}
            >
              {/* Background decoration */}
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl transition-transform group-hover:scale-150" />
              
              <div className="relative flex flex-col items-start gap-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{action.label}</span>
              </div>
              
              <ChevronRight className="absolute bottom-3 right-3 h-4 w-4 text-white/50 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
