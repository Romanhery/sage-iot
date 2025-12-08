/**
 * Linear Regression Prediction Utilities
 * For soil moisture trend analysis and watering predictions
 */

export interface PredictionResult {
    current_moisture: number
    predicted_moisture_24h: number
    slope: number
    intercept: number
    trend: 'increasing' | 'decreasing' | 'stable'
    days_until_watering: number | null
    confidence: number
    data_points: number
}

interface DataPoint {
    x: number  // time index
    y: number  // moisture value
}

/**
 * Calculate simple linear regression (y = mx + b)
 * Using least squares method
 */
export function linearRegression(data: DataPoint[]): { slope: number; intercept: number; r_squared: number } {
    const n = data.length

    if (n < 2) {
        return { slope: 0, intercept: data[0]?.y || 0, r_squared: 0 }
    }

    // Calculate means
    let sumX = 0, sumY = 0
    for (const point of data) {
        sumX += point.x
        sumY += point.y
    }
    const meanX = sumX / n
    const meanY = sumY / n

    // Calculate slope and intercept
    let numerator = 0
    let denominator = 0
    let ssTotal = 0

    for (const point of data) {
        const xDiff = point.x - meanX
        const yDiff = point.y - meanY
        numerator += xDiff * yDiff
        denominator += xDiff * xDiff
        ssTotal += yDiff * yDiff
    }

    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = meanY - slope * meanX

    // Calculate R-squared (coefficient of determination)
    let ssResidual = 0
    for (const point of data) {
        const predicted = slope * point.x + intercept
        ssResidual += (point.y - predicted) ** 2
    }
    const r_squared = ssTotal !== 0 ? 1 - (ssResidual / ssTotal) : 0

    return { slope, intercept, r_squared: Math.max(0, Math.min(1, r_squared)) }
}

/**
 * Predict soil moisture for a future time point
 */
export function predictMoisture(
    readings: { soil_moisture: number; timestamp: string }[],
    hoursAhead: number = 24
): PredictionResult {
    if (!readings.length) {
        return {
            current_moisture: 0,
            predicted_moisture_24h: 0,
            slope: 0,
            intercept: 0,
            trend: 'stable',
            days_until_watering: null,
            confidence: 0,
            data_points: 0
        }
    }

    // Sort by timestamp (oldest first)
    const sorted = [...readings].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // Convert to data points (x = hours from first reading)
    const firstTime = new Date(sorted[0].timestamp).getTime()
    const data: DataPoint[] = sorted.map(r => ({
        x: (new Date(r.timestamp).getTime() - firstTime) / (1000 * 60 * 60), // hours
        y: r.soil_moisture || 0
    }))

    // Get current values
    const currentMoisture = sorted[sorted.length - 1].soil_moisture || 0
    const currentX = data[data.length - 1].x

    // Calculate regression
    const { slope, intercept, r_squared } = linearRegression(data)

    // Predict future moisture
    const futureX = currentX + hoursAhead
    let predictedMoisture = slope * futureX + intercept

    // Clamp prediction between 0 and 100
    predictedMoisture = Math.max(0, Math.min(100, predictedMoisture))

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable'
    const slopeThreshold = 0.1 // percent per hour
    if (slope > slopeThreshold) {
        trend = 'increasing'
    } else if (slope < -slopeThreshold) {
        trend = 'decreasing'
    } else {
        trend = 'stable'
    }

    // Calculate days until watering needed (when moisture hits 30%)
    const wateringThreshold = 30
    let daysUntilWatering: number | null = null

    if (slope < 0 && currentMoisture > wateringThreshold) {
        const hoursUntilThreshold = (wateringThreshold - currentMoisture) / slope
        daysUntilWatering = Math.max(0, hoursUntilThreshold / 24)
    } else if (currentMoisture <= wateringThreshold) {
        daysUntilWatering = 0
    }

    // Calculate confidence based on R-squared and data points
    const dataPointFactor = Math.min(1, data.length / 100) // More data = more confidence
    const confidence = r_squared * 0.7 + dataPointFactor * 0.3

    return {
        current_moisture: currentMoisture,
        predicted_moisture_24h: Math.round(predictedMoisture * 10) / 10,
        slope: Math.round(slope * 1000) / 1000, // percent per hour
        intercept: Math.round(intercept * 10) / 10,
        trend,
        days_until_watering: daysUntilWatering !== null ? Math.round(daysUntilWatering * 10) / 10 : null,
        confidence: Math.round(confidence * 100) / 100,
        data_points: data.length
    }
}
