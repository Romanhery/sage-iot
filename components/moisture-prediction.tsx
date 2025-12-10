"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Minus, Droplets, Clock, AlertTriangle } from "lucide-react"

interface PredictionData {
    current_moisture: number
    predicted_moisture_24h: number
    slope: number
    trend: 'increasing' | 'decreasing' | 'stable'
    days_until_watering: number | null
    confidence: number
    status_message: string
    data_points: number
}

interface MoisturePredictionProps {
    plantId: string
}

export function MoisturePrediction({ plantId }: MoisturePredictionProps) {
    const [prediction, setPrediction] = useState<PredictionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchPrediction() {
            try {
                const response = await fetch(`/api/predict/${plantId}`)
                const data = await response.json()

                if (data.success && data.prediction) {
                    setPrediction(data.prediction)
                } else if (data.message) {
                    setError(data.message)
                }
            } catch (err) {
                setError('Failed to fetch prediction')
                console.error('Prediction fetch error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchPrediction()
    }, [plantId])

    const getTrendIcon = () => {
        if (!prediction) return <Minus className="w-5 h-5" />
        switch (prediction.trend) {
            case 'increasing':
                return <TrendingUp className="w-5 h-5 text-blue-500" />
            case 'decreasing':
                return <TrendingDown className="w-5 h-5 text-orange-500" />
            default:
                return <Minus className="w-5 h-5 text-muted-foreground" />
        }
    }

    const getMoistureColor = (moisture: number) => {
        if (moisture < 30) return 'text-red-500'
        if (moisture < 50) return 'text-orange-500'
        return 'text-green-500'
    }

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        Moisture Prediction
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-8 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !prediction) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        Moisture Prediction
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {error || 'Not enough data for prediction yet'}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Moisture Prediction
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current vs Predicted */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Current</p>
                        <p className={`text-2xl font-bold ${getMoistureColor(prediction.current_moisture)}`}>
                            {prediction.current_moisture.toFixed(0)}%
                        </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">In 24 Hours</p>
                        <p className={`text-2xl font-bold ${getMoistureColor(prediction.predicted_moisture_24h)}`}>
                            {prediction.predicted_moisture_24h.toFixed(0)}%
                        </p>
                    </div>
                </div>

                {/* Trend */}
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-2">
                        {getTrendIcon()}
                        <span className="text-sm font-medium capitalize">{prediction.trend}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {Math.abs(prediction.slope * 24).toFixed(1)}%/day
                    </span>
                </div>

                {/* Watering Alert */}
                {prediction.days_until_watering !== null && prediction.days_until_watering <= 3 && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg ${prediction.days_until_watering <= 1
                            ? 'bg-red-500/10 border border-red-500/20'
                            : 'bg-orange-500/10 border border-orange-500/20'
                        }`}>
                        <AlertTriangle className={`w-4 h-4 mt-0.5 ${prediction.days_until_watering <= 1 ? 'text-red-500' : 'text-orange-500'
                            }`} />
                        <div>
                            <p className={`text-sm font-medium ${prediction.days_until_watering <= 1 ? 'text-red-500' : 'text-orange-500'
                                }`}>
                                {prediction.days_until_watering <= 1
                                    ? 'Water needed soon!'
                                    : `Water in ~${Math.ceil(prediction.days_until_watering)} days`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Based on current trend analysis
                            </p>
                        </div>
                    </div>
                )}

                {/* Status Message */}
                <p className="text-sm text-muted-foreground">
                    {prediction.status_message}
                </p>

                {/* Confidence */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Based on {prediction.data_points} readings
                    </span>
                    <span>
                        {(prediction.confidence * 100).toFixed(0)}% confidence
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
