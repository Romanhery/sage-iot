# Smart Plant System - Complete Setup Guide

## Overview
This guide will walk you through setting up your smart plant monitoring system from v0 to a working application.

---

## Part 1: Export Code from v0 to VS Code

### Option A: Download ZIP (Recommended)
1. **In v0**: Click the three dots (⋯) in the top-right corner of the code preview
2. Select **"Download ZIP"**
3. Extract the ZIP file to your desired location
4. Open the folder in VS Code: `code your-folder-name`

### Option B: Push to GitHub
1. **In v0**: Click the GitHub icon in the top-right corner
2. Connect your GitHub account if not already connected
3. Create a new repository or push to existing one
4. Clone the repository in VS Code:
   \`\`\`bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   code .
   \`\`\`

---

## Part 2: Set Up Supabase Database

### Step 1: Access Your Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. You should see your connected project from v0
   - If not, create a new project (select a region close to you)

### Step 2: Run Database Scripts
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. **Run Script 1 (Create Tables)**:
   - Open `scripts/001_create_tables.sql` from your downloaded code
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **"Run"** (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned"

4. **Run Script 2 (Seed Data)**:
   - Open `scripts/002_seed_data.sql`
   - Copy the entire contents
   - Paste into a new SQL Editor query
   - Click **"Run"**
   - You should see confirmation that rows were inserted

### Step 3: Verify Tables Were Created
1. In Supabase dashboard, click **"Table Editor"** in the left sidebar
2. You should now see these tables:
   - `plants`
   - `sensor_readings`
   - `control_states`
   - `ai_predictions`
   - `notifications`

---

## Part 3: Set Up Environment Variables

### Step 1: Get Your Supabase Credentials
1. In Supabase dashboard, click **"Settings"** → **"API"**
2. You'll need these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Project API Key** - use the `anon public` key

### Step 2: Create .env.local File
1. In VS Code, create a file named `.env.local` in the root of your project
2. Add these variables (replace with your actual values):

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Configuration (from Supabase Settings → Database)
POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
POSTGRES_PRISMA_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
POSTGRES_USER=postgres.xxxxx
POSTGRES_HOST=db.xxxxx.supabase.co
POSTGRES_PASSWORD=your-db-password
POSTGRES_DATABASE=postgres

# Development (for email redirects during testing)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### Step 3: Where to Find These Values in Supabase

**Project URL & API Keys:**
- Dashboard → Settings → API
- Copy "Project URL" 
- Copy "anon public" key (for ANON_KEY)
- Copy "service_role" key (for SERVICE_ROLE_KEY) - ⚠️ Keep this secret!

**Database Connection Strings:**
- Dashboard → Settings → Database
- Scroll down to "Connection string"
- Select "URI" mode
- Copy the connection string and replace `[YOUR-PASSWORD]` with your actual database password
- If you forgot your database password, you can reset it in Settings → Database

---

## Part 4: Install and Run Locally

### Step 1: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 2: Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### Step 3: Open Your App
- Open your browser to [http://localhost:3000](http://localhost:3000)
- You should see your Smart Plant System dashboard with the 3 seed plants!

---

## Part 5: Set Up ESP32 Hardware (Optional)

If you want to connect real ESP32 devices:

### Hardware Requirements
- ESP32 development board
- DHT22 temperature/humidity sensor
- Capacitive soil moisture sensor
- BH1750 light sensor
- Relay modules (for pump, fan, light control)
- Water pump
- 5V fan
- LED grow light

### Step 1: Install Arduino IDE
1. Download from [arduino.cc](https://www.arduino.cc/en/software)
2. Install ESP32 board support:
   - File → Preferences
   - Add to "Additional Board Manager URLs": 
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Tools → Board → Boards Manager → Search "ESP32" → Install

### Step 2: Install Required Libraries
In Arduino IDE:
- Sketch → Include Library → Manage Libraries
- Install these libraries:
  - `WiFi` (built-in)
  - `HTTPClient` (built-in)
  - `DHT sensor library` by Adafruit
  - `BH1750` by Christopher Laws
  - `ArduinoJson` by Benoit Blanchon

### Step 3: Configure ESP32 Code
1. Open `scripts/esp32_example.ino` in Arduino IDE
2. Update these lines with your credentials:
   \`\`\`cpp
   const char* ssid = "Your-WiFi-SSID";
   const char* password = "Your-WiFi-Password";
   const char* serverUrl = "https://your-vercel-app.vercel.app/api/esp32/sensor-data";
   const char* deviceId = "esp32_001"; // Must match a plant's device_id in database
   \`\`\`

### Step 4: Wire Hardware
Follow the wiring diagram in `docs/ESP32_API_GUIDE.md`:
- DHT22: Data pin → GPIO 4
- Soil Moisture: Analog out → GPIO 34
- BH1750: SDA → GPIO 21, SCL → GPIO 22
- Relay 1 (Pump): Control → GPIO 25
- Relay 2 (Fan): Control → GPIO 26
- Relay 3 (Light): Control → GPIO 27

### Step 5: Upload and Test
1. Connect ESP32 via USB
2. Select board: Tools → Board → ESP32 Dev Module
3. Select port: Tools → Port → (your ESP32 port)
4. Click Upload (→ button)
5. Open Serial Monitor (115200 baud) to see debug output

---

## Part 6: Deploy to Production (Vercel)

### Option A: Deploy from v0
1. In v0, click **"Publish"** button in top-right
2. Follow the prompts to deploy to Vercel
3. Environment variables from v0 will automatically transfer

### Option B: Deploy from GitHub
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add all environment variables from your `.env.local`
5. Click "Deploy"

### Step 3: Update ESP32 Configuration
Once deployed, update your ESP32 code with the production URL:
\`\`\`cpp
const char* serverUrl = "https://your-app-name.vercel.app/api/esp32/sensor-data";
\`\`\`

---

## Part 7: Testing the System

### Test 1: View Dashboard
- Open your app at `http://localhost:3000`
- You should see 3 sample plants with recent sensor data
- Click on a plant to see detailed view

### Test 2: Control Devices
- On plant detail page, toggle the water pump, fan, or light
- Check the database in Supabase Table Editor → `control_states`
- The `updated_at` timestamp should update

### Test 3: AI Predictions
- Click "Run AI Analysis" button on plant detail page
- Wait a few seconds
- You should see new recommendations appear

### Test 4: Notifications
- Click the bell icon in the header
- You should see sample notifications
- Mark some as read to test functionality

### Test 5: Add New Plant
- Go to Settings page (add `/settings` to URL)
- Click "Add New Plant"
- Fill in plant name and device ID
- Verify new plant appears in dashboard

### Test 6: ESP32 (if hardware connected)
- Check Serial Monitor for "Data sent successfully"
- Verify new sensor readings appear in dashboard
- Toggle controls and verify relays activate

---

## Troubleshooting

### "Cannot connect to Supabase"
- ✅ Check `.env.local` has correct SUPABASE_URL and keys
- ✅ Verify you ran both SQL scripts in Supabase
- ✅ Restart dev server after changing `.env.local`

### "No plants showing up"
- ✅ Check Supabase Table Editor → `plants` table has data
- ✅ Run seed script again if needed
- ✅ Check browser console (F12) for errors

### "AI Analysis not working"
- ✅ Default uses OpenAI via Vercel AI Gateway (should work automatically)
- ✅ Check browser console for error messages
- ✅ Fallback rule-based system should still provide recommendations

### "ESP32 not connecting"
- ✅ Check WiFi credentials in code
- ✅ Verify ESP32 can ping the server URL
- ✅ Check Serial Monitor for error messages
- ✅ Ensure device_id matches a plant in database

### "Controls not working"
- ✅ Check ESP32 code polls `/api/esp32/controls` endpoint
- ✅ Verify polling interval (default 10 seconds)
- ✅ Check Serial Monitor shows "Control state updated"

---

## File Structure Reference

\`\`\`
smart-plant-system/
├── app/
│   ├── actions/           # Server actions for mutations
│   ├── api/              # API routes for ESP32
│   ├── notifications/    # Notifications page
│   ├── plants/          # Plant detail pages
│   ├── settings/        # Settings & device management
│   └── page.tsx         # Main dashboard
├── components/          # React components
├── lib/
│   ├── ai/             # AI prediction logic
│   ├── notifications/  # Alert triggering system
│   └── supabase/       # Supabase client setup
├── scripts/
│   ├── 001_create_tables.sql
│   ├── 002_seed_data.sql
│   └── esp32_example.ino
├── docs/               # Documentation
├── .env.local         # Environment variables (create this!)
└── package.json       # Dependencies
\`\`\`

---

## Next Steps

1. ✅ Export code from v0
2. ✅ Set up Supabase database
3. ✅ Configure environment variables
4. ✅ Run locally and test
5. ✅ (Optional) Set up ESP32 hardware
6. ✅ Deploy to Vercel
7. 🎉 Monitor your plants!

---

## Support

- **v0 Issues**: Open a support ticket at [vercel.com/help](https://vercel.com/help)
- **Supabase Help**: [supabase.com/docs](https://supabase.com/docs)
- **ESP32 Documentation**: See `docs/ESP32_API_GUIDE.md`

---

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to Git (it's in `.gitignore`)
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret
- Use Row Level Security (RLS) policies in production
- Change default API keys before going live with hardware
