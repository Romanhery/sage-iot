-- =====================================================
-- Smart Garden System - Complete Database Schema
-- NEDC MESA Competition
-- =====================================================
-- This schema is designed for Supabase and includes:
-- 1. User profiles linked to Supabase Auth
-- 2. Plants with user ownership
-- 3. Sensor readings time-series data
-- 4. Control states for ESP32 devices
-- 5. AI predictions storage
-- 6. Notification system with auto-triggers
-- 7. Plant presets for the popular plants carousel
-- =====================================================

-- =====================================================
-- PROFILES TABLE (Linked to Supabase Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PLANT PRESETS TABLE (Popular Plants Carousel)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.plant_presets (
  id SERIAL PRIMARY KEY,
  species_name TEXT NOT NULL,
  common_name TEXT NOT NULL,
  ideal_moisture_min INT DEFAULT 40,
  ideal_moisture_max INT DEFAULT 70,
  ideal_temp_min NUMERIC(4,1) DEFAULT 18.0,
  ideal_temp_max NUMERIC(4,1) DEFAULT 28.0,
  ideal_light_hours INT DEFAULT 8,
  image_url TEXT,
  description TEXT,
  care_tips TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PLANTS TABLE (User's Registered Plants/Devices)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plant_type TEXT NOT NULL,
  device_id TEXT UNIQUE NOT NULL,
  preset_id INT REFERENCES public.plant_presets(id),
  image_url TEXT,
  location TEXT,
  is_automatic_mode BOOLEAN DEFAULT TRUE,
  target_moisture INT DEFAULT 50,
  target_light_hours INT DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SENSOR READINGS TABLE (Time-Series Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  temperature NUMERIC(4, 1),
  humidity NUMERIC(4, 1),
  soil_moisture NUMERIC(4, 1),
  light_level NUMERIC(6, 1),
  water_level NUMERIC(4, 1) DEFAULT 100,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTROL STATES TABLE (Device Control)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.control_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  water_pump_on BOOLEAN DEFAULT FALSE,
  fan_on BOOLEAN DEFAULT FALSE,
  grow_light_on BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI PREDICTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL, -- 'watering', 'light', 'temperature', 'general'
  prediction_text TEXT NOT NULL,
  predicted_value NUMERIC(5, 2), -- For storing numerical predictions
  confidence NUMERIC(3, 2), -- 0.00 to 1.00
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  notification_type TEXT DEFAULT 'alert', -- 'alert', 'warning', 'info'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON public.plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_device_id ON public.plants(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_plant_id ON public.sensor_readings(plant_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON public.sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_plant_timestamp ON public.sensor_readings(plant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_control_states_plant_id ON public.control_states(plant_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_plant_id ON public.ai_predictions(plant_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_created_at ON public.ai_predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_plant_id ON public.notifications(plant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- =====================================================
-- TRIGGER FUNCTION: Auto-create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER FUNCTION: Auto-create notification on critical readings
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_sensor_alerts()
RETURNS TRIGGER AS $$
DECLARE
  plant_record RECORD;
  user_record UUID;
BEGIN
  -- Get plant info
  SELECT p.*, p.user_id INTO plant_record
  FROM public.plants p
  WHERE p.id = NEW.plant_id;

  user_record := plant_record.user_id;

  -- Check for critical water level (reservoir empty)
  IF NEW.water_level IS NOT NULL AND NEW.water_level < 10 THEN
    INSERT INTO public.notifications (user_id, plant_id, notification_type, title, message)
    VALUES (
      user_record,
      NEW.plant_id,
      'alert',
      'CRITICAL: Water Reservoir Low!',
      'The water reservoir for "' || plant_record.name || '" is nearly empty (' || NEW.water_level || '%). Please refill immediately.'
    );
  END IF;

  -- Check for critically low soil moisture
  IF NEW.soil_moisture IS NOT NULL AND NEW.soil_moisture < 20 THEN
    INSERT INTO public.notifications (user_id, plant_id, notification_type, title, message)
    VALUES (
      user_record,
      NEW.plant_id,
      'warning',
      'Low Soil Moisture Alert',
      '"' || plant_record.name || '" has very low soil moisture (' || NEW.soil_moisture || '%). Consider watering soon.'
    );
  END IF;

  -- Check for extreme temperature
  IF NEW.temperature IS NOT NULL AND (NEW.temperature > 35 OR NEW.temperature < 10) THEN
    INSERT INTO public.notifications (user_id, plant_id, notification_type, title, message)
    VALUES (
      user_record,
      NEW.plant_id,
      'warning',
      'Temperature Warning',
      '"' || plant_record.name || '" is experiencing extreme temperature (' || NEW.temperature || '°C). Consider adjusting environment.'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on sensor_readings insert
DROP TRIGGER IF EXISTS on_sensor_reading_inserted ON public.sensor_readings;
CREATE TRIGGER on_sensor_reading_inserted
  AFTER INSERT ON public.sensor_readings
  FOR EACH ROW EXECUTE FUNCTION public.check_sensor_alerts();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_presets ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Plants: Users can only see/edit their own plants
CREATE POLICY "Users can view own plants" ON public.plants
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own plants" ON public.plants
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own plants" ON public.plants
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete own plants" ON public.plants
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Sensor readings: View if you own the plant, insert via API
CREATE POLICY "Users can view own plant readings" ON public.sensor_readings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.plants WHERE plants.id = plant_id AND (plants.user_id = auth.uid() OR plants.user_id IS NULL))
  );
CREATE POLICY "Allow insert sensor readings" ON public.sensor_readings
  FOR INSERT WITH CHECK (true);

-- Control states: Users can control their own plants
CREATE POLICY "Users can view own control states" ON public.control_states
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.plants WHERE plants.id = plant_id AND (plants.user_id = auth.uid() OR plants.user_id IS NULL))
  );
CREATE POLICY "Users can update own control states" ON public.control_states
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.plants WHERE plants.id = plant_id AND (plants.user_id = auth.uid() OR plants.user_id IS NULL))
  );

-- AI Predictions: View if you own the plant
CREATE POLICY "Users can view own predictions" ON public.ai_predictions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.plants WHERE plants.id = plant_id AND (plants.user_id = auth.uid() OR plants.user_id IS NULL))
  );
CREATE POLICY "Allow insert predictions" ON public.ai_predictions
  FOR INSERT WITH CHECK (true);

-- Notifications: Users see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Allow insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Plant presets: Everyone can read
CREATE POLICY "Anyone can view plant presets" ON public.plant_presets
  FOR SELECT USING (true);
