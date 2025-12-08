import { NextResponse } from "next/server"
import { checkAndTriggerAlerts } from "@/lib/notifications/trigger-alerts"

export async function GET() {
  try {
    await checkAndTriggerAlerts()

    return NextResponse.json({
      success: true,
      message: "Alert check completed",
    })
  } catch (error) {
    console.error("[v0] Error in alert check cron:", error)
    return NextResponse.json({ error: "Failed to check alerts" }, { status: 500 })
  }
}
