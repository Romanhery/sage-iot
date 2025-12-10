/*
 * ESP32 Smart Plant System - Production FreeRTOS Firmware
 * NEDC MESA Competition - Phase 5 Implementation
 * 
 * Features:
 * - FreeRTOS multi-tasking on dual cores
 * - SD card logging with LIVE_LOG.csv backup
 * - Sync queue for offline data recovery
 * - Secure API communication with x-api-key
 * - Mutex-protected SD card access
 * 
 * Hardware Requirements:
 * - ESP32 Development Board
 * - DHT22 Temperature/Humidity Sensor
 * - Capacitive Soil Moisture Sensor
 * - BH1750 Light Sensor
 * - SD Card Module (SPI)
 * - Water Level Sensor
 * - N-Channel MOSFETs (3x for pump, fan, light)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>
#include <SD.h>
#include <SPI.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

// =====================================================
// CONFIGURATION - UPDATE THESE VALUES
// =====================================================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_BASE_URL = "https://your-app.vercel.app/api/esp32";
const char* API_KEY = "YOUR_ESP32_API_KEY"; // Must match ESP32_API_KEY in .env.local
const char* DEVICE_ID = "ESP32_001";

// =====================================================
// PIN DEFINITIONS
// =====================================================
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define SOIL_MOISTURE_PIN 34
#define WATER_LEVEL_PIN 35
#define WATER_PUMP_PIN 25
#define FAN_PIN 26
#define GROW_LIGHT_PIN 27
#define SD_CS_PIN 5

// =====================================================
// TIMING CONFIGURATION
// =====================================================
const unsigned long SENSOR_INTERVAL_MS = 5 * 60 * 1000;  // 5 minutes
const unsigned long CONTROL_CHECK_MS = 5 * 1000;         // 5 seconds
const unsigned long SYNC_INTERVAL_MS = 30 * 1000;        // 30 seconds

// =====================================================
// GLOBAL OBJECTS
// =====================================================
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;

// FreeRTOS handles
SemaphoreHandle_t sdMutex = NULL;
QueueHandle_t dataQueue = NULL;
TaskHandle_t sensorTaskHandle = NULL;
TaskHandle_t commTaskHandle = NULL;

// Data structure for sensor readings
struct SensorData {
  float temperature;
  float humidity;
  float soilMoisture;
  float lightLevel;
  float waterLevel;
  char timestamp[25];
};

// =====================================================
// SD CARD FUNCTIONS (Protected by Mutex)
// =====================================================
bool initSDCard() {
  if (!SD.begin(SD_CS_PIN)) {
    Serial.println("✗ SD Card initialization failed");
    return false;
  }
  Serial.println("✓ SD Card initialized");
  
  // Create files if they don't exist
  if (!SD.exists("/LIVE_LOG.csv")) {
    File file = SD.open("/LIVE_LOG.csv", FILE_WRITE);
    if (file) {
      file.println("timestamp,temperature,humidity,soil_moisture,light_level,water_level");
      file.close();
    }
  }
  if (!SD.exists("/SYNC_QUEUE.csv")) {
    File file = SD.open("/SYNC_QUEUE.csv", FILE_WRITE);
    if (file) {
      file.close();
    }
  }
  return true;
}

void appendToLog(const char* filename, const String& line) {
  if (xSemaphoreTake(sdMutex, pdMS_TO_TICKS(5000)) == pdTRUE) {
    File file = SD.open(filename, FILE_APPEND);
    if (file) {
      file.println(line);
      file.close();
    }
    xSemaphoreGive(sdMutex);
  }
}

String readFirstLine(const char* filename) {
  String line = "";
  if (xSemaphoreTake(sdMutex, pdMS_TO_TICKS(5000)) == pdTRUE) {
    File file = SD.open(filename, FILE_READ);
    if (file) {
      line = file.readStringUntil('\n');
      line.trim();
      file.close();
    }
    xSemaphoreGive(sdMutex);
  }
  return line;
}

void removeFirstLine(const char* filename) {
  if (xSemaphoreTake(sdMutex, pdMS_TO_TICKS(5000)) == pdTRUE) {
    File file = SD.open(filename, FILE_READ);
    if (file) {
      // Read all lines except first
      String remaining = "";
      bool firstSkipped = false;
      while (file.available()) {
        String line = file.readStringUntil('\n');
        if (firstSkipped) {
          remaining += line + "\n";
        }
        firstSkipped = true;
      }
      file.close();
      
      // Rewrite file without first line
      file = SD.open(filename, FILE_WRITE);
      if (file) {
        file.print(remaining);
        file.close();
      }
    }
    xSemaphoreGive(sdMutex);
  }
}

int countQueueLines() {
  int count = 0;
  if (xSemaphoreTake(sdMutex, pdMS_TO_TICKS(5000)) == pdTRUE) {
    File file = SD.open("/SYNC_QUEUE.csv", FILE_READ);
    if (file) {
      while (file.available()) {
        file.readStringUntil('\n');
        count++;
      }
      file.close();
    }
    xSemaphoreGive(sdMutex);
  }
  return count;
}

// =====================================================
// API FUNCTIONS
// =====================================================
bool postSensorData(SensorData& data) {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }
  
  HTTPClient http;
  String url = String(API_BASE_URL) + "/sensor-readings";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);
  http.setTimeout(10000);
  
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["temperature"] = round(data.temperature * 10) / 10.0;
  doc["humidity"] = round(data.humidity * 10) / 10.0;
  doc["soil_moisture"] = round(data.soilMoisture * 10) / 10.0;
  doc["light_level"] = round(data.lightLevel * 10) / 10.0;
  doc["water_level"] = round(data.waterLevel * 10) / 10.0;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpCode = http.POST(jsonString);
  http.end();
  
  return (httpCode == 200 || httpCode == 201);
}

bool checkControlStates() {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }
  
  HTTPClient http;
  String url = String(API_BASE_URL) + "/controls?device_id=" + String(DEVICE_ID);
  http.begin(url);
  http.addHeader("x-api-key", API_KEY);
  http.setTimeout(5000);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error) {
      digitalWrite(WATER_PUMP_PIN, doc["water_pump_on"] ? HIGH : LOW);
      digitalWrite(FAN_PIN, doc["fan_on"] ? HIGH : LOW);
      digitalWrite(GROW_LIGHT_PIN, doc["grow_light_on"] ? HIGH : LOW);
    }
    http.end();
    return true;
  }
  
  http.end();
  return false;
}

// =====================================================
// SENSOR FUNCTIONS
// =====================================================
SensorData readSensors() {
  SensorData data;
  
  // Read DHT22
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  
  // Read soil moisture (calibrate for your sensor)
  int rawMoisture = analogRead(SOIL_MOISTURE_PIN);
  data.soilMoisture = map(rawMoisture, 4095, 1500, 0, 100);
  data.soilMoisture = constrain(data.soilMoisture, 0, 100);
  
  // Read light level
  data.lightLevel = lightMeter.readLightLevel();
  
  // Read water level (calibrate for your sensor)
  int rawWaterLevel = analogRead(WATER_LEVEL_PIN);
  data.waterLevel = map(rawWaterLevel, 0, 4095, 0, 100);
  data.waterLevel = constrain(data.waterLevel, 0, 100);
  
  // Generate timestamp
  snprintf(data.timestamp, sizeof(data.timestamp), "%lu", millis());
  
  // Handle sensor errors
  if (isnan(data.temperature)) data.temperature = 0;
  if (isnan(data.humidity)) data.humidity = 0;
  
  return data;
}

String formatCSV(SensorData& data) {
  return String(data.timestamp) + "," + 
         String(data.temperature, 1) + "," +
         String(data.humidity, 1) + "," +
         String(data.soilMoisture, 1) + "," +
         String(data.lightLevel, 1) + "," +
         String(data.waterLevel, 1);
}

// =====================================================
// TASK 1: SENSOR & CONTROL LOOP (Core 1, Priority 2)
// =====================================================
void sensorTask(void* parameter) {
  unsigned long lastReading = 0;
  unsigned long lastControlCheck = 0;
  
  for (;;) {
    unsigned long now = millis();
    
    // Sensor reading every 5 minutes
    if (now - lastReading >= SENSOR_INTERVAL_MS || lastReading == 0) {
      lastReading = now;
      
      Serial.println("\n--- Sensor Reading ---");
      SensorData data = readSensors();
      
      Serial.printf("Temp: %.1f°C | Humidity: %.1f%% | Moisture: %.1f%% | Light: %.0f lux | Water: %.1f%%\n",
        data.temperature, data.humidity, data.soilMoisture, data.lightLevel, data.waterLevel);
      
      // Always write to permanent log first (backup)
      String csvLine = formatCSV(data);
      appendToLog("/LIVE_LOG.csv", csvLine);
      Serial.println("✓ Logged to LIVE_LOG.csv");
      
      // Queue for cloud upload
      if (xQueueSend(dataQueue, &data, pdMS_TO_TICKS(100)) != pdTRUE) {
        // Queue full, write directly to sync queue
        appendToLog("/SYNC_QUEUE.csv", csvLine);
        Serial.println("⚠ Queue full, added to SYNC_QUEUE.csv");
      }
    }
    
    // Control state check every 5 seconds
    if (now - lastControlCheck >= CONTROL_CHECK_MS) {
      lastControlCheck = now;
      checkControlStates();
    }
    
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

// =====================================================
// TASK 2: COMMUNICATIONS & SYNC (Core 0, Priority 1)
// =====================================================
void commTask(void* parameter) {
  for (;;) {
    // A. Primary upload from queue
    SensorData data;
    if (xQueueReceive(dataQueue, &data, pdMS_TO_TICKS(100)) == pdTRUE) {
      if (WiFi.status() == WL_CONNECTED) {
        if (postSensorData(data)) {
          Serial.println("✓ Data uploaded to cloud");
        } else {
          // Failed: add to sync queue
          String csvLine = formatCSV(data);
          appendToLog("/SYNC_QUEUE.csv", csvLine);
          Serial.println("⚠ Upload failed, queued for sync");
        }
      } else {
        // Offline: add to sync queue
        String csvLine = formatCSV(data);
        appendToLog("/SYNC_QUEUE.csv", csvLine);
        Serial.println("⚠ Offline, queued for sync");
      }
    }
    
    // B. Sync queue processing (only when online and queue has items)
    if (WiFi.status() == WL_CONNECTED && countQueueLines() > 0) {
      String line = readFirstLine("/SYNC_QUEUE.csv");
      if (line.length() > 0) {
        // Parse CSV line back to data
        SensorData syncData;
        sscanf(line.c_str(), "%[^,],%f,%f,%f,%f,%f",
          syncData.timestamp,
          &syncData.temperature,
          &syncData.humidity,
          &syncData.soilMoisture,
          &syncData.lightLevel,
          &syncData.waterLevel);
        
        if (postSensorData(syncData)) {
          removeFirstLine("/SYNC_QUEUE.csv");
          Serial.println("✓ Synced 1 reading from queue");
        }
      }
    }
    
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

// =====================================================
// SETUP
// =====================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32 Smart Plant System (FreeRTOS) ===\n");
  
  // Initialize pins
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
    Serial.println("✓ BH1750 light sensor ready");
  }
  
  // Initialize SD card
  initSDCard();
  
  // Create mutex for SD card access
  sdMutex = xSemaphoreCreateMutex();
  
  // Create queue for sensor data
  dataQueue = xQueueCreate(10, sizeof(SensorData));
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n✓ Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n⚠ WiFi not connected - will use offline mode");
  }
  
  // Create FreeRTOS tasks
  xTaskCreatePinnedToCore(
    sensorTask,           // Task function
    "SensorTask",         // Name
    8192,                 // Stack size
    NULL,                 // Parameters
    2,                    // Priority (higher = more important)
    &sensorTaskHandle,    // Task handle
    1                     // Core 1
  );
  
  xTaskCreatePinnedToCore(
    commTask,             // Task function
    "CommTask",           // Name
    8192,                 // Stack size
    NULL,                 // Parameters
    1,                    // Priority
    &commTaskHandle,      // Task handle
    0                     // Core 0
  );
  
  Serial.println("\n=== Tasks Started ===");
  Serial.printf("Sync queue has %d pending items\n", countQueueLines());
}

// =====================================================
// LOOP (Not used - FreeRTOS handles everything)
// =====================================================
void loop() {
  vTaskDelay(pdMS_TO_TICKS(10000));
}
