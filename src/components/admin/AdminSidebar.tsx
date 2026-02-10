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
  FolderKanban,
  X,
  Globe,
  FileText,
  Image,
  MessageSquareQuote,
  Link2,
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
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminSidebarProps {
  role: AdminRole;
  isMobileSheet?: boolean;
}

const superAdminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Doctors", url: "/admin/doctors", icon: Stethoscope },
  { title: "Hospitals", url: "/admin/hospitals", icon: Building2 },
  { title: "Appointments", url: "/admin/appointments", icon: Calendar },
  { title: "Schedules", url: "/admin/schedule", icon: ClipboardList },
  { title: "Departments", url: "/admin/departments", icon: FolderKanban },
  { title: "Doctor Assignments", url: "/admin/doctor-assignments", icon: Link2 },
  { title: "SMS Settings", url: "/admin/sms-settings", icon: MessageSquare },
  { title: "Hero Slides", url: "/admin/cms/hero-slides", icon: Image },
  { title: "Testimonials", url: "/admin/cms/testimonials", icon: MessageSquareQuote },
  { title: "Pages & Blog", url: "/admin/cms/pages", icon: FileText },
  { title: "Site Settings", url: "/admin/cms/site-settings", icon: Globe },
];

const hospitalAdminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Doctors", url: "/admin/doctors", icon: Stethoscope },
  { title: "Appointments", url: "/admin/appointments", icon: Calendar },
  { title: "Schedules", url: "/admin/schedule", icon: ClipboardList },
  { title: "Settings", url: "/admin/hospital-settings", icon: Settings },
];

const doctorItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "My Appointments", url: "/admin/appointments", icon: Calendar },
  { title: "My Schedule", url: "/admin/schedule", icon: ClipboardList },
  { title: "My Profile", url: "/admin/profile", icon: UserCog },
];

export function AdminSidebar({ role, isMobileSheet = false }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarContext = useSidebar();
  const state = sidebarContext?.state;
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

  const getRoleColor = () => {
    switch (role) {
      case "super_admin":
        return "bg-gradient-to-r from-primary to-primary/80";
      case "hospital_admin":
        return "bg-gradient-to-r from-secondary to-secondary/80";
      case "doctor":
        return "bg-gradient-to-r from-blue-600 to-blue-500";
      default:
        return "bg-primary";
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const items = getMenuItems();

  // Mobile sheet version
  if (isMobileSheet) {
    return (
      <div className="flex flex-col h-full bg-sidebar">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getRoleColor())}>
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sidebar-foreground">
                Admin Panel
              </h2>
              <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {items.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end={item.url === "/admin"}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    );
  }

  // Desktop sidebar version
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getRoleColor())}>
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-display font-semibold text-sidebar-foreground truncate">
                Admin Panel
              </h2>
              <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "transition-all duration-200",
                        isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed ? "justify-center px-2" : "justify-start"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
