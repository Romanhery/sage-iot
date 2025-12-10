"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

  if (error) {
    console.error("[v0] Error marking notification as read:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/notifications")
  revalidatePath("/")

  return { success: true }
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false)

  if (error) {
    console.error("[v0] Error marking all notifications as read:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/notifications")
  revalidatePath("/")

  return { success: true }
}

export async function createNotification(plantId: string, title: string, message: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").insert({
    plant_id: plantId,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[v0] Error creating notification:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/notifications")
  revalidatePath("/")

  return { success: true }
}
