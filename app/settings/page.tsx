import { createClient } from "@/lib/supabase/server"
import { PlantList } from "@/components/settings/plant-list"
import { AddPlantForm } from "@/components/settings/add-plant-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: plants } = await supabase.from("plants").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>

          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your plants and devices</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Plant List */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Plants</h2>
            <PlantList plants={plants || []} />
          </div>

          {/* Right Column - Add Plant Form */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Add New Plant</h2>
            <AddPlantForm />
          </div>
        </div>
      </main>
    </div>
  )
}
