import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AdminRole = "super_admin" | "hospital_admin" | "doctor";

interface AdminAuthState {
  loading: boolean;
  user: { id: string; email?: string } | null;
  role: AdminRole | null;
  hospitalId: string | null;
  doctorId: string | null;
}

export function useAdminAuth(allowedRoles?: AdminRole[]) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<AdminAuthState>({
    loading: true,
    user: null,
    role: null,
    hospitalId: null,
    doctorId: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // Get user roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_key, hospital_id")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (!roles || roles.length === 0) {
      toast({
        title: "Access Denied",
        description: "You don't have admin permissions.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Determine primary role (priority: super_admin > hospital_admin > doctor)
    let primaryRole: AdminRole | null = null;
    let hospitalId: string | null = null;
    
    for (const r of roles) {
      if (r.role_key === "super_admin") {
        primaryRole = "super_admin";
        break;
      } else if (r.role_key === "hospital_admin" && !primaryRole) {
        primaryRole = "hospital_admin";
        hospitalId = r.hospital_id;
      } else if (r.role_key === "doctor" && !primaryRole) {
        primaryRole = "doctor";
        hospitalId = r.hospital_id;
      }
    }

    if (!primaryRole || (allowedRoles && !allowedRoles.includes(primaryRole))) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // If doctor, get doctor ID
    let doctorId: string | null = null;
    if (primaryRole === "doctor") {
      const { data: doctor } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .single();
      doctorId = doctor?.id || null;
    }

    setState({
      loading: false,
      user: { id: user.id, email: user.email },
      role: primaryRole,
      hospitalId,
      doctorId,
    });
  };

  return state;
}
