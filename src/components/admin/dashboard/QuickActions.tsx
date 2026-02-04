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
} from "lucide-react";
import { AdminRole } from "@/hooks/useAdminAuth";

interface QuickActionsProps {
  role: AdminRole;
}

const actions = {
  super_admin: [
    { label: "Add Doctor", icon: UserPlus, href: "/admin/doctors", color: "text-primary" },
    { label: "Add Hospital", icon: Building2, href: "/admin/hospitals", color: "text-secondary" },
    { label: "View Appointments", icon: Calendar, href: "/admin/appointments", color: "text-amber-600" },
    { label: "SMS Settings", icon: Settings, href: "/admin/sms-settings", color: "text-muted-foreground" },
  ],
  hospital_admin: [
    { label: "Add Doctor", icon: UserPlus, href: "/admin/doctors", color: "text-primary" },
    { label: "View Appointments", icon: Calendar, href: "/admin/appointments", color: "text-secondary" },
    { label: "Manage Schedule", icon: ClipboardList, href: "/admin/schedule", color: "text-amber-600" },
    { label: "Settings", icon: Settings, href: "/admin/hospital-settings", color: "text-muted-foreground" },
  ],
  doctor: [
    { label: "My Schedule", icon: ClipboardList, href: "/admin/schedule", color: "text-primary" },
    { label: "My Appointments", icon: Calendar, href: "/admin/appointments", color: "text-secondary" },
    { label: "My Profile", icon: Stethoscope, href: "/admin/profile", color: "text-amber-600" },
  ],
};

export function QuickActions({ role }: QuickActionsProps) {
  const roleActions = actions[role] || [];

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">Common tasks at your fingertips</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {roleActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-muted/50 hover:border-primary/30 transition-all"
              asChild
            >
              <Link to={action.href}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
