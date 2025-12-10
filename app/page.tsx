import { createClient } from "@/lib/supabase/server"
import { PlantCard } from "@/components/plant-card"
import { NotificationBell } from "@/components/notification-bell"
import { Leaf } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch all plants with their latest sensor data and control states
  const { data: plants } = await supabase
    .from("plants")
    .select(`
      *,
      control_states(*),
      sensor_readings(*)
    `)
    .order("created_at", { ascending: true })

  // Get latest sensor reading for each plant
  const plantsWithLatestData =
    plants?.map((plant) => {
      const latestReading = plant.sensor_readings?.[plant.sensor_readings.length - 1]
      const controlState = plant.control_states?.[0]
      return { ...plant, latestReading, controlState }
    }) || []

  // Fetch unread notifications count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PlantAI</h1>
              <p className="text-sm text-muted-foreground">Smart Growing System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Settings
            </Link>
            <NotificationBell count={unreadCount || 0} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Plants</p>
            <p className="text-3xl font-bold text-foreground">{plants?.length || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">Active Devices</p>
            <p className="text-3xl font-bold text-accent">{plants?.length || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">Notifications</p>
            <p className="text-3xl font-bold text-warning">{unreadCount || 0}</p>
          </div>
        </div>

        {/* Plants Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Plants</h2>
          <Link
            href="/plants/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Add Plant
          </Link>
        </div>

        {plantsWithLatestData.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No plants yet</h3>
            <p className="text-muted-foreground mb-4">Add your first plant to start monitoring</p>
            <Link
              href="/plants/new"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Add Your First Plant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantsWithLatestData.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
