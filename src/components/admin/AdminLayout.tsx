import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth, AdminRole } from "@/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  allowedRoles?: AdminRole[];
}

export function AdminLayout({ children, allowedRoles }: AdminLayoutProps) {
  const { loading, role } = useAdminAuth(allowedRoles);

  if (loading || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar role={role} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-background flex items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
