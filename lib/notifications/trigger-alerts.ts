"use server"

import { createClient } from "@/lib/supabase/server"

export async function checkAndTriggerAlerts() {
  const supabase = await createClient()

  // Get all plants with their latest sensor readings
  const { data: plants } = await supabase
    .from("plants")
    .select(`
      id,
      name,
      plant_type,
      sensor_readings(*)
    `)
    .order("created_at", { ascending: true })

  if (!plants) return

  for (const plant of plants) {
    const readings = plant.sensor_readings || []
    if (readings.length === 0) continue

    // Get the latest reading
    const latest = readings[readings.length - 1]

    // Check for critical conditions and create notifications
    const alerts: Array<{ title: string; message: string }> = []

    // Low soil moisture alert
    if (latest.soil_moisture < 25) {
      alerts.push({
        title: "Low Soil Moisture",
        message: `${plant.name} needs watering urgently! Soil moisture is at ${latest.soil_moisture.toFixed(0)}%.`,
      })
    }

    // High temperature alert
    if (latest.temperature > 35) {
      alerts.push({
        title: "High Temperature Alert",
        message: `${plant.name} is experiencing high temperature (${latest.temperature.toFixed(1)}°C). Consider moving to a cooler location.`,
      })
    }

    // Low temperature alert
    if (latest.temperature < 10) {
      alerts.push({
        title: "Low Temperature Alert",
        message: `${plant.name} is too cold (${latest.temperature.toFixed(1)}°C). Move to a warmer location immediately.`,
      })
    }

    // Low light alert
    if (latest.light_level < 150) {
      alerts.push({
        title: "Insufficient Light",
        message: `${plant.name} is not receiving enough light (${latest.light_level.toFixed(0)} lux). Increase lighting or move to a brighter location.`,
      })
    }

    // Create notifications for alerts (check if similar notification exists in last hour)
    for (const alert of alerts) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      const { data: recentNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("plant_id", plant.id)
        .eq("title", alert.title)
        .gte("created_at", oneHourAgo)
        .limit(1)
        .single()

      // Only create notification if no recent similar one exists
      if (!recentNotification) {
        await supabase.from("notifications").insert({
          plant_id: plant.id,
          title: alert.title,
          message: alert.message,
          read: false,
          created_at: new Date().toISOString(),
        })
      }
    }
  }
}
