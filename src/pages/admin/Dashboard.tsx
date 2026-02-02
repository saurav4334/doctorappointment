import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Users,
  Stethoscope,
  Building2,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Stats {
  totalDoctors: number;
  totalHospitals: number;
  totalAppointments: number;
  totalPatients: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
}

export default function Dashboard() {
  const { role, hospitalId, doctorId } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({
    totalDoctors: 0,
    totalHospitals: 0,
    totalAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role) {
      fetchStats();
    }
  }, [role, hospitalId, doctorId]);

  const fetchStats = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    try {
      // Base queries depend on role
      let doctorsCount = 0;
      let hospitalsCount = 0;
      let appointments: { id: string; status: string | null; appointment_date: string }[] = [];

      if (role === "hospital_admin" && hospitalId) {
        const { count: dhCount } = await supabase
          .from("doctor_hospitals")
          .select("id", { count: "exact" })
          .eq("hospital_id", hospitalId);
        doctorsCount = dhCount || 0;

        const { count: hCount } = await supabase
          .from("hospitals")
          .select("id", { count: "exact" })
          .eq("id", hospitalId);
        hospitalsCount = hCount || 0;

        const { data: appts } = await supabase
          .from("appointments")
          .select("id, status, appointment_date")
          .eq("hospital_id", hospitalId);
        appointments = appts || [];
      } else if (role === "doctor" && doctorId) {
        const { data: appts } = await supabase
          .from("appointments")
          .select("id, status, appointment_date")
          .eq("doctor_id", doctorId);
        appointments = appts || [];
      } else {
        // Super admin - get all
        const [docRes, hospRes, apptRes] = await Promise.all([
          supabase.from("doctors").select("id", { count: "exact" }),
          supabase.from("hospitals").select("id", { count: "exact" }),
          supabase.from("appointments").select("id, status, appointment_date"),
        ]);
        doctorsCount = docRes.count || 0;
        hospitalsCount = hospRes.count || 0;
        appointments = apptRes.data || [];
      }

      const { count: patientsCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact" });

      setStats({
        totalDoctors: doctorsCount,
        totalHospitals: hospitalsCount,
        totalAppointments: appointments.length,
        totalPatients: patientsCount || 0,
        pendingAppointments: appointments.filter((a) => a.status === "scheduled").length,
        completedAppointments: appointments.filter((a) => a.status === "completed").length,
        cancelledAppointments: appointments.filter((a) => a.status === "cancelled").length,
        todayAppointments: appointments.filter((a) => a.appointment_date === today).length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setLoading(false);
  };

  const statCards = [
    {
      title: "Total Doctors",
      value: stats.totalDoctors,
      icon: Stethoscope,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      show: role !== "doctor",
    },
    {
      title: "Total Hospitals",
      value: stats.totalHospitals,
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-100",
      show: role === "super_admin",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      show: role === "super_admin",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      show: true,
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      show: true,
    },
    {
      title: "Pending",
      value: stats.pendingAppointments,
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      show: true,
    },
    {
      title: "Completed",
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      show: true,
    },
    {
      title: "Cancelled",
      value: stats.cancelledAppointments,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      show: true,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your{" "}
            {role === "super_admin" ? "platform" : role === "hospital_admin" ? "hospital" : "practice"}.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards
            .filter((card) => card.show)
            .map((card) => (
              <Card key={card.title} className="card-shadow hover:card-shadow-hover transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : card.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activity feed coming soon...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Use the sidebar to navigate to different sections.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
