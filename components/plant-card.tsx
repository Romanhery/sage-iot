import Link from "next/link"
import { Thermometer, Droplets, Sun, Sprout } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlantCardProps {
  plant: {
    id: string
    name: string
    plant_type: string
    device_id: string
    location: string | null
    image_url: string | null
    latestReading?: {
      temperature: number
      humidity: number
      soil_moisture: number
      light_level: number
      timestamp: string
    }
    controlState?: {
      water_pump_on: boolean
      fan_on: boolean
      grow_light_on: boolean
    }
  }
}

export function PlantCard({ plant }: PlantCardProps) {
  const { latestReading, controlState } = plant

  // Calculate health status based on sensor readings
  const getHealthStatus = () => {
    if (!latestReading) return { status: "Unknown", color: "bg-muted" }

    const { soil_moisture, temperature, light_level } = latestReading

    // Simple health logic (can be enhanced)
    if (soil_moisture < 30 || temperature > 32 || light_level < 200) {
      return { status: "Needs Attention", color: "bg-warning" }
    } else if (soil_moisture > 40 && temperature > 18 && temperature < 28 && light_level > 400) {
      return { status: "Healthy", color: "bg-success" }
    }
    return { status: "Fair", color: "bg-accent" }
  }

  const healthStatus = getHealthStatus()

  return (
    <Link href={`/plants/${plant.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg mb-1">{plant.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plant.plant_type}</p>
              {plant.location && <p className="text-xs text-muted-foreground mt-1">{plant.location}</p>}
            </div>
            <Badge className={`${healthStatus.color} text-white text-xs`}>{healthStatus.status}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          {latestReading ? (
            <div className="space-y-3">
              {/* Sensor Data Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Thermometer className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temp</p>
                    <p className="text-sm font-semibold">{latestReading.temperature.toFixed(1)}°C</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                    <p className="text-sm font-semibold">{latestReading.humidity.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Sprout className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Moisture</p>
                    <p className="text-sm font-semibold">{latestReading.soil_moisture.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Sun className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Light</p>
                    <p className="text-sm font-semibold">{latestReading.light_level.toFixed(0)} lux</p>
                  </div>
                </div>
              </div>

              {/* Active Controls */}
              {controlState && (controlState.water_pump_on || controlState.fan_on || controlState.grow_light_on) && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Active:</p>
                  <div className="flex gap-1">
                    {controlState.water_pump_on && (
                      <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent">
                        Pump
                      </Badge>
                    )}
                    {controlState.fan_on && (
                      <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent">
                        Fan
                      </Badge>
                    )}
                    {controlState.grow_light_on && (
                      <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent">
                        Light
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sensor data available</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
