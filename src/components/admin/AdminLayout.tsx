import { ReactNode, useState } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth, AdminRole } from "@/hooks/useAdminAuth";
import { Loader2, Menu, Bell, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: ReactNode;
  allowedRoles?: AdminRole[];
}

function AdminHeader({ role, email }: { role: AdminRole; email?: string }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { state } = useSidebar();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-full items-center gap-4 px-4 md:px-6">
        {/* Mobile Menu - Sheet-based */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <AdminSidebar role={role} isMobileSheet />
            </SheetContent>
          </Sheet>
        )}

        {/* Desktop Sidebar Trigger */}
        {!isMobile && <SidebarTrigger className="hidden md:flex" />}

        {/* Search - Hidden on mobile, shown on tablet+ */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-full pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 md:px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {email?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none">
                    {email?.split("@")[0] || "Admin"}
                  </span>
                  <span className="text-xs text-muted-foreground">{getRoleLabel()}</span>
                </div>
                <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/")}>
                View Website
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function AdminLayout({ children, allowedRoles }: AdminLayoutProps) {
  const { loading, role, user } = useAdminAuth(allowedRoles);
  const isMobile = useIsMobile();

  if (loading || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-muted/30">
        {/* Desktop Sidebar */}
        {!isMobile && <AdminSidebar role={role} />}
        
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader role={role} email={user?.email} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="mx-auto max-w-7xl animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
