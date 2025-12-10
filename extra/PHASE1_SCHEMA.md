# PHASE 1: Database Schema & Architecture Strategy
**Project:** Smart Garden System (NEDC MESA Competition)
**Stack:** Next.js (App Router), TypeScript, Supabase (PostgreSQL), Tailwind CSS.

## 1. Database Architecture (Supabase)
We need to generate a `schema.sql` file that I can run in the Supabase SQL Editor. It must include the following tables with Row Level Security (RLS) enabled.

### Table: `profiles`
* **Purpose:** Stores user data linked to Supabase Auth.
* **Columns:**
    * `id` (uuid, references auth.users, primary key)
    * `full_name` (text)
    * `avatar_url` (text)
    * `updated_at` (timestamp)

### Table: `plants`
* **Purpose:** The specific plants a user is growing.
* **Columns:**
    * `id` (uuid, default gen_random_uuid)
    * `user_id` (uuid, references profiles.id) -> *Critical: User can only see their own plants.*
    * `name` (text) -> e.g., "My Kitchen Basil"
    * `species` (text) -> e.g., "Ocimum basilicum"
    * `location` (text) -> e.g., "Living Room"
    * `planted_date` (date)
    * `is_automatic_mode` (boolean) -> Default true.
    * `target_moisture` (int) -> e.g., 60 (percent).
    * `target_light_hours` (int) -> e.g., 12.

### Table: `sensor_readings`
* **Purpose:** Time-series data from the ESP32.
* **Columns:**
    * `id` (bigint, generated always as identity)
    * `plant_id` (uuid, references plants.id, on delete cascade)
    * `temperature` (float)
    * `humidity` (float)
    * `soil_moisture` (float)
    * `light_lux` (float)
    * `water_level` (float)
    * `created_at` (timestamptz, default now())

### Table: `plant_presets` (The "Carousel" Data)
* **Purpose:** Read-only data for popular plants (Tomatoes, Basil, Mint).
* **Columns:**
    * `id` (int)
    * `species_name` (text)
    * `ideal_moisture_min` (int)
    * `ideal_moisture_max` (int)
    * `ideal_light_hours` (int)
    * `image_url` (text)
    * `description` (text)

## 2. TypeScript Types
We need a file `types/database.ts` that exports interfaces matching this schema exactly.
* Interfaces should be named `Profile`, `Plant`, `SensorReading`, `PlantPreset`.
* Include a joined type `PlantWithReadings` which extends `Plant` and includes an array of `SensorReading`.

## 3. Connection Setup
We need a standard Supabase Client Helper at `lib/supabaseClient.ts` that uses `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.