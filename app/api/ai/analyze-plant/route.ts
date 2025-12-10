import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { generatePlantPrediction } from "@/lib/ai/plant-analyzer"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { plant_id } = body

    if (!plant_id) {
      return NextResponse.json({ error: "plant_id is required" }, { status: 400 })
    }

    // Fetch plant info
    const { data: plant, error: plantError } = await supabase.from("plants").select("*").eq("id", plant_id).single()

    if (plantError || !plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    // Fetch sensor readings from last 24 hours
    const { data: sensorReadings, error: sensorError } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("plant_id", plant_id)
      .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("timestamp", { ascending: false })

    if (sensorError || !sensorReadings || sensorReadings.length === 0) {
      return NextResponse.json({ error: "No sensor data available" }, { status: 400 })
    }

    const currentData = sensorReadings[0]

    // Generate AI prediction
    const prediction = await generatePlantPrediction(
      {
        name: plant.name,
        plant_type: plant.plant_type,
        location: plant.location,
      },
      {
        temperature: currentData.temperature,
        humidity: currentData.humidity,
        soil_moisture: currentData.soil_moisture,
        light_level: currentData.light_level,
      },
      sensorReadings.map((r) => ({
        temperature: r.temperature,
        humidity: r.humidity,
        soil_moisture: r.soil_moisture,
        light_level: r.light_level,
      })),
    )

    // Save prediction to database
    const { error: insertError } = await supabase.from("ai_predictions").insert({
      plant_id,
      prediction_type: prediction.prediction_type,
      prediction_text: prediction.prediction_text,
      confidence: prediction.confidence,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("[v0] Error saving prediction:", insertError)
    }

    return NextResponse.json({
      success: true,
      prediction,
    })
  } catch (error) {
    console.error("[v0] Error in analyze-plant endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
