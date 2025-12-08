import { AddPlantForm } from "@/components/settings/add-plant-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewPlantPage() {
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

          <h1 className="text-2xl font-bold text-foreground">Add New Plant</h1>
          <p className="text-sm text-muted-foreground mt-1">Pair a new ESP32 device with your system</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <AddPlantForm />
        </div>
      </main>
    </div>
  )
}
