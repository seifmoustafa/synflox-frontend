"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

// Standard chart color palette
export const GENERIC_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  muted: "hsl(var(--muted-foreground))",
  chart1: "#8884d8",
  chart2: "#82ca9d",
  chart3: "#ffc658",
  chart4: "#ff7300",
  chart5: "#00C49F",
};

interface ChartProps {
  data: any[]
  type: "line" | "bar"
  dataKey?: string
  height?: number
  multiple?: Array<{
    dataKey: string
    color: string
    name: string
  }>
}

export function GenericChart({ data, type, dataKey, height = 300, multiple }: ChartProps) {
  const ChartComponent = type === "line" ? LineChart : BarChart

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-muted-foreground" fontSize={12} />
        <YAxis className="text-muted-foreground" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        {multiple ? (
          <>
            <Legend />
            {multiple.map((item) =>
              type === "line" ? (
                <Line
                  key={item.dataKey}
                  type="monotone"
                  dataKey={item.dataKey}
                  stroke={item.color}
                  strokeWidth={2}
                  name={item.name}
                />
              ) : (
                <Bar key={item.dataKey} dataKey={item.dataKey} fill={item.color} name={item.name} />
              ),
            )}
          </>
        ) : type === "line" ? (
          <Line type="monotone" dataKey={dataKey || "value"} stroke="hsl(var(--primary))" strokeWidth={2} />
        ) : (
          <Bar dataKey={dataKey || "value"} fill="hsl(var(--primary))" />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  )
}
