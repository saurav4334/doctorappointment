import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  Users,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { AppointmentChart } from "@/components/admin/dashboard/AppointmentChart";
import { StatusDonutChart } from "@/components/admin/dashboard/StatusDonutChart";
import { RecentAppointments } from "@/components/admin/dashboard/RecentAppointments";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { WelcomeHeader } from "@/components/admin/dashboard/WelcomeHeader";

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

interface RecentAppointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

interface ChartDataPoint {
  name: string;
  appointments: number;
  completed: number;
}

export default function Dashboard() {
  const { role, hospitalId, doctorId, user } = useAdminAuth();
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
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role) {
      fetchStats();
      fetchRecentAppointments();
      fetchChartData();
    }
  }, [role, hospitalId, doctorId]);

  const fetchStats = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    try {
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

  const fetchRecentAppointments = async () => {
    try {
      let query = supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          patient:profiles!appointments_patient_id_fkey(full_name),
          doctor:doctors!appointments_doctor_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (role === "hospital_admin" && hospitalId) {
        query = query.eq("hospital_id", hospitalId);
      } else if (role === "doctor" && doctorId) {
        query = query.eq("doctor_id", doctorId);
      }

      const { data } = await query;

      if (data) {
        setRecentAppointments(
          data.map((apt) => ({
            id: apt.id,
            patient_name: apt.patient?.full_name || "Unknown Patient",
            doctor_name: apt.doctor?.full_name || "Unknown Doctor",
            appointment_date: apt.appointment_date,
            appointment_time: apt.appointment_time,
            status: apt.status || "scheduled",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching recent appointments:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      // Get appointments for the last 7 days
      const days: ChartDataPoint[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, "yyyy-MM-dd");
        const dayName = format(date, "EEE");

        let query = supabase
          .from("appointments")
          .select("id, status")
          .eq("appointment_date", dateStr);

        if (role === "hospital_admin" && hospitalId) {
          query = query.eq("hospital_id", hospitalId);
        } else if (role === "doctor" && doctorId) {
          query = query.eq("doctor_id", doctorId);
        }

        const { data } = await query;
        const appointments = data || [];

        days.push({
          name: dayName,
          appointments: appointments.length,
          completed: appointments.filter((a) => a.status === "completed").length,
        });
      }

      setChartData(days);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const statusData = [
    { name: "Scheduled", value: stats.pendingAppointments, color: "hsl(45, 93%, 47%)" },
    { name: "Completed", value: stats.completedAppointments, color: "hsl(160, 84%, 39%)" },
    { name: "Cancelled", value: stats.cancelledAppointments, color: "hsl(0, 84%, 60%)" },
  ];

  const statCards = [
    {
      title: "Total Doctors",
      value: stats.totalDoctors,
      icon: Stethoscope,
      variant: "primary" as const,
      show: role !== "doctor",
    },
    {
      title: "Total Hospitals",
      value: stats.totalHospitals,
      icon: Building2,
      variant: "secondary" as const,
      show: role === "super_admin",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      variant: "accent" as const,
      show: role === "super_admin",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      variant: "default" as const,
      show: true,
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Clock,
      variant: "primary" as const,
      show: true,
    },
    {
      title: "Pending",
      value: stats.pendingAppointments,
      icon: TrendingUp,
      variant: "default" as const,
      show: true,
    },
    {
      title: "Completed",
      value: stats.completedAppointments,
      icon: CheckCircle,
      variant: "secondary" as const,
      show: true,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Header */}
        {role && <WelcomeHeader role={role} userName={user?.email?.split("@")[0]} />}

        {/* Stats Grid - Responsive */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statCards
            .filter((card) => card.show)
            .slice(0, 4)
            .map((card, index) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                variant={index === 0 ? "gradient" : card.variant}
                loading={loading}
              />
            ))}
        </div>

        {/* Secondary Stats - Responsive */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          {statCards
            .filter((card) => card.show)
            .slice(4)
            .map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                variant={card.variant}
                loading={loading}
              />
            ))}
        </div>

        {/* Charts Row - Stack on mobile */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AppointmentChart data={chartData} loading={loading} />
          </div>
          <StatusDonutChart data={statusData} loading={loading} />
        </div>

        {/* Bottom Row - Stack on mobile */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentAppointments appointments={recentAppointments} loading={loading} />
          </div>
          {role && <QuickActions role={role} />}
        </div>
      </div>
    </AdminLayout>
  );
}
