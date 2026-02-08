import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StatusDonutChartProps {
  data: { name: string; value: number; color: string }[];
  loading?: boolean;
}

export function StatusDonutChart({ data, loading = false }: StatusDonutChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (loading) {
    return (
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg">Appointment Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="h-[200px] sm:h-[220px] w-full bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b py-4">
        <CardTitle className="text-lg font-display">Appointment Status</CardTitle>
        <p className="text-sm text-muted-foreground">Distribution by current status</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="h-[180px] sm:h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                formatter={(value: number) => [value, "Count"]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold font-display">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4 pt-4 border-t">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {item.name}
              </span>
              <span className="text-xs sm:text-sm font-medium ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
