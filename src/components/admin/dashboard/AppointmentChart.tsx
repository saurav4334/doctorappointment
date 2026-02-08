import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AppointmentChartProps {
  data: { name: string; appointments: number; completed: number }[];
  loading?: boolean;
}

export function AppointmentChart({ data, loading = false }: AppointmentChartProps) {
  if (loading) {
    return (
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg">Appointment Trends</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="h-[250px] sm:h-[300px] w-full bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b py-4">
        <CardTitle className="text-lg font-display">Appointment Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Weekly overview of appointments</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(330, 65%, 35%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(330, 65%, 35%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(175, 45%, 40%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(175, 45%, 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="appointments"
                stroke="hsl(330, 65%, 35%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAppointments)"
                name="Total"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="hsl(175, 45%, 40%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCompleted)"
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs sm:text-sm text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-xs sm:text-sm text-muted-foreground">Completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
