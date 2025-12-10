import { generateText } from "ai"

interface SensorData {
  temperature: number
  humidity: number
  soil_moisture: number
  light_level: number
}

interface PlantInfo {
  name: string
  plant_type: string
  location: string | null
}

export async function generatePlantPrediction(
  plantInfo: PlantInfo,
  currentData: SensorData,
  historicalData: SensorData[],
): Promise<{
  prediction_type: string
  prediction_text: string
  confidence: number
}> {
  const avgTemp = historicalData.reduce((sum, d) => sum + d.temperature, 0) / historicalData.length
  const avgHumidity = historicalData.reduce((sum, d) => sum + d.humidity, 0) / historicalData.length
  const avgMoisture = historicalData.reduce((sum, d) => sum + d.soil_moisture, 0) / historicalData.length
  const avgLight = historicalData.reduce((sum, d) => sum + d.light_level, 0) / historicalData.length

  const prompt = `You are an expert botanist and plant care AI assistant. Analyze the following plant data and provide a specific, actionable care recommendation.

Plant Information:
- Name: ${plantInfo.name}
- Type: ${plantInfo.plant_type}
- Location: ${plantInfo.location || "Indoor"}

Current Readings:
- Temperature: ${currentData.temperature.toFixed(1)}°C
- Humidity: ${currentData.humidity.toFixed(1)}%
- Soil Moisture: ${currentData.soil_moisture.toFixed(1)}%
- Light Level: ${currentData.light_level.toFixed(0)} lux

24-Hour Averages:
- Avg Temperature: ${avgTemp.toFixed(1)}°C
- Avg Humidity: ${avgHumidity.toFixed(1)}%
- Avg Soil Moisture: ${avgMoisture.toFixed(1)}%
- Avg Light: ${avgLight.toFixed(0)} lux

Analyze the data and provide ONE specific recommendation. Focus on the most critical issue.
Classify your recommendation as one of: watering, light, temperature, or general.
Keep your response concise (2-3 sentences max) and actionable.

Format your response as JSON:
{
  "type": "watering|light|temperature|general",
  "recommendation": "Your specific advice here",
  "confidence": 0.85
}`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    const result = JSON.parse(text)

    return {
      prediction_type: result.type || "general",
      prediction_text: result.recommendation,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.75)),
    }
  } catch (error) {
    console.error("[v0] Error generating AI prediction:", error)
    // Return a fallback prediction based on simple rules
    return generateFallbackPrediction(currentData)
  }
}

function generateFallbackPrediction(data: SensorData): {
  prediction_type: string
  prediction_text: string
  confidence: number
} {
  // Simple rule-based fallback
  if (data.soil_moisture < 30) {
    return {
      prediction_type: "watering",
      prediction_text: "Soil moisture is low. Consider watering your plant soon to maintain healthy root growth.",
      confidence: 0.8,
    }
  }

  if (data.light_level < 200) {
    return {
      prediction_type: "light",
      prediction_text:
        "Light levels are below optimal range. Move plant closer to a window or increase artificial lighting.",
      confidence: 0.75,
    }
  }

  if (data.temperature > 32 || data.temperature < 15) {
    return {
      prediction_type: "temperature",
      prediction_text: "Temperature is outside ideal range. Adjust your plant's location for better climate control.",
      confidence: 0.7,
    }
  }

  return {
    prediction_type: "general",
    prediction_text: "Your plant's conditions are currently stable. Continue monitoring for any changes.",
    confidence: 0.65,
  }
}

export async function analyzeWateringNeeds(currentMoisture: number, moistureHistory: number[]): Promise<string> {
  const trend = calculateTrend(moistureHistory)
  const daysUntilWatering = estimateDaysUntilWatering(currentMoisture, trend)

  if (daysUntilWatering <= 1) {
    return "today"
  } else if (daysUntilWatering <= 2) {
    return "tomorrow"
  } else {
    return `in ${Math.round(daysUntilWatering)} days`
  }
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0

  const recent = values.slice(-10)
  const slope = (recent[recent.length - 1] - recent[0]) / recent.length
  return slope
}

function estimateDaysUntilWatering(current: number, trend: number): number {
  const wateringThreshold = 30

  if (current <= wateringThreshold) return 0
  if (trend >= 0) return 7 // Not decreasing

  const daysToThreshold = (current - wateringThreshold) / Math.abs(trend)
  return Math.max(0, daysToThreshold)
}
