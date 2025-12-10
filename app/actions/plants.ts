"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addPlant(data: {
  name: string
  plant_type: string
  device_id: string
  location: string
}) {
  try {
    const supabase = await createClient()

    const { data: existing, error: checkError } = await supabase
      .from("plants")
      .select("id")
      .eq("device_id", data.device_id)
      .maybeSingle()

    if (existing) {
      return {
        success: false,
        error: "This device ID is already registered",
      }
    }

    // Insert plant
    const { data: plant, error: plantError } = await supabase
      .from("plants")
      .insert({
        name: data.name,
        plant_type: data.plant_type,
        device_id: data.device_id,
        location: data.location || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (plantError || !plant) {
      console.error("[v0] Error adding plant:", plantError)
      return {
        success: false,
        error: plantError?.message || "Failed to add plant",
      }
    }

    // Create initial control state
    const { error: controlError } = await supabase.from("control_states").insert({
      plant_id: plant.id,
      water_pump_on: false,
      fan_on: false,
      grow_light_on: false,
      updated_at: new Date().toISOString(),
    })

    if (controlError) {
      console.error("[v0] Error creating control state:", controlError)
    }

    revalidatePath("/")
    revalidatePath("/settings")

    return { success: true, plant_id: plant.id }
  } catch (error) {
    console.error("[v0] Error adding plant:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add plant",
    }
  }
}

export async function deletePlant(plantId: string) {
  const supabase = await createClient()

  // Delete plant (cascade will handle related records)
  const { error } = await supabase.from("plants").delete().eq("id", plantId)

  if (error) {
    console.error("[v0] Error deleting plant:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/settings")

  return { success: true }
}
