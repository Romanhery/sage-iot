"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateControlState(
  plantId: string,
  state: {
    water_pump_on: boolean
    fan_on: boolean
    grow_light_on: boolean
  },
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("control_states")
    .update({
      ...state,
      updated_at: new Date().toISOString(),
    })
    .eq("plant_id", plantId)

  if (error) {
    console.error("[v0] Error updating control state:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/plants/${plantId}`)
  return { success: true }
}
