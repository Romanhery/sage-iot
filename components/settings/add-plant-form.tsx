"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState, useTransition } from "react"
import { addPlant } from "@/app/actions/plants"
import { useRouter } from "next/navigation"
import { PlantPresetsCarousel } from "@/components/plant-presets-carousel"

interface PlantPreset {
  id: number
  species_name: string
  common_name: string
  ideal_moisture_min: number
  ideal_moisture_max: number
  ideal_temp_min: number
  ideal_temp_max: number
  ideal_light_hours: number
  image_url: string | null
  description: string | null
  care_tips: string | null
}

export function AddPlantForm() {
  const [formData, setFormData] = useState({
    name: "",
    plant_type: "",
    device_id: "",
    location: "",
    target_moisture: 50,
    target_light_hours: 8,
  })
  const [selectedPreset, setSelectedPreset] = useState<PlantPreset | null>(null)
  const [error, setError] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handlePresetSelect = (preset: PlantPreset) => {
    setSelectedPreset(preset)
    setFormData(prev => ({
      ...prev,
      plant_type: preset.common_name,
      target_moisture: Math.round((preset.ideal_moisture_min + preset.ideal_moisture_max) / 2),
      target_light_hours: preset.ideal_light_hours,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.plant_type || !formData.device_id) {
      setError("Please fill in all required fields")
      return
    }

    startTransition(async () => {
      const result = await addPlant({
        name: formData.name,
        plant_type: formData.plant_type,
        device_id: formData.device_id,
        location: formData.location || undefined,
      })

      if (result.success) {
        setFormData({ name: "", plant_type: "", device_id: "", location: "", target_moisture: 50, target_light_hours: 8 })
        setSelectedPreset(null)
        router.push("/")
      } else {
        setError(result.error || "Failed to add plant")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Plant Presets Carousel */}
      <Card>
        <CardContent className="pt-6">
          <PlantPresetsCarousel
            onSelect={handlePresetSelect}
            selectedId={selectedPreset?.id}
          />
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plant Name *</Label>
              <Input
                id="name"
                placeholder="e.g., My Kitchen Basil"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plant_type">Plant Type *</Label>
              <Input
                id="plant_type"
                placeholder="e.g., Basil"
                value={formData.plant_type}
                onChange={(e) => setFormData({ ...formData, plant_type: e.target.value })}
                disabled={isPending}
              />
              {selectedPreset && (
                <p className="text-xs text-muted-foreground">
                  Auto-filled from selected preset
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="device_id">Device ID *</Label>
              <Input
                id="device_id"
                placeholder="e.g., ESP32_001"
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                disabled={isPending}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Enter the unique ID configured on your ESP32 device</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Living Room"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={isPending}
              />
            </div>

            {/* Target Settings */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium">Care Settings</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Target Moisture</Label>
                  <span className="text-sm font-medium">{formData.target_moisture}%</span>
                </div>
                <Slider
                  value={[formData.target_moisture]}
                  onValueChange={([value]) => setFormData({ ...formData, target_moisture: value })}
                  min={20}
                  max={80}
                  step={5}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Light Hours</Label>
                  <span className="text-sm font-medium">{formData.target_light_hours}h/day</span>
                </div>
                <Slider
                  value={[formData.target_light_hours]}
                  onValueChange={([value]) => setFormData({ ...formData, target_light_hours: value })}
                  min={2}
                  max={16}
                  step={1}
                  disabled={isPending}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
              {isPending ? "Adding..." : "Add Plant"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">Device Pairing Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Upload the ESP32 code to your device</li>
              <li>Configure WiFi credentials in the code</li>
              <li>Set a unique Device ID (e.g., ESP32_001)</li>
              <li>Enter the same Device ID in the form above</li>
              <li>Power on the device and wait for connection</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
