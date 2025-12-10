import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { predictMoisture } from '@/lib/predictions'

/**
 * GET /api/predict/[plant_id]
 * Returns soil moisture prediction for the next 24 hours using linear regression
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ plant_id: string }> }
) {
    try {
        const { plant_id } = await params
        const supabase = await createClient()

        // Verify plant exists
        const { data: plant, error: plantError } = await supabase
            .from('plants')
            .select('id, name, target_moisture')
            .eq('id', plant_id)
            .single()

        if (plantError || !plant) {
            return NextResponse.json(
                { error: 'Plant not found' },
                { status: 404 }
            )
        }

        // Fetch last 7 days of sensor readings
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

        const { data: readings, error: readingsError } = await supabase
            .from('sensor_readings')
            .select('soil_moisture, timestamp')
            .eq('plant_id', plant_id)
            .gte('timestamp', sevenDaysAgo)
            .order('timestamp', { ascending: true })

        if (readingsError) {
            console.error('[Predict API] Error fetching readings:', readingsError)
            return NextResponse.json(
                { error: 'Failed to fetch sensor data' },
                { status: 500 }
            )
        }

        if (!readings || readings.length < 2) {
            return NextResponse.json({
                success: true,
                plant_id,
                plant_name: plant.name,
                prediction: null,
                message: 'Not enough data for prediction (need at least 2 readings)'
            })
        }

        // Calculate prediction using linear regression
        const prediction = predictMoisture(readings, 24)

        // Determine status message
        let status_message = ''
        if (prediction.trend === 'decreasing') {
            if (prediction.days_until_watering !== null && prediction.days_until_watering <= 1) {
                status_message = 'Water soon! Moisture is dropping and will reach low levels within 24 hours.'
            } else if (prediction.days_until_watering !== null && prediction.days_until_watering <= 3) {
                status_message = `Consider watering in ${Math.ceil(prediction.days_until_watering)} days.`
            } else {
                status_message = 'Moisture is slowly decreasing but still at healthy levels.'
            }
        } else if (prediction.trend === 'increasing') {
            status_message = 'Moisture is increasing - plant was recently watered or absorbing water.'
        } else {
            status_message = 'Moisture levels are stable.'
        }

        // Check against target
        const targetMoisture = plant.target_moisture || 50
        if (prediction.predicted_moisture_24h < targetMoisture - 20) {
            status_message += ' Warning: Predicted moisture will be below target range.'
        }

        return NextResponse.json({
            success: true,
            plant_id,
            plant_name: plant.name,
            target_moisture: targetMoisture,
            prediction: {
                ...prediction,
                status_message
            }
        })

    } catch (error) {
        console.error('[Predict API] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
