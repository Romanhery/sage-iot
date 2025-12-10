import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { device_id, temperature, humidity, soil_moisture, light_level } = body

    // Validate required fields
    if (
      !device_id ||
      temperature === undefined ||
      humidity === undefined ||
      soil_moisture === undefined ||
      light_level === undefined
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find plant by device_id
    const { data: plant, error: plantError } = await supabase
      .from("plants")
      .select("id")
      .eq("device_id", device_id)
      .single()

    if (plantError || !plant) {
      return NextResponse.json({ error: "Plant not found for this device" }, { status: 404 })
    }

    // Insert sensor reading
    const { error: insertError } = await supabase.from("sensor_readings").insert({
      plant_id: plant.id,
      temperature: Number.parseFloat(temperature),
      humidity: Number.parseFloat(humidity),
      soil_moisture: Number.parseFloat(soil_moisture),
      light_level: Number.parseFloat(light_level),
      timestamp: new Date().toISOString(),
    })

    if (insertError) {
      console.error("[v0] Error inserting sensor data:", insertError)
      return NextResponse.json({ error: "Failed to save sensor data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Sensor data saved successfully",
    })
  } catch (error) {
    console.error("[v0] Error in sensor-data endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
