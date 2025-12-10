/*
 * ESP32 Smart Plant System - Example Arduino Code
 * 
 * This example demonstrates how to connect your ESP32 to the PlantAI system.
 * Upload this code to your ESP32 device to start sending sensor data.
 * 
 * Hardware Requirements:
 * - ESP32 Development Board
 * - DHT22 Temperature/Humidity Sensor
 * - Soil Moisture Sensor (Capacitive)
 * - BH1750 Light Sensor
 * - N-Channel MOSFETs (3x - for pump, fan, light) - IRF520 or similar
 * - Flyback Diodes (3x - 1N4007 for motor protection)
 * 
 * Wiring:
 * - DHT22 Data Pin -> GPIO 4
 * - Soil Moisture Analog -> GPIO 34
 * - BH1750 SDA -> GPIO 21, SCL -> GPIO 22
 * - Water Pump MOSFET Gate -> GPIO 25
 * - Fan MOSFET Gate -> GPIO 26
 * - Grow Light MOSFET Gate -> GPIO 27
 * 
 * MOSFET Wiring (for each device):
 * - MOSFET Gate -> ESP32 GPIO pin
 * - MOSFET Source -> Ground (GND)
 * - MOSFET Drain -> Device negative (-)
 * - Device positive (+) -> Power supply (+5V/12V)
 * - Flyback diode across motor terminals (cathode to +, anode to -)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API Configuration
const char* apiUrl = "https://your-app.vercel.app/api/esp32";
const char* deviceId = "ESP32_001"; // Change this for each device

// Pin Definitions
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define SOIL_MOISTURE_PIN 34
#define WATER_PUMP_PIN 25     // MOSFET gate pin
#define FAN_PIN 26            // MOSFET gate pin
#define GROW_LIGHT_PIN 27     // MOSFET gate pin

// Sensor Objects
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;

// Timing
unsigned long lastSensorRead = 0;
unsigned long lastControlCheck = 0;
const unsigned long sensorInterval = 15000; // 15 seconds
const unsigned long controlInterval = 5000;  // 5 seconds

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32 Smart Plant System Starting ===");
  
  pinMode(WATER_PUMP_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(GROW_LIGHT_PIN, OUTPUT);
  
  digitalWrite(WATER_PUMP_PIN, LOW);
  digitalWrite(FAN_PIN, LOW);
  digitalWrite(GROW_LIGHT_PIN, LOW);
  
  // Initialize sensors
  dht.begin();
  Wire.begin();
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("✓ BH1750 light sensor initialized");
  } else {
    Serial.println("✗ BH1750 not found - check wiring");
  }
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ Connected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n✗ WiFi connection failed - check credentials");
  }
  
  Serial.println("=== Setup Complete ===\n");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Read and send sensor data
  if (currentMillis - lastSensorRead >= sensorInterval) {
    lastSensorRead = currentMillis;
    sendSensorData();
  }
  
  // Check and update control states
  if (currentMillis - lastControlCheck >= controlInterval) {
    lastControlCheck = currentMillis;
    checkControlStates();
  }
}

void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi not connected - cannot send data");
    return;
  }
  
  Serial.println("\n--- Reading Sensors ---");
  
  // Read sensors
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int soilMoistureRaw = analogRead(SOIL_MOISTURE_PIN);
  
  // Calibrate soil moisture (adjust these values for your sensor)
  // Typical: Air = 4095 (0%), Water = 1500 (100%)
  float soilMoisture = map(soilMoistureRaw, 4095, 1500, 0, 100);
  soilMoisture = constrain(soilMoisture, 0, 100);
  
  float lightLevel = lightMeter.readLightLevel();
  
  // Display readings
  Serial.print("Temperature: "); Serial.print(temperature); Serial.println("°C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println("%");
  Serial.print("Soil Moisture: "); Serial.print(soilMoisture); Serial.println("%");
  Serial.print("Light Level: "); Serial.print(lightLevel); Serial.println(" lux");
  
  // Check for sensor errors
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("✗ DHT22 read error - check wiring");
    return;
  }
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["device_id"] = deviceId;
  doc["temperature"] = round(temperature * 10) / 10.0;
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["soil_moisture"] = round(soilMoisture * 10) / 10.0;
  doc["light_level"] = round(lightLevel * 10) / 10.0;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request
  HTTPClient http;
  String url = String(apiUrl) + "/sensor-data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // 5 second timeout
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    if (httpResponseCode == 200) {
      Serial.println("✓ Sensor data sent successfully");
    } else {
      Serial.print("⚠ Server response: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    }
  } else {
    Serial.print("✗ HTTP Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
}

void checkControlStates() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  
  HTTPClient http;
  String url = String(apiUrl) + "/controls?device_id=" + String(deviceId);
  http.begin(url);
  http.setTimeout(3000);
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String payload = http.getString();
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error) {
      bool waterPump = doc["water_pump_on"];
      bool fan = doc["fan_on"];
      bool growLight = doc["grow_light_on"];
      
      digitalWrite(WATER_PUMP_PIN, waterPump ? HIGH : LOW);
      digitalWrite(FAN_PIN, fan ? HIGH : LOW);
      digitalWrite(GROW_LIGHT_PIN, growLight ? HIGH : LOW);
      
      // Log status changes
      static bool lastPumpState = false;
      static bool lastFanState = false;
      static bool lastLightState = false;
      
      if (waterPump != lastPumpState || fan != lastFanState || growLight != lastLightState) {
        Serial.println("\n--- Control States Updated ---");
        Serial.print("💧 Water Pump: "); Serial.println(waterPump ? "ON" : "OFF");
        Serial.print("💨 Fan: "); Serial.println(fan ? "ON" : "OFF");
        Serial.print("💡 Grow Light: "); Serial.println(growLight ? "ON" : "OFF");
        
        lastPumpState = waterPump;
        lastFanState = fan;
        lastLightState = growLight;
      }
    } else {
      Serial.print("✗ JSON parse error: ");
      Serial.println(error.c_str());
    }
  } else if (httpResponseCode == 404) {
    Serial.println("⚠ Device not registered - add plant in web app");
  }
  
  http.end();
}
