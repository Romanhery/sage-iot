import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const device_id = searchParams.get("device_id")

    if (!device_id) {
      return NextResponse.json({ error: "device_id parameter is required" }, { status: 400 })
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

    // Get latest control state
    const { data: controlState, error: controlError } = await supabase
      .from("control_states")
      .select("*")
      .eq("plant_id", plant.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (controlError) {
      console.error("[v0] Error fetching control state:", controlError)
      return NextResponse.json({ error: "Failed to fetch control state" }, { status: 500 })
    }

    return NextResponse.json({
      water_pump_on: controlState?.water_pump_on || false,
      fan_on: controlState?.fan_on || false,
      grow_light_on: controlState?.grow_light_on || false,
    })
  } catch (error) {
    console.error("[v0] Error in controls endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
