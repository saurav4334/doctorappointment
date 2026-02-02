import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AdminRole } from "@/hooks/useAdminAuth";

interface AdminSidebarProps {
  role: AdminRole;
}

const superAdminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Doctors", url: "/admin/doctors", icon: Stethoscope },
  { title: "Hospitals", url: "/admin/hospitals", icon: Building2 },
  { title: "Appointments", url: "/admin/appointments", icon: Calendar },
  { title: "Departments", url: "/admin/departments", icon: ClipboardList },
  { title: "SMS Settings", url: "/admin/sms-settings", icon: MessageSquare },
];

const hospitalAdminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Doctors", url: "/admin/doctors", icon: Stethoscope },
  { title: "Appointments", url: "/admin/appointments", icon: Calendar },
  { title: "Settings", url: "/admin/hospital-settings", icon: Settings },
];

const doctorItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "My Appointments", url: "/admin/appointments", icon: Calendar },
  { title: "My Schedule", url: "/admin/schedule", icon: ClipboardList },
  { title: "My Profile", url: "/admin/profile", icon: UserCog },
];

export function AdminSidebar({ role }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getMenuItems = () => {
    switch (role) {
      case "super_admin":
        return superAdminItems;
      case "hospital_admin":
        return hospitalAdminItems;
      case "doctor":
        return doctorItems;
      default:
        return [];
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "hospital_admin":
        return "Hospital Admin";
      case "doctor":
        return "Doctor";
      default:
        return "Admin";
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const items = getMenuItems();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-display font-semibold text-sidebar-foreground">
                Admin Panel
              </h2>
              <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
