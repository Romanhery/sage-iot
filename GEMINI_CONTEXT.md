# 🌱 Smart Plant System - Complete Project Context for Gemini

Use this document to provide Gemini with comprehensive context about your project.

---

## 📋 Project Overview

**Project Name**: Smart Plant System (NEDC MESA Competition)
**Purpose**: An autonomous IoT plant monitoring and care system with AI-powered predictions, real-time sensor data visualization, and automated control systems.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **React**: Version 18.2
- **Styling**: Tailwind CSS v4
- **UI Library**: Radix UI primitives + shadcn/ui components
- **Charts**: Recharts
- **Notifications**: Sonner (toast notifications)
- **Forms**: React Hook Form + Zod validation

### Backend
- **API**: Next.js API Routes (Route Handlers)
- **Server Actions**: For database mutations
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Realtime**: Supabase Realtime for live notifications
- **AI**: Vercel AI SDK with GPT-4o-mini

### Hardware (IoT)
- **Microcontroller**: ESP32
- **Sensors**:
  - DHT22 (temperature/humidity)
  - Capacitive soil moisture sensor
  - BH1750 light sensor
- **Actuators** (relay-controlled):
  - Water pump
  - Circulation fan
  - Grow light

---

## 📁 Project Structure

```
smart-plant-system/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   └── controls.ts           # Control state updates
│   ├── api/                      # API Route Handlers
│   │   ├── ai/                   # AI analysis endpoints
│   │   │   └── analyze-plant/    # GPT-4o-mini plant analysis
│   │   ├── cron/                 # Scheduled tasks
│   │   │   └── check-alerts/     # Automated alert monitoring
│   │   ├── esp32/                # ESP32 device APIs
│   │   │   ├── sensor-data/      # POST sensor readings
│   │   │   ├── controls/         # GET control states
│   │   │   └── heartbeat/        # Device health check
│   │   ├── plant-presets/        # Plant preset data
│   │   └── predict/[plant_id]/   # Moisture predictions
│   ├── notifications/            # Notifications page
│   ├── plants/[id]/              # Plant detail page
│   ├── settings/                 # Settings page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard home
├── components/                   # React Components
│   ├── ui/                       # shadcn/ui components (57 files)
│   ├── ai-predictions.tsx        # Display AI recommendations
│   ├── ai-analysis-button.tsx    # Trigger AI analysis
│   ├── control-panel.tsx         # Device control switches
│   ├── moisture-prediction.tsx   # 24h moisture forecast
│   ├── notification-bell.tsx     # Notification indicator
│   ├── plant-card.tsx            # Plant dashboard card
│   ├── plant-header.tsx          # Plant detail header
│   ├── plant-presets-carousel.tsx# Popular plants carousel
│   ├── realtime-notifications.tsx# Supabase realtime listener
│   └── sensor-chart.tsx          # Recharts time-series
├── lib/                          # Utilities
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── ai/                       # AI utilities
│   ├── predictions.ts            # Linear regression logic
│   ├── api-auth.ts               # API authentication
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript Types
│   └── database.ts               # All database interfaces
├── scripts/                      # SQL Scripts
│   └── 001_create_tables.sql     # Complete Supabase schema
├── docs/                         # Documentation
│   ├── SETUP_GUIDE.md
│   ├── ESP32_API_GUIDE.md
│   ├── NOTIFICATIONS_GUIDE.md
│   └── HOW_AI_WORKS.md
└── PHASE*.md                     # Development phase docs
```

---

## 🗄️ Database Schema (Supabase PostgreSQL)

### Tables

#### `profiles`
Links to Supabase Auth users.
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id)
full_name TEXT
avatar_url TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### `plant_presets`
Pre-configured popular plant species for the carousel.
```sql
id SERIAL PRIMARY KEY
species_name TEXT NOT NULL
common_name TEXT NOT NULL
ideal_moisture_min INT (default: 40)
ideal_moisture_max INT (default: 70)
ideal_temp_min NUMERIC (default: 18.0)
ideal_temp_max NUMERIC (default: 28.0)
ideal_light_hours INT (default: 8)
image_url TEXT
description TEXT
care_tips TEXT
```

#### `plants`
User's registered plants/devices.
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES profiles(id)
name TEXT NOT NULL
plant_type TEXT NOT NULL
device_id TEXT UNIQUE NOT NULL  -- ESP32 device identifier
preset_id INT REFERENCES plant_presets(id)
image_url TEXT
location TEXT
is_automatic_mode BOOLEAN (default: true)
target_moisture INT (default: 50)
target_light_hours INT (default: 12)
```

#### `sensor_readings`
Time-series sensor data from ESP32.
```sql
id UUID PRIMARY KEY
plant_id UUID REFERENCES plants(id)
temperature NUMERIC(4,1)      -- e.g., 25.5°C
humidity NUMERIC(4,1)         -- e.g., 65.0%
soil_moisture NUMERIC(4,1)    -- e.g., 45.0%
light_level NUMERIC(6,1)      -- e.g., 1500.0 lux
water_level NUMERIC(4,1)      -- reservoir level %
timestamp TIMESTAMPTZ
```

#### `control_states`
Device control states (pump, fan, light).
```sql
id UUID PRIMARY KEY
plant_id UUID REFERENCES plants(id)
water_pump_on BOOLEAN
fan_on BOOLEAN
grow_light_on BOOLEAN
updated_at TIMESTAMPTZ
```

#### `ai_predictions`
AI-generated care recommendations.
```sql
id UUID PRIMARY KEY
plant_id UUID REFERENCES plants(id)
prediction_type TEXT  -- 'watering', 'light', 'temperature', 'general'
prediction_text TEXT
predicted_value NUMERIC(5,2)
confidence NUMERIC(3,2)  -- 0.00 to 1.00
created_at TIMESTAMPTZ
```

#### `notifications`
Alert and notification history.
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES profiles(id)
plant_id UUID REFERENCES plants(id)
notification_type TEXT  -- 'alert', 'warning', 'info'
title TEXT
message TEXT
read BOOLEAN
created_at TIMESTAMPTZ
```

### Database Triggers
- **Auto-create profile**: When user signs up via Supabase Auth
- **Auto-create notifications**: When sensor readings indicate critical conditions:
  - Water level < 10% → CRITICAL alert
  - Soil moisture < 20% → Warning
  - Temperature > 35°C or < 10°C → Warning

---

## 🔌 API Endpoints

### Web Application APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/analyze-plant` | POST | Generate AI recommendations using GPT-4o-mini |
| `/api/predict/[plant_id]` | GET | Get 24-hour moisture prediction (linear regression) |
| `/api/cron/check-alerts` | POST | Vercel Cron job for automated monitoring |
| `/api/plant-presets` | GET | Fetch all plant presets for carousel |

### ESP32 Device APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/esp32/sensor-data` | POST | Upload sensor readings |
| `/api/esp32/controls` | GET | Fetch current control states |
| `/api/esp32/heartbeat` | POST | Device health check & connection status |

---

## 🧠 Key Features Explained

### 1. Predictive Analytics (Linear Regression)
**File**: `lib/predictions.ts`

Uses simple linear regression (y = mx + b) on 7 days of moisture data:
- Calculates slope (rate of moisture change per hour)
- Predicts moisture 24 hours ahead
- Estimates days until watering needed (when moisture hits 30%)
- Provides confidence score based on R² and data point count

### 2. Real-time Notifications
**File**: `components/realtime-notifications.tsx`

Uses Supabase Realtime subscriptions:
- Listens for `INSERT` events on `notifications` table
- Shows toast notification when new alert arrives
- Filters by user_id for multi-user support

### 3. ESP32 Data Flow
1. ESP32 reads sensors every ~5 minutes
2. Sends POST to `/api/esp32/sensor-data`
3. Data stored in `sensor_readings` table
4. Database trigger checks for critical conditions
5. If critical → auto-creates notification
6. Frontend receives realtime notification

### 4. Control State Synchronization
1. User toggles switch in Control Panel
2. Server Action updates `control_states` table
3. ESP32 polls `/api/esp32/controls` every 10 seconds
4. ESP32 actuates relays accordingly

### 5. AI Analysis
Uses GPT-4o-mini to analyze:
- Current sensor readings
- 24-hour historical trends
- Plant type and settings
Generates actionable recommendations with confidence scores.

---

## 🔑 TypeScript Interfaces

```typescript
// Core Interfaces (from types/database.ts)

interface Plant {
  id: string
  user_id: string | null
  name: string
  plant_type: string
  device_id: string
  preset_id: number | null
  is_automatic_mode: boolean
  target_moisture: number
  target_light_hours: number
}

interface SensorReading {
  id: string
  plant_id: string
  temperature: number | null
  humidity: number | null
  soil_moisture: number | null
  light_level: number | null
  water_level: number | null
  timestamp: string
}

interface ControlState {
  id: string
  plant_id: string
  water_pump_on: boolean
  fan_on: boolean
  grow_light_on: boolean
  updated_at: string
}

interface PredictionResult {
  current_moisture: number
  predicted_moisture_24h: number
  slope: number
  trend: 'increasing' | 'decreasing' | 'stable'
  days_until_watering: number | null
  confidence: number
}

interface Notification {
  id: string
  user_id: string | null
  plant_id: string
  notification_type: 'alert' | 'warning' | 'info'
  title: string
  message: string
  read: boolean
}
```

---

## 🌐 Environment Variables

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=your-openai-key
```

---

## 📡 ESP32 Firmware Architecture

Based on Phase 1 & 5 documentation:

### "Store and Forward" Pattern
1. **LIVE_LOG.csv**: Permanent backup on SD card (never deleted)
2. **SYNC_QUEUE.csv**: Temporary holding for un-uploaded data

### Core Logic Pseudocode
```cpp
// Data Collection (every ~5 min)
void LogAndAttemptUpload() {
  READ_SENSORS();
  FORMAT_TO_CSV(data, csv_line);
  
  // Always save locally first
  SD_APPEND("LIVE_LOG.csv", csv_line);
  
  // Then try cloud
  if (WiFi_IS_CONNECTED) {
    if (SUPABASE_POST_DATA(data) == SUCCESS) {
      // Done
    } else {
      SD_APPEND("SYNC_QUEUE.csv", csv_line);
    }
  } else {
    SD_APPEND("SYNC_QUEUE.csv", csv_line);
  }
}

// Background Sync Task
void RunSyncQueue() {
  while (WiFi_IS_CONNECTED && SYNC_QUEUE_NOT_EMPTY) {
    READ_OLDEST_LINE(line);
    if (SUPABASE_POST_DATA(line) == SUCCESS) {
      DELETE_OLDEST_LINE_FROM_QUEUE();
    } else {
      break; // Retry later
    }
  }
}
```

---

## 🎯 Current Development Focus

Based on your open files and phase documents:
1. **Moisture Prediction Display** - Integrating the prediction API into the plant detail page
2. **Real-time Notifications** - Supabase realtime subscription for instant alerts
3. **Plant Presets Carousel** - For easy plant setup
4. **ESP32 Firmware** - FreeRTOS-based implementation

---

## 💬 How to Use This Context

Copy everything above and paste at the start of your Gemini conversation. Then ask specific questions like:

- "How should I modify the moisture-prediction.tsx component to show a chart?"
- "Write the ESP32 code for reading the BH1750 light sensor"
- "Add a delete plant feature with confirmation dialog"
- "Fix the realtime notification subscription for multiple users"

Gemini will now understand your full architecture and provide tailored assistance!
