# Smart Plant Growing System - Complete Setup Guide

**Version 1.0** | Last Updated: November 2024

---

## Table of Contents

1. [Introduction](#introduction)
2. [What You'll Need](#what-youll-need)
3. [Part 1: Software Setup](#part-1-software-setup)
4. [Part 2: Hardware Assembly](#part-2-hardware-assembly)
5. [Part 3: Programming ESP32](#part-3-programming-esp32)
6. [Part 4: Connecting Everything](#part-4-connecting-everything)
7. [Troubleshooting](#troubleshooting)
8. [Appendix](#appendix)

---

## Introduction

This guide will walk you through setting up your complete autonomous smart plant-growing system. By the end, you'll have:

- A web dashboard to monitor your plants from anywhere
- Real-time sensor data (temperature, humidity, soil moisture, light)
- Remote control of water pump, fan, and grow light
- AI-powered plant care recommendations
- Automatic alerts when plants need attention

**Estimated Setup Time:** 2-3 hours (first time)

---

## What You'll Need

### Software/Accounts
- [ ] GitHub account (free at github.com)
- [ ] Supabase account (already connected via v0)
- [ ] Vercel account (free at vercel.com)
- [ ] Arduino IDE (download from arduino.cc)

### Hardware Components

#### Core Components
- [ ] ESP32 Development Board (NodeMCU-32S or similar) - $8-12
- [ ] DHT22 Temperature/Humidity Sensor - $5-8
- [ ] Capacitive Soil Moisture Sensor v1.2 - $3-5
- [ ] BH1750 Light Sensor Module (I2C) - $2-4

#### Control Components
- [ ] 3-Channel 5V Relay Module - $5-8
- [ ] 5V Water Pump (submersible mini pump) - $5-10
- [ ] 5V DC Fan (small computer fan) - $3-6
- [ ] LED Grow Light Strip or 5V LED array - $10-20

#### Power & Wiring
- [ ] 5V Power Supply (2-3A recommended) - $8-12
- [ ] Breadboard (optional, for prototyping) - $5
- [ ] Jumper wires (male-to-male, male-to-female) - $5
- [ ] USB Cable (for ESP32 programming)

#### Optional
- [ ] Enclosure/case for electronics
- [ ] Water reservoir/container
- [ ] Tubing for water pump
- [ ] Plant pot with drainage

**Total Estimated Cost:** $60-120 USD

### Tools Needed
- Computer with internet connection
- Soldering iron (optional, for permanent connections)
- Wire strippers
- Small screwdriver

---

## Part 1: Software Setup

### Step 1: Set Up Supabase Database

**Time:** 10 minutes

1. **Access Supabase Dashboard**
   - Go to https://supabase.com
   - Sign in with your account
   - You should see your project connected from v0

2. **Open SQL Editor**
   - Click on your project
   - In the left sidebar, click **SQL Editor**
   - Click **New Query**

3. **Create Database Tables**
   - Open your GitHub repo: `v0-smart-plant-system`
   - Navigate to `scripts/001_create_tables.sql`
   - Copy the entire SQL script
   - Paste it into Supabase SQL Editor
   - Click **Run** (bottom right)
   - You should see "Success. No rows returned"

4. **Add Sample Data**
   - Click **New Query** again
   - Open `scripts/002_seed_data.sql` from your repo
   - Copy and paste the script
   - Click **Run**
   - You should see "Success" message

5. **Verify Tables Created**
   - In left sidebar, click **Table Editor**
   - You should see these tables:
     - `plants`
     - `sensor_readings`
     - `control_states`
     - `ai_predictions`
     - `notifications`

**✓ Checkpoint:** You should see 5 tables with sample data in Table Editor.

---

### Step 2: Deploy App to Vercel

**Time:** 5 minutes

**Option A: Deploy from v0 (Easiest)**

1. Go back to your v0 chat
2. Click **Publish** button (top-right corner)
3. Select **Deploy to Vercel**
4. Click **Deploy**
5. Wait 2-3 minutes for deployment
6. Copy your app URL (e.g., `https://your-app.vercel.app`)

**Option B: Deploy from GitHub**

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select `v0-smart-plant-system`
4. Click **Import**
5. Vercel will auto-detect Next.js settings
6. Click **Deploy**
7. Wait 2-3 minutes
8. Copy your app URL

**✓ Checkpoint:** Visit your app URL - you should see the dashboard with 3 sample plants.

---

### Step 3: Test the App

**Time:** 3 minutes

1. **View Dashboard**
   - Open your app URL in browser
   - You should see 3 plants: Monstera, Snake Plant, Basil
   - Each shows temperature, humidity, moisture, light readings

2. **Check Plant Details**
   - Click on any plant card
   - You should see:
     - Current sensor readings
     - 24-hour history charts
     - Control panel (pump, fan, light toggles)
     - AI predictions section

3. **Test Controls**
   - Toggle the water pump switch
   - Check if it saves (refresh page)
   - Toggle it back off

4. **View Notifications**
   - Click bell icon (top-right)
   - You should see sample notifications

**✓ Checkpoint:** App loads and displays data correctly. Save your app URL - you'll need it for ESP32 programming.

---

## Part 2: Hardware Assembly

### Step 1: Understanding the Wiring

**Time:** 5 minutes (read carefully!)

The ESP32 connects to sensors and controls using GPIO pins:

**Pin Connections Overview:**
\`\`\`
ESP32          →  Component
─────────────────────────────
GPIO 4         →  DHT22 Data Pin
GPIO 34        →  Soil Moisture Analog
GPIO 21 (SDA)  →  BH1750 SDA
GPIO 22 (SCL)  →  BH1750 SCL
GPIO 25        →  Relay 1 (Water Pump)
GPIO 26        →  Relay 2 (Fan)
GPIO 27        →  Relay 3 (Grow Light)
3.3V           →  Sensor Power (DHT22, BH1750)
5V             →  Soil Moisture VCC, Relay VCC
GND            →  All Ground connections
\`\`\`

**Important Notes:**
- ESP32 GPIO pins are 3.3V - never connect 5V directly to GPIO!
- Soil moisture sensor can use 5V power, but signal goes to GPIO
- BH1750 uses I2C (needs SDA/SCL connections)
- Relays control high-power devices (pump, fan, light)

---

### Step 2: Connect Sensors First

**Time:** 20 minutes

#### DHT22 Temperature/Humidity Sensor

**Connections:**
\`\`\`
DHT22          ESP32
─────────────────────
VCC (+)    →   3.3V
GND (-)    →   GND
DATA       →   GPIO 4
\`\`\`

**Notes:**
- DHT22 has 4 pins, but only 3 are used
- Some DHT22 modules have built-in pull-up resistor
- If readings fail, add 10kΩ resistor between VCC and DATA

---

#### Soil Moisture Sensor

**Connections:**
\`\`\`
Moisture Sensor    ESP32
───────────────────────────
VCC            →   5V
GND            →   GND
AOUT           →   GPIO 34
\`\`\`

**Notes:**
- Use AOUT (analog output), not DOUT
- GPIO 34 is ADC pin (reads analog values)
- Insert metal prongs into soil for readings

---

#### BH1750 Light Sensor

**Connections:**
\`\`\`
BH1750         ESP32
─────────────────────
VCC        →   3.3V
GND        →   GND
SDA        →   GPIO 21
SCL        →   GPIO 22
\`\`\`

**Notes:**
- BH1750 uses I2C protocol (2 wires: SDA, SCL)
- Address is usually 0x23 (default)
- Position sensor near plant to measure light

**✓ Checkpoint:** All sensors connected. Double-check wiring before powering on.

---

### Step 3: Connect Relay Module

**Time:** 15 minutes

The relay module acts as a switch to control pumps, fans, and lights.

#### Relay Module Connections

**Connections to ESP32:**
\`\`\`
Relay Module    ESP32
──────────────────────
VCC         →   5V
GND         →   GND
IN1         →   GPIO 25 (Water Pump)
IN2         →   GPIO 26 (Fan)
IN3         →   GPIO 27 (Grow Light)
\`\`\`

**Important Relay Wiring:**
- Relays have 3 terminals per channel: COM, NO, NC
  - **COM** = Common (connect to power source)
  - **NO** = Normally Open (device turns ON when relay triggered)
  - **NC** = Normally Closed (device turns OFF when relay triggered)
- For most uses, connect: Power → COM, Device → NO

**✓ Checkpoint:** Relay module connected to ESP32 control pins.

---

### Step 4: Connect Devices to Relays

**Time:** 20 minutes

**Safety Warning:** 
- Only use low voltage devices (5V-12V DC)
- Never connect AC mains voltage (110V/220V) unless you're qualified
- Ensure proper insulation and polarity

#### Water Pump Connection

\`\`\`
Power Supply (+5V)  →  COM (Relay 1)
NO (Relay 1)        →  Pump (+) wire
Pump (-) wire       →  Power Supply GND
\`\`\`

**Setup:**
- Place pump in water reservoir
- Attach tubing to pump outlet
- Route tubing to plant pot

---

#### Fan Connection

\`\`\`
Power Supply (+5V)  →  COM (Relay 2)
NO (Relay 2)        →  Fan (+) wire
Fan (-) wire        →  Power Supply GND
\`\`\`

**Setup:**
- Position fan to circulate air around plant
- Ensure it won't blow plant over

---

#### Grow Light Connection

\`\`\`
Power Supply (+5V)  →  COM (Relay 3)
NO (Relay 3)        →  Light (+) wire
Light (-) wire      →  Power Supply GND
\`\`\`

**Setup:**
- Position grow light 6-12 inches above plant
- Ensure LED strip has proper mounting

**✓ Checkpoint:** All devices wired to relays. DO NOT power on yet.

---

### Step 5: Final Wiring Check

**Time:** 10 minutes

Before powering on, verify:

**Power Connections:**
- [ ] ESP32 will be powered via USB (5V from computer or USB adapter)
- [ ] Sensors get 3.3V from ESP32
- [ ] Relay module gets 5V from ESP32
- [ ] Pump, fan, light powered by external 5V supply (not ESP32!)

**Ground Connections:**
- [ ] All GND pins connected together (common ground)
- [ ] ESP32 GND
- [ ] All sensor GNDs
- [ ] Relay module GND
- [ ] External power supply GND

**Signal Connections:**
- [ ] DHT22 → GPIO 4
- [ ] Soil Moisture → GPIO 34
- [ ] BH1750 SDA → GPIO 21
- [ ] BH1750 SCL → GPIO 22
- [ ] Relay IN1 → GPIO 25
- [ ] Relay IN2 → GPIO 26
- [ ] Relay IN3 → GPIO 27

**No Short Circuits:**
- [ ] No bare wires touching
- [ ] Positive and negative don't touch
- [ ] Check with multimeter if available

**✓ Checkpoint:** All connections verified. Ready for programming.

---

## Part 3: Programming ESP32

### Step 1: Install Arduino IDE

**Time:** 10 minutes

1. **Download Arduino IDE**
   - Go to https://www.arduino.cc/en/software
   - Download for your operating system (Windows/Mac/Linux)
   - Install the application

2. **Add ESP32 Board Support**
   - Open Arduino IDE
   - Go to **File** → **Preferences**
   - In "Additional Board Manager URLs", paste:
     \`\`\`
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     \`\`\`
   - Click **OK**

3. **Install ESP32 Boards**
   - Go to **Tools** → **Board** → **Boards Manager**
   - Search for "esp32"
   - Click **Install** on "esp32 by Espressif Systems"
   - Wait for installation (2-5 minutes)

4. **Select ESP32 Board**
   - Go to **Tools** → **Board** → **ESP32 Arduino**
   - Select **ESP32 Dev Module** (or your specific board)

**✓ Checkpoint:** ESP32 board appears in Tools → Board menu.

---

### Step 2: Install Required Libraries

**Time:** 5 minutes

1. **Open Library Manager**
   - Go to **Sketch** → **Include Library** → **Manage Libraries**

2. **Install These Libraries:**
   
   Search and install each one:
   - **DHT sensor library** by Adafruit
   - **Adafruit Unified Sensor** (dependency for DHT)
   - **BH1750** by Christopher Laws
   - **ArduinoJson** by Benoit Blanchon (version 6.x)
   - **WiFi** (should be pre-installed with ESP32)
   - **HTTPClient** (should be pre-installed with ESP32)

3. **Verify Installation**
   - Go to **Sketch** → **Include Library**
   - You should see all libraries listed

**✓ Checkpoint:** All 4 libraries installed and visible.

---

### Step 3: Get the ESP32 Code

**Time:** 5 minutes

1. **Access Your GitHub Repo**
   - Go to https://github.com/YOUR_USERNAME/v0-smart-plant-system
   - Navigate to `scripts/esp32_example.ino`

2. **Copy the Code**
   - Click on `esp32_example.ino`
   - Click **Raw** button (top-right)
   - Select all (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

3. **Create New Arduino Sketch**
   - In Arduino IDE: **File** → **New**
   - Delete any default code
   - Paste the copied code
   - **File** → **Save As** → Name it "smart_plant_esp32"

**✓ Checkpoint:** Code loaded in Arduino IDE, no red error lines.

---

### Step 4: Configure Your Settings

**Time:** 10 minutes

You need to update these lines in the code with YOUR information:

**Find and Update:**

\`\`\`cpp
// ===== CONFIGURATION - UPDATE THESE =====
const char* ssid = "YOUR_WIFI_SSID";           // Replace with your school WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with WiFi password
const char* serverUrl = "https://your-app.vercel.app"; // Replace with your Vercel URL
const char* deviceId = "ESP32_001";            // Unique ID for this device
\`\`\`

**Example (with your actual info):**
\`\`\`cpp
const char* ssid = "SchoolWiFi";
const char* password = "password123";
const char* serverUrl = "https://smart-plant-abc123.vercel.app";
const char* deviceId = "ESP32_CLASSROOM_01";
\`\`\`

**Important Notes:**
- `deviceId` must be unique for each ESP32 device you build
- Use the EXACT URL from your Vercel deployment (no trailing slash)
- WiFi credentials are case-sensitive
- For school WiFi, you may need to ask IT for access

**✓ Checkpoint:** All 4 configuration values updated with your info.

---

### Step 5: Upload Code to ESP32

**Time:** 10 minutes

1. **Connect ESP32 to Computer**
   - Use USB cable to connect ESP32 to computer
   - ESP32 should power on (LED may light up)

2. **Select COM Port**
   - Go to **Tools** → **Port**
   - Select the port that appears when ESP32 is connected
     - Windows: Usually COM3, COM4, etc.
     - Mac: Usually /dev/cu.usbserial-XXXX
     - Linux: Usually /dev/ttyUSB0
   - If no port appears, you may need CP2102 or CH340 USB drivers

3. **Verify Code**
   - Click **Verify** button (✓ checkmark icon)
   - Wait for compilation
   - Should see "Done compiling" at bottom

4. **Upload to ESP32**
   - Click **Upload** button (→ arrow icon)
   - You'll see:
     - "Connecting........"
     - Progress bar
     - "Hard resetting via RTS pin..."
     - "Done uploading"

5. **Troubleshooting Upload Issues:**
   - If stuck on "Connecting........":
     - Hold **BOOT** button on ESP32
     - Click Upload again
     - Release BOOT when upload starts
   - If "Port not available":
     - Unplug and replug USB cable
     - Check USB cable (try different one)
     - Install USB drivers for your ESP32 chip

**✓ Checkpoint:** See "Done uploading" message, no errors.

---

### Step 6: Test ESP32 Connection

**Time:** 5 minutes

1. **Open Serial Monitor**
   - Click **Serial Monitor** icon (magnifying glass, top-right)
   - Set baud rate to **115200** (bottom-right dropdown)

2. **Watch the Output**
   You should see messages like:
   \`\`\`
   Connecting to WiFi...
   Connected! IP: 192.168.1.123
   Reading sensors...
   Temperature: 23.5°C
   Humidity: 55.2%
   Soil Moisture: 45%
   Light: 542 lux
   Sending data to server...
   Data sent successfully!
   Next update in 30 seconds...
   \`\`\`

3. **Check for Errors**
   - If "WiFi connection failed": Check SSID/password
   - If "Sensor read error": Check sensor wiring
   - If "Server error 401": Device not registered in app yet
   - If "Server error 404": Check serverUrl is correct

**✓ Checkpoint:** Serial Monitor shows successful WiFi connection and sensor readings.

---

## Part 4: Connecting Everything

### Step 1: Register Device in App

**Time:** 5 minutes

1. **Open Your Web App**
   - Go to your Vercel app URL
   - Click **Settings** (in navigation or bottom-left)

2. **Add New Plant**
   - Click **Add New Plant** button
   - Fill in the form:
     - **Plant Name:** e.g., "My Monstera"
     - **Species:** e.g., "Monstera Deliciosa"
     - **Device ID:** Enter EXACT same ID from ESP32 code (e.g., "ESP32_001")
   - Click **Add Plant**

3. **Verify Device Added**
   - You should see your plant in the list
   - Status will show "Offline" until ESP32 sends data

**✓ Checkpoint:** Plant registered with matching device ID.

---

### Step 2: Power On and Test

**Time:** 10 minutes

1. **Power On System**
   - Connect ESP32 to power (USB)
   - Connect pump/fan/light to external 5V supply
   - Wait 10-15 seconds for WiFi connection

2. **Check Serial Monitor**
   - Open Arduino Serial Monitor
   - Should see: "Data sent successfully!"
   - No more 401 errors (device now registered)

3. **Refresh Web App**
   - Go back to dashboard
   - Refresh page
   - Your plant should now show:
     - Status: "Healthy" or "Needs Attention"
     - Real sensor readings from ESP32
     - Last updated time (just now)

4. **Wait 30 Seconds**
   - ESP32 sends data every 30 seconds
   - Watch dashboard auto-update with new readings

**✓ Checkpoint:** Dashboard shows live data from your ESP32.

---

### Step 3: Test Manual Controls

**Time:** 5 minutes

1. **Open Plant Detail Page**
   - Click on your plant card from dashboard
   - Scroll to **Control Panel** section

2. **Test Water Pump**
   - Toggle **Water Pump** switch to ON
   - You should hear relay click
   - Water pump should start running
   - Toggle OFF to stop
   - Check Serial Monitor: "Control state updated"

3. **Test Fan**
   - Toggle **Fan** switch to ON
   - Relay clicks, fan spins
   - Toggle OFF to stop

4. **Test Grow Light**
   - Toggle **Grow Light** to ON
   - Light should turn on
   - Toggle OFF

**Important Notes:**
- ESP32 checks for control updates every 30 seconds
- If nothing happens, wait up to 30 seconds
- Check Serial Monitor for "Pump: ON" messages

**✓ Checkpoint:** All three controls work from web app.

---

### Step 4: Test AI Predictions

**Time:** 3 minutes

1. **Trigger AI Analysis**
   - On plant detail page, find **AI Predictions** section
   - Click **Run New Analysis** button
   - Wait 5-10 seconds

2. **View Results**
   - You should see:
     - Overall health assessment
     - 3-5 specific recommendations
     - Confidence scores (%)
     - Color-coded priority (green/yellow/red)

3. **Example Predictions:**
   - "Soil moisture is low (25%) - water soon"
   - "Temperature is optimal for growth"
   - "Light levels could be increased for better growth"

**✓ Checkpoint:** AI predictions appear with recommendations.

---

### Step 5: Test Notifications

**Time:** 5 minutes

1. **Trigger Low Moisture Alert**
   - Remove soil moisture sensor from soil (or cover it)
   - Wait 2-3 minutes for reading to drop
   - ESP32 will send low moisture value
   - Notification system checks every 15 minutes

2. **Check Notifications**
   - Click bell icon (top-right)
   - You should see alert: "Low soil moisture detected"
   - Click notification to mark as read

3. **Reset Sensor**
   - Put moisture sensor back in soil
   - Wait for readings to normalize

**Note:** Automatic alerts run every 15 minutes via Vercel Cron. For instant testing, you may need to manually trigger via SQL:

\`\`\`sql
INSERT INTO notifications (plant_id, type, message, priority)
VALUES (
  'your-plant-id',
  'alert',
  'Test: Low moisture detected',
  'high'
);
\`\`\`

**✓ Checkpoint:** Notification system working and alerts appear.

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: ESP32 Won't Connect to WiFi

**Symptoms:**
- Serial Monitor shows "Connecting..." forever
- No IP address displayed

**Solutions:**
1. Check WiFi credentials (SSID and password) are correct
2. Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
3. Check WiFi signal strength (move closer to router)
4. For school WiFi:
   - Ask IT if MAC address needs to be registered
   - Check if there's a captive portal (login page)
   - May need to use guest network instead

---

#### Issue: Sensors Return Wrong Values

**DHT22 Shows NaN or Extremely High Values:**
- Check wiring (VCC, GND, Data)
- Ensure 3.3V power, not 5V
- Wait 2 seconds after power on for sensor to stabilize
- Try adding 10kΩ pull-up resistor between Data and VCC

**Soil Moisture Always 0% or 100%:**
- Check sensor isn't touching metal
- Ensure sensor prongs are clean (no corrosion)
- Calibrate thresholds in code (dry vs. wet values)
- Try different GPIO pin (must be ADC-capable)

**BH1750 Returns 0 or Doesn't Respond:**
- Check I2C wiring (SDA to GPIO 21, SCL to GPIO 22)
- Verify power (3.3V)
- Try different I2C address (0x23 or 0x5C)
- Add pull-up resistors on SDA/SCL if needed (4.7kΩ)

---

#### Issue: Controls Don't Work

**Symptoms:**
- Toggle switches in app don't control devices
- Relays don't click

**Solutions:**
1. Check Serial Monitor for "Control state updated" messages
2. Ensure ESP32 is polling controls (every 30 seconds)
3. Verify relay connections:
   - IN1/IN2/IN3 to correct GPIO pins
   - VCC to 5V, GND to GND
4. Check relay is active LOW or active HIGH:
   - Most relays trigger with LOW signal
   - If backwards, change in code: `digitalWrite(RELAY_PIN, !state)`
5. Verify devices are powered by external supply (not ESP32)
6. Check device polarity (+ and - correct)

---

#### Issue: App Shows "Offline" or Old Data

**Symptoms:**
- Dashboard shows plant as offline
- Last updated time is old

**Solutions:**
1. Check ESP32 is powered on and running
2. Open Serial Monitor to verify code is running
3. Check serverUrl in code matches deployed app URL
4. Verify device ID in app matches code exactly
5. Check Supabase tables:
   - Go to Supabase → Table Editor
   - Open `sensor_readings` table
   - Check if new rows are being added
6. Check for API errors in Serial Monitor (401, 404, 500)

---

#### Issue: Database Errors or Missing Tables

**Symptoms:**
- App shows "Failed to fetch plants"
- Console errors about missing tables

**Solutions:**
1. Go to Supabase SQL Editor
2. Run this query to check tables exist:
   \`\`\`sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   \`\`\`
3. If tables missing, re-run `001_create_tables.sql`
4. Check Row Level Security (RLS) policies:
   - May need to disable RLS for testing
   - Or ensure policies allow anonymous access

---

#### Issue: AI Predictions Fail

**Symptoms:**
- "Run New Analysis" button does nothing
- Error message appears

**Solutions:**
1. Check Vercel environment variables include AI SDK keys
2. Open browser DevTools (F12) → Console tab
3. Look for error messages
4. Verify sensor data exists (need 24 hours for best results)
5. Check Supabase `ai_predictions` table for errors
6. Fallback system should still provide basic recommendations

---

#### Issue: Notifications Don't Appear

**Symptoms:**
- No alerts despite low moisture/extreme temps
- Bell icon shows 0 notifications

**Solutions:**
1. Check Vercel Cron is configured (see vercel.json)
2. Verify cron endpoint works:
   - Visit: `https://your-app.vercel.app/api/cron/check-alerts`
   - Should return: `{"success": true}`
3. Check notification thresholds in `lib/notifications/trigger-alerts.ts`
4. Manually test by inserting notification via SQL:
   \`\`\`sql
   INSERT INTO notifications (plant_id, type, message, priority)
   VALUES ('your-plant-id', 'alert', 'Test alert', 'high');
   \`\`\`
5. Refresh app and check bell icon

---

### Getting Help

If you're still stuck after trying these solutions:

1. **Check Documentation**
   - Read `ESP32_API_GUIDE.md` for API details
   - Read `NOTIFICATIONS_GUIDE.md` for notification setup

2. **Check Logs**
   - Serial Monitor (ESP32 side)
   - Browser DevTools Console (app side)
   - Vercel deployment logs (vercel.com dashboard)

3. **Contact Support**
   - GitHub Issues: Create issue in your repo
   - Vercel Support: vercel.com/help
   - Supabase Support: supabase.com/support

---

## Appendix

### A. Pin Reference Chart

\`\`\`
ESP32 Pin    | Function      | Connected To
─────────────────────────────────────────────
GPIO 4       | Digital       | DHT22 Data
GPIO 21      | I2C SDA       | BH1750 SDA
GPIO 22      | I2C SCL       | BH1750 SCL
GPIO 25      | Digital Out   | Relay 1 (Pump)
GPIO 26      | Digital Out   | Relay 2 (Fan)
GPIO 27      | Digital Out   | Relay 3 (Light)
GPIO 34      | ADC           | Soil Moisture
3.3V         | Power Out     | DHT22, BH1750
5V           | Power Out     | Soil Sensor, Relays
GND          | Ground        | All Grounds
\`\`\`

---

### B. Shopping Links

**Note:** These are example links. Shop around for best prices.

**ESP32 Boards:**
- Amazon: Search "ESP32 Development Board"
- AliExpress: Search "NodeMCU-32S"

**Sensors:**
- DHT22: Amazon "DHT22 Temperature Humidity Sensor"
- Soil Moisture: "Capacitive Soil Moisture Sensor v1.2"
- BH1750: "BH1750 Light Sensor Module I2C"

**Relays & Actuators:**
- Relay Module: "3 Channel 5V Relay Module"
- Water Pump: "5V Submersible Water Pump Mini"
- Fan: "5V DC Fan 40mm"
- Grow Light: "5V LED Grow Light Strip"

**Power:**
- 5V Power Supply: "5V 2A Power Adapter"
- USB Cable: "Micro USB Cable" (for ESP32 programming)

---

### C. Recommended Plant Care Thresholds

These are the default thresholds used by the system:

| Parameter          | Optimal Range  | Alert Triggers      |
|--------------------|----------------|---------------------|
| Temperature        | 18-28°C        | <15°C or >32°C      |
| Humidity           | 40-70%         | <30% or >80%        |
| Soil Moisture      | 40-70%         | <30%                |
| Light              | 200-800 lux    | <100 lux            |

**Adjust for Your Plants:**
- Succulents: Lower moisture (20-40%)
- Tropical plants: Higher humidity (60-80%)
- Shade plants: Lower light (100-300 lux)

Edit thresholds in `lib/notifications/trigger-alerts.ts`

---

### D. Maintenance Schedule

**Daily:**
- Check dashboard for alerts
- Verify water reservoir has water
- Observe plant physical health

**Weekly:**
- Clean sensor probes (especially soil moisture)
- Check all connections are secure
- Refill water reservoir

**Monthly:**
- Review historical data and trends
- Calibrate sensors if readings drift
- Update plant care goals in AI settings
- Check for software updates

**As Needed:**
- Replace water in reservoir (prevent algae)
- Clean grow light (dust reduces output)
- Adjust sensor positions as plant grows

---

### E. Advanced Features to Add

Once your system is running, consider these enhancements:

**Hardware:**
- Add pH sensor for water quality
- Add water level sensor for reservoir
- Add camera for visual monitoring
- Add second ESP32 for more plants

**Software:**
- Email notifications (using Resend or SendGrid)
- Custom automation rules (if X then Y)
- Historical data export to CSV
- Plant growth tracking with photos
- Multi-user access with authentication

**AI Improvements:**
- Train custom ML model on your plant data
- Image recognition for pest/disease detection
- Predictive watering schedules
- Seasonal adjustment recommendations

---

### F. Safety and Best Practices

**Electrical Safety:**
- Use only low voltage DC power (5V-12V)
- Keep water away from electronics
- Use waterproof enclosures near plants
- Never touch exposed wires when powered

**Plant Safety:**
- Don't over-water based on sensor data alone
- Monitor for sensor failures (stuck readings)
- Have manual override/disconnect for pump
- Ensure good drainage to prevent root rot

**Device Security:**
- Change default WiFi passwords
- Don't expose serverUrl in public code
- Use HTTPS for all API calls
- Keep firmware updated
- Consider API keys for ESP32 authentication

---

## Congratulations!

You now have a fully functional autonomous smart plant-growing system!

**What You've Accomplished:**
✓ Web dashboard with real-time monitoring
✓ ESP32 hardware collecting sensor data
✓ Remote control of watering, ventilation, and lighting
✓ AI-powered plant care recommendations
✓ Automatic alerts for plant needs

**Next Steps:**
- Monitor your plant's growth over time
- Experiment with automation rules
- Share your project with others
- Scale to multiple plants/devices
- Contribute improvements back to the codebase

**Happy Growing! 🌱**

---

*Document Version: 1.0*  
*Last Updated: November 2024*  
*Created by: v0 for Smart Plant Growing System*
