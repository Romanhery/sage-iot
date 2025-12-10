"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Droplets, Fan, Lightbulb } from "lucide-react"
import { useState, useTransition } from "react"
import { updateControlState } from "@/app/actions/controls"

interface ControlPanelProps {
  plantId: string
  initialState: {
    water_pump_on: boolean
    fan_on: boolean
    grow_light_on: boolean
  } | null
}

export function ControlPanel({ plantId, initialState }: ControlPanelProps) {
  const [waterPump, setWaterPump] = useState(initialState?.water_pump_on || false)
  const [fan, setFan] = useState(initialState?.fan_on || false)
  const [growLight, setGrowLight] = useState(initialState?.grow_light_on || false)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (control: "water" | "fan" | "light", value: boolean) => {
    startTransition(async () => {
      const newState = {
        water_pump_on: control === "water" ? value : waterPump,
        fan_on: control === "fan" ? value : fan,
        grow_light_on: control === "light" ? value : growLight,
      }

      const result = await updateControlState(plantId, newState)

      if (result.success) {
        if (control === "water") setWaterPump(value)
        if (control === "fan") setFan(value)
        if (control === "light") setGrowLight(value)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Water Pump Control */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Droplets className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Water Pump</p>
              <p className="text-xs text-muted-foreground">{waterPump ? "Running" : "Stopped"}</p>
            </div>
          </div>
          <Switch
            checked={waterPump}
            onCheckedChange={(checked) => handleToggle("water", checked)}
            disabled={isPending}
          />
        </div>

        {/* Fan Control */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Fan className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Circulation Fan</p>
              <p className="text-xs text-muted-foreground">{fan ? "Running" : "Stopped"}</p>
            </div>
          </div>
          <Switch checked={fan} onCheckedChange={(checked) => handleToggle("fan", checked)} disabled={isPending} />
        </div>

        {/* Grow Light Control */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Grow Light</p>
              <p className="text-xs text-muted-foreground">{growLight ? "On" : "Off"}</p>
            </div>
          </div>
          <Switch
            checked={growLight}
            onCheckedChange={(checked) => handleToggle("light", checked)}
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  )
}
