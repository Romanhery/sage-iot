import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PlantHeader } from "@/components/plant-header"
import { SensorChart } from "@/components/sensor-chart"
import { ControlPanel } from "@/components/control-panel"
import { AIPredictions } from "@/components/ai-predictions"
import { AIAnalysisButton } from "@/components/ai-analysis-button"
import { MoisturePrediction } from "@/components/moisture-prediction"

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch plant details
  const { data: plant } = await supabase.from("plants").select("*").eq("id", id).single()

  if (!plant) {
    notFound()
  }

  // Fetch latest control state
  const { data: controlState } = await supabase
    .from("control_states")
    .select("*")
    .eq("plant_id", id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  // Fetch sensor readings for the last 24 hours
  const { data: sensorReadings } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("plant_id", id)
    .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("timestamp", { ascending: true })

  // Fetch AI predictions
  const { data: aiPredictions } = await supabase
    .from("ai_predictions")
    .select("*")
    .eq("plant_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  const latestReading = sensorReadings?.[sensorReadings.length - 1]

  return (
    <div className="min-h-screen bg-background">
      <PlantHeader plant={plant} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Readings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Current Readings</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Temperature</p>
                  <p className="text-2xl font-bold text-foreground">
                    {latestReading?.temperature.toFixed(1) || "--"}°C
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Humidity</p>
                  <p className="text-2xl font-bold text-foreground">{latestReading?.humidity.toFixed(0) || "--"}%</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Soil Moisture</p>
                  <p className="text-2xl font-bold text-foreground">
                    {latestReading?.soil_moisture.toFixed(0) || "--"}%
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  
                </div>
              </div>
            </div>

            {/* This is the chart for the temperature of the plant*/}
            <SensorChart
              data={sensorReadings || []}
              title="Temperature History"
              dataKey="temperature"
              unit="°C"
              color="#ef4444"
            />
            {/* This is the chart for the humidity history of the plant*/}
            <SensorChart
              data={sensorReadings || []}
              title="Humidity History"
              dataKey="humidity"
              unit="%"
              color="#3b82f6"
            />
            {/* This is the chart for the soil moisture history of the plant*/}
            <SensorChart
              data={sensorReadings || []}
              title="Soil Moisture History"
              dataKey="soil_moisture"
              unit="%"
              color="#22c55e"
            />
            {/* This is the chart for the light level history of the plant*/}
            <SensorChart
              data={sensorReadings || []}
              title="Light Level History"
              dataKey="light_level"
              unit="lux"
              color="#f59e0b"
            />
          </div>

          {/* Right Column - AI prediction button and analysis*/}
          <div className="space-y-6">
            <MoisturePrediction plantId={id} />
            <ControlPanel plantId={id} initialState={controlState} />
            <AIAnalysisButton plantId={id} />
            <AIPredictions predictions={aiPredictions || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
