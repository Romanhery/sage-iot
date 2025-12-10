"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PlantHeaderProps {
  plant: {
    name: string
    plant_type: string
    device_id: string
    location: string | null
  }
}

export function PlantHeader({ plant }: PlantHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{plant.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{plant.plant_type}</span>
              <span>•</span>
              <span>{plant.location || "Unknown location"}</span>
              <span>•</span>
              <span className="font-mono text-xs">{plant.device_id}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
