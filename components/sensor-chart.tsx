"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface SensorChartProps {
  data: Array<{
    timestamp: string
    [key: string]: any
  }>
  title: string
  dataKey: string
  unit: string
  color: string
}

export function SensorChart({ data, title, dataKey, unit, color }: SensorChartProps) {
  const chartData = data.map((reading) => ({
    time: format(new Date(reading.timestamp), "HH:mm"),
    value: Number.parseFloat(reading[dataKey]),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                label={{ value: unit, angle: -90, position: "insideLeft", style: { fill: "#9ca3af" } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1f2e",
                  border: "1px solid #2d3748",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e5e7eb" }}
              />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
