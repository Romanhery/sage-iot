"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"
import { useState, useTransition } from "react"
import { deletePlant } from "@/app/actions/plants"
import { useRouter } from "next/navigation"

interface Plant {
  id: string
  name: string
  plant_type: string
  device_id: string
  location: string | null
  created_at: string
}

interface PlantListProps {
  plants: Plant[]
}

export function PlantList({ plants }: PlantListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (plantId: string, plantName: string) => {
    if (!confirm(`Are you sure you want to delete ${plantName}? This will remove all associated data.`)) {
      return
    }

    setDeletingId(plantId)
    startTransition(async () => {
      const result = await deletePlant(plantId)
      if (result.success) {
        router.refresh()
      } else {
        alert("Failed to delete plant")
      }
      setDeletingId(null)
    })
  }

  if (plants.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No plants added yet. Add your first plant to get started.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {plants.map((plant) => (
        <Card key={plant.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{plant.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plant.plant_type}</p>
              {plant.location && <p className="text-xs text-muted-foreground mt-1">{plant.location}</p>}
              <p className="text-xs font-mono text-muted-foreground mt-2 bg-background px-2 py-1 rounded inline-block">
                {plant.device_id}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={() => router.push(`/plants/${plant.id}`)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(plant.id, plant.name)}
                disabled={isPending && deletingId === plant.id}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
