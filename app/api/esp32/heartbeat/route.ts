import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { device_id } = body

    if (!device_id) {
      return NextResponse.json({ error: "device_id is required" }, { status: 400 })
    }

    // Update plant's last heartbeat timestamp
    const { error } = await supabase
      .from("plants")
      .update({ updated_at: new Date().toISOString() })
      .eq("device_id", device_id)

    if (error) {
      console.error("[v0] Error updating heartbeat:", error)
      return NextResponse.json({ error: "Failed to update heartbeat" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in heartbeat endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
