# ESP32 API Integration Guide

This guide explains how to integrate your ESP32 devices with the PlantAI smart plant system using **MOSFET-based control**.

## Hardware Overview

This system uses **N-Channel MOSFETs** (like IRF520 or IRLZ44N) instead of relay modules for several advantages:
- **Faster switching** - No mechanical delay
- **Silent operation** - No clicking sound
- **More efficient** - Lower power consumption
- **PWM capable** - Can vary speed/brightness (future feature)
- **Smaller footprint** - Compact circuit design

---

## API Endpoints

### 1. Send Sensor Data

**Endpoint:** `POST /api/esp32/sensor-data`

**Description:** Send temperature, humidity, soil moisture, and light level readings from your ESP32.

**Request Body:**
\`\`\`json
{
  "device_id": "ESP32_001",
  "temperature": 24.5,
  "humidity": 65.2,
  "soil_moisture": 45.8,
  "light_level": 650.0
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Sensor data saved successfully"
}
\`\`\`

**Frequency:** Send data every 15-30 seconds for real-time monitoring.

---

### 2. Get Control States

**Endpoint:** `GET /api/esp32/controls?device_id=ESP32_001`

**Description:** Retrieve current control states (water pump, fan, grow light) for your device.

**Response:**
\`\`\`json
{
  "water_pump_on": false,
  "fan_on": true,
  "grow_light_on": false
}
\`\`\`

**Frequency:** Poll every 5 seconds to get updated control commands.

---

### 3. Heartbeat

**Endpoint:** `POST /api/esp32/heartbeat`

**Description:** Send periodic heartbeat to indicate device is online.

**Request Body:**
\`\`\`json
{
  "device_id": "ESP32_001"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "timestamp": "2024-01-20T10:30:00.000Z"
}
\`\`\`

**Frequency:** Send every 60 seconds to maintain device status.

---

## MOSFET Circuit Design

### Basic MOSFET Switching Circuit

For each device (pump, fan, light), use this circuit:

\`\`\`
                    +5V or +12V Power Supply
                            |
                            |
                        [Device +]
                            |
                        [Device -]
                            |
                            |--- [Flyback Diode Cathode (for motors)]
                            |
                    ┌───────┴───────┐
                    │   MOSFET      │
                    │   Drain (D)   │
                    │               │
  ESP32 GPIO ───────│   Gate (G)    │
  (GPIO 25/26/27)   │               │
                    │   Source (S)  │
                    └───────┬───────┘
                            |
          [Flyback Diode Anode]
                            |
                           GND
\`\`\`

### Component Selection

**N-Channel MOSFETs (choose one):**
- **IRF520** - Common, handles 9.2A, 100V, logic-level
- **IRLZ44N** - Better for 3.3V logic, 47A, 55V (recommended)
- **2N7000** - For low-power devices (<200mA), TO-92 package

**Flyback Diodes (for motors/pumps):**
- **1N4007** - Standard 1A rectifier diode
- **1N5819** - Schottky diode (faster switching)
- Only needed for inductive loads (pumps, fans) - not for LEDs

**Gate Resistors (optional but recommended):**
- 10kΩ pull-down resistor from Gate to GND
- Prevents floating gate during power-up

---

## Wiring Diagram

### Complete ESP32 MOSFET Circuit

\`\`\`
ESP32 Pinout:
┌─────────────────────┐
│                     │
│  GPIO 4  ────────── DHT22 Data
│  GPIO 21 ────────── BH1750 SDA
│  GPIO 22 ────────── BH1750 SCL
│  GPIO 25 ────────── Water Pump MOSFET Gate
│  GPIO 26 ────────── Fan MOSFET Gate
│  GPIO 27 ────────── Grow Light MOSFET Gate
│  GPIO 34 ────────── Soil Moisture Analog Out
│  3.3V    ────────── Sensor power
│  5V      ────────── Soil moisture VCC
│  GND     ────────── Common Ground
│                     │
└─────────────────────┘
\`\`\`

### Water Pump MOSFET Circuit

\`\`\`
+5V Power ──┬──→ [Pump +]
            │
            └──→ [Pump -] ──┬──→ [Drain] MOSFET
                            │
            ESP32 GPIO 25 ──→ [Gate]  MOSFET
                            │
            GND ────────────→ [Source] MOSFET
            
Flyback Diode: Cathode to Pump+, Anode to Pump-
\`\`\`

Repeat same circuit for Fan (GPIO 26) and Grow Light (GPIO 27).

---

## Required Libraries

Install these libraries in your Arduino IDE:

1. **WiFi** (built-in with ESP32)
2. **HTTPClient** (built-in with ESP32)
3. **ArduinoJson** by Benoit Blanchon (v6.x)
4. **DHT sensor library** by Adafruit
5. **Adafruit Unified Sensor** (dependency)
6. **BH1750** by Christopher Laws

**Installation:**
- Open Arduino IDE
- Go to **Sketch → Include Library → Manage Libraries**
- Search and install each library

---

## Setup Steps

### 1. Hardware Assembly

**Sensor Connections:**
| Sensor | Pin | ESP32 GPIO |
|--------|-----|------------|
| DHT22 Data | Signal | GPIO 4 |
| DHT22 VCC | Power | 3.3V |
| DHT22 GND | Ground | GND |
| Soil Moisture AOUT | Analog | GPIO 34 |
| Soil Moisture VCC | Power | 5V |
| Soil Moisture GND | Ground | GND |
| BH1750 SDA | I2C Data | GPIO 21 |
| BH1750 SCL | I2C Clock | GPIO 22 |
| BH1750 VCC | Power | 3.3V |
| BH1750 GND | Ground | GND |

**MOSFET Control Connections:**
| Device | MOSFET Gate | ESP32 GPIO |
|--------|-------------|------------|
| Water Pump | Gate Pin | GPIO 25 |
| Fan | Gate Pin | GPIO 26 |
| Grow Light | Gate Pin | GPIO 27 |

**MOSFET Power Connections (for each MOSFET):**
- **Gate** → ESP32 GPIO (with optional 220Ω resistor in series)
- **Source** → Common GND
- **Drain** → Device negative terminal (-)
- **Device positive (+)** → External power supply (+5V or +12V)
- **10kΩ resistor** from Gate to GND (pull-down)

**Important Notes:**
- All GND connections must be common (ESP32, sensors, power supply, MOSFETs)
- Use separate power supply for high-current devices (pump, fan)
- Don't power motors from ESP32 pins - use external supply
- Add flyback diodes for motors/pumps (prevents voltage spikes)

---

### 2. Configure Code

Open `scripts/esp32_example.ino` and update these lines:

\`\`\`cpp
const char* ssid = "YOUR_WIFI_SSID";           // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password
const char* apiUrl = "https://your-app.vercel.app/api/esp32"; // Your Vercel URL
const char* deviceId = "ESP32_001";            // Unique device ID
\`\`\`

**WiFi Tips:**
- Use 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- For school WiFi, ask IT if MAC filtering is enabled
- Test WiFi credentials on phone first

---

### 3. Upload to ESP32

1. Connect ESP32 via USB
2. Select board: **Tools → Board → ESP32 Dev Module**
3. Select port: **Tools → Port → (your COM port)**
4. Click **Upload** (→ button)
5. Open **Serial Monitor** (set to 115200 baud)

**Expected Serial Output:**
\`\`\`
=== ESP32 Smart Plant System Starting ===
✓ BH1750 light sensor initialized
Connecting to WiFi...
✓ Connected to WiFi!
IP Address: 192.168.1.100
Signal Strength: -45 dBm
=== Setup Complete ===

--- Reading Sensors ---
Temperature: 23.5°C
Humidity: 58.2%
Soil Moisture: 42.3%
Light Level: 542.0 lux
✓ Sensor data sent successfully

--- Control States Updated ---
💧 Water Pump: OFF
💨 Fan: ON
💡 Grow Light: OFF
\`\`\`

---

### 4. Register Device in App

1. Open your web app
2. Go to **Settings** page
3. Click **Add New Plant**
4. Enter:
   - Plant name (e.g., "My Monstera")
   - Species (e.g., "Monstera Deliciosa")
   - Device ID (must match ESP32 code, e.g., "ESP32_001")
5. Click **Add Plant**

---

### 5. Test Controls

1. Go to plant detail page
2. Toggle **Water Pump** switch
3. Check Serial Monitor - should see:
   \`\`\`
   --- Control States Updated ---
   💧 Water Pump: ON
   \`\`\`
4. Physical pump should start running
5. Toggle off to stop

---

## Sensor Calibration

### Soil Moisture Sensor

The raw ADC values need calibration for your specific sensor:

\`\`\`cpp
// In esp32_example.ino, adjust these values:
float soilMoisture = map(soilMoistureRaw, 4095, 1500, 0, 100);
//                                        ^^^^  ^^^^
//                                        dry   wet
\`\`\`

**How to calibrate:**
1. Remove sensor from soil (in air) → note raw value (e.g., 4095)
2. Submerge sensor in water → note raw value (e.g., 1500)
3. Update map() function with your values
4. Re-upload code

**Typical Values:**
- **Dry soil/air:** 3500-4095
- **Moist soil:** 2000-3000
- **Very wet/water:** 1000-1500

---

### Light Sensor (BH1750)

BH1750 returns values in lux (no calibration needed):
- **0-100 lux** - Dark room
- **100-500 lux** - Dim indoor lighting
- **500-1000 lux** - Normal room lighting
- **1000-10,000 lux** - Bright indoor / indirect sunlight
- **10,000+ lux** - Direct sunlight

---

## MOSFET Troubleshooting

### Device Doesn't Turn On

**Check:**
- MOSFET type - must be N-Channel logic-level (3.3V compatible)
- Gate voltage - measure with multimeter when GPIO is HIGH (should be 3.3V)
- Drain-Source path - MOSFET could be backwards
- External power - verify device has proper voltage (5V or 12V)
- Common ground - ESP32 GND and power supply GND must connect

**Fix:**
- Try known-good MOSFET (IRLZ44N recommended)
- Check pinout - Gate/Drain/Source order varies by package
- Measure continuity when MOSFET should be ON

---

### Device Stays On

**Check:**
- GPIO pin defaulting HIGH - verify `pinMode(pin, OUTPUT)` and `digitalWrite(pin, LOW)` in setup()
- Gate pull-down resistor - add 10kΩ from Gate to GND
- Software bug - check control state logic

---

### Device Turns On/Off Randomly

**Check:**
- Floating gate - add 10kΩ pull-down resistor
- WiFi instability - check signal strength
- Code timing issues - verify control check interval

---

### MOSFET Gets Hot

**Normal:** MOSFETs can get warm under load
**Too Hot to Touch:** Problem!

**Check:**
- MOSFET rating - must handle device current with margin
  - 5V pump drawing 500mA → use MOSFET rated for ≥2A
- Gate fully open - verify 3.3V on gate when ON
- Heat sink - add small heatsink for high-current devices
- Upgrade MOSFET - use lower RDS(on) MOSFET (e.g., IRLZ44N)

---

## Power Supply Guidelines

**ESP32:**
- Power via USB (5V) for development
- For permanent install, use 5V/1A USB adapter

**Sensors:**
- DHT22, BH1750: 3.3V from ESP32 (low current)
- Soil moisture: 5V from ESP32 (typically <10mA)

**Devices (Pumps, Fans, Lights):**
- **DO NOT** power from ESP32 pins
- Use external power supply:
  - 5V 2A adapter for 5V devices
  - 12V 2A adapter for 12V devices
- Calculate total current: Pump (500mA) + Fan (200mA) + Light (1A) = 1.7A minimum

**Wiring:**
\`\`\`
External Power Supply (+5V)
     |
     ├──→ Pump positive (+)
     ├──→ Fan positive (+)
     ├──→ Light positive (+)
     
     GND ──→ Common ground (ESP32 + devices)
\`\`\`

---

## Advanced: PWM Speed/Brightness Control

MOSFETs support PWM (Pulse Width Modulation) for variable speed/brightness.

**Example code for dimming grow light:**

\`\`\`cpp
// In setup():
ledcSetup(0, 5000, 8);  // Channel 0, 5kHz, 8-bit resolution
ledcAttachPin(GROW_LIGHT_PIN, 0);

// In loop():
int brightness = 128;  // 0-255 (0=off, 255=full)
ledcWrite(0, brightness);  // Set PWM duty cycle
\`\`\`

This feature can be added in future updates for advanced control.

---

## Security Notes

- Current implementation uses public API endpoints (no authentication)
- For production, add API key header:
  \`\`\`cpp
  http.addHeader("X-API-Key", "your-secret-key");
  \`\`\`
- Always use HTTPS for API calls
- Don't commit WiFi credentials to Git
- Consider using ESP32 secure storage for credentials

---

## Next Steps

- Test all sensors and verify readings are accurate
- Calibrate soil moisture for your specific sensor
- Test all three control outputs (pump, fan, light)
- Set up watering schedule based on plant needs
- Monitor AI predictions for plant care tips
- Adjust notification thresholds in database

For more help, see:
- `docs/COMPLETE_SETUP_GUIDE.md` - Full hardware assembly guide
- `docs/QUICK_START.md` - 5-minute quick start
- Serial Monitor output for debugging
