import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

interface RecentAppointmentsProps {
  appointments: Appointment[];
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  "no-show": "bg-gray-100 text-gray-800 border-gray-200",
};

export function RecentAppointments({ appointments, loading = false }: RecentAppointmentsProps) {
  if (loading) {
    return (
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg">Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
              <div className="w-10 h-10 bg-muted animate-pulse rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
        <div>
          <CardTitle className="text-lg font-display">Recent Appointments</CardTitle>
          <p className="text-sm text-muted-foreground">Latest booking activity</p>
        </div>
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link to="/admin/appointments">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No recent appointments</p>
            <p className="text-sm">New appointments will appear here</p>
          </div>
        ) : (
          <div className="divide-y">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-3 sm:gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <Avatar className="h-10 w-10 border-2 border-primary/10 shrink-0">
                  <AvatarFallback className="bg-primary/5 text-primary font-medium text-sm">
                    {apt.patient_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{apt.patient_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    with {apt.doctor_name}
                  </p>
                </div>
                {/* Date/Time - Stack on mobile */}
                <div className="hidden sm:block text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(apt.appointment_date), "MMM d")}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {apt.appointment_time?.slice(0, 5)}
                  </div>
                </div>
                {/* Mobile: Show date inline */}
                <div className="sm:hidden text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(apt.appointment_date), "MMM d")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-xs ${statusColors[apt.status] || statusColors.scheduled}`}
                >
                  {apt.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
        {/* Mobile: View All button */}
        <div className="sm:hidden p-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link to="/admin/appointments">
              View All Appointments
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
