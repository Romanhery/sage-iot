/**
 * Database Types for Smart Plant System
 * Auto-generated from Supabase schema
 */

// =====================================================
// Base Table Types
// =====================================================

export interface Profile {
    id: string
    full_name: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export interface PlantPreset {
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
    created_at: string
}

export interface Plant {
    id: string
    user_id: string | null
    name: string
    plant_type: string
    device_id: string
    preset_id: number | null
    image_url: string | null
    location: string | null
    is_automatic_mode: boolean
    target_moisture: number
    target_light_hours: number
    created_at: string
    updated_at: string
}

export interface SensorReading {
    id: string
    plant_id: string
    temperature: number | null
    humidity: number | null
    soil_moisture: number | null
    light_level: number | null
    water_level: number | null
    timestamp: string
}

export interface ControlState {
    id: string
    plant_id: string
    water_pump_on: boolean
    fan_on: boolean
    grow_light_on: boolean
    updated_at: string
}

export interface AIPrediction {
    id: string
    plant_id: string
    prediction_type: 'watering' | 'light' | 'temperature' | 'general'
    prediction_text: string
    predicted_value: number | null
    confidence: number | null
    created_at: string
}

export interface Notification {
    id: string
    user_id: string | null
    plant_id: string
    notification_type: 'alert' | 'warning' | 'info'
    title: string
    message: string
    read: boolean
    created_at: string
}

// =====================================================
// Joined/Extended Types
// =====================================================

export interface PlantWithReadings extends Plant {
    sensor_readings: SensorReading[]
    control_states: ControlState[]
    ai_predictions?: AIPrediction[]
}

export interface PlantWithLatestData extends Plant {
    latestReading: SensorReading | null
    controlState: ControlState | null
}

export interface NotificationWithPlant extends Notification {
    plant: Pick<Plant, 'id' | 'name' | 'plant_type'>
}

// =====================================================
// API Payload Types
// =====================================================

export interface SensorDataPayload {
    device_id: string
    temperature: number
    humidity: number
    soil_moisture: number
    light_level: number
    water_level?: number
    timestamp?: string
}

export interface PredictionResult {
    current_moisture: number
    predicted_moisture_24h: number
    slope: number
    trend: 'increasing' | 'decreasing' | 'stable'
    days_until_watering: number | null
    confidence: number
}

// =====================================================
// Form/Input Types
// =====================================================

export interface CreatePlantInput {
    name: string
    plant_type: string
    device_id: string
    location?: string
    preset_id?: number
    target_moisture?: number
    target_light_hours?: number
}

export interface UpdateControlStateInput {
    water_pump_on?: boolean
    fan_on?: boolean
    grow_light_on?: boolean
}

// =====================================================
// Database Helper Type for Supabase
// =====================================================

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'created_at' | 'updated_at'>
                Update: Partial<Omit<Profile, 'id'>>
            }
            plant_presets: {
                Row: PlantPreset
                Insert: Omit<PlantPreset, 'id' | 'created_at'>
                Update: Partial<Omit<PlantPreset, 'id'>>
            }
            plants: {
                Row: Plant
                Insert: Omit<Plant, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Plant, 'id'>>
            }
            sensor_readings: {
                Row: SensorReading
                Insert: Omit<SensorReading, 'id' | 'timestamp'>
                Update: Partial<Omit<SensorReading, 'id'>>
            }
            control_states: {
                Row: ControlState
                Insert: Omit<ControlState, 'id' | 'updated_at'>
                Update: Partial<Omit<ControlState, 'id'>>
            }
            ai_predictions: {
                Row: AIPrediction
                Insert: Omit<AIPrediction, 'id' | 'created_at'>
                Update: Partial<Omit<AIPrediction, 'id'>>
            }
            notifications: {
                Row: Notification
                Insert: Omit<Notification, 'id' | 'created_at'>
                Update: Partial<Omit<Notification, 'id'>>
            }
        }
    }
}
