⚙️ PHASE 5: FIRMWARE FINALIZATION & SYSTEM INTEGRATIONObjective: Implement the final, production-ready, non-blocking C++ firmware for the ESP32 using the FreeRTOS multitasking environment (built into the ESP32 Arduino core) to ensure robust, simultaneous operation.Agent Persona: Embedded C++ Developer / FreeRTOS Specialist1. ⚙️ FreeRTOS Task Structure & SetupThe Agent must structure the code around three distinct tasks to ensure critical operations (like control) are not blocked by slow operations (like Wi-Fi).Task NameCorePriorityPurposeTask 1: Sensor & Control LoopCore 1High (2)Reads sensors, executes control actions (pump/LEDs), and collects the data packet.Task 2: Communications & SyncCore 0Low (1)Manages Wi-Fi connections, sends data to the Phase 3 API, and processes the SYNC_QUEUE.csv.Task 3: SD Card InterfaceCore 1Medium (1)A utility task for all file I/O operations, shared by all tasks (must use a Mutex).Action 1.1: Implement the setup() function to initialize Wi-Fi, SD card module, and create the three tasks using xTaskCreatePinnedToCore().Action 1.2: Implement a Mutex (SemaphoreHandle_t) to guard all SD card read/write functions, preventing simultaneous access from Tasks 1 and 2, which could corrupt the files.2. 🌳 Task 1: Sensor Reading & Control Loop (C++ Pseudocode)This task runs frequently and quickly on its own core.C++// Task 1: Sensor and Control Loop (Runs on Core 1)
void Sensor_Task(void *parameter) {
    for (;;) {
        // 5-Minute Timer (non-blocking using millis())
        IF (time_to_take_reading()) THEN
            // 2.1: Sensor Reading & Calibration
            READ_ANALOG(Moisture) -> CALIBRATE_TO_PERCENT();
            READ_I2C(Temp/Hum);
            READ_DIGITAL(WaterLevel);

            // 2.2: Control Logic (Immediate Action)
            IF (Moisture < Target_Moisture) THEN
                ACTIVATE_PUMP(5000); // 5 seconds of watering
            END IF

            // 2.3: Build Data Packet
            String csv_line = FORMAT_DATA_TO_CSV(...);

            // 2.4: Trigger Local Write (Uses Mutex)
            xSemaphoreTake(SD_MUTEX);
            SD_APPEND("LIVE_LOG.csv", csv_line);
            xSemaphoreGive(SD_MUTEX);

            // 2.5: Queue for Cloud Upload
            xQueueSend(COMM_QUEUE, csv_line); // Send to Task 2 for upload attempt
        END IF

        vTaskDelay(pdMS_to_ticks(5000)); // Sleep for 5 seconds
    }
}
3. 🌐 Task 2: Communications & Sync (C++ Pseudocode)This task handles all networking, which can be slow and blocking, and runs on the second core (Core 0).C++// Task 2: Communications and Sync (Runs on Core 0)
void Comm_Sync_Task(void *parameter) {
    for (;;) {
        // A. Primary Write-Through Attempt
        IF (xQueueReceive(COMM_QUEUE, &line_to_upload, 0) AND WiFi_IS_CONNECTED) THEN
            API_RESPONSE = HTTP_POST(PHASE3_API, line_to_upload, API_KEY_HEADER);

            IF (API_RESPONSE != SUCCESS_200_201) THEN
                // Failed to upload: Data is in LIVE_LOG, now queue for sync.
                xSemaphoreTake(SD_MUTEX);
                SD_APPEND("SYNC_QUEUE.csv", line_to_upload);
                xSemaphoreGive(SD_MUTEX);
            END IF
        END IF

        // B. Sync Task (Only attempt sync if primary queue is empty)
        IF (WiFi_IS_CONNECTED AND SYNC_QUEUE_IS_NOT_EMPTY) THEN
            // 3.1: Read one line from queue
            xSemaphoreTake(SD_MUTEX);
            String sync_line = SD_READ_OLDEST_LINE("SYNC_QUEUE.csv");
            xSemaphoreGive(SD_MUTEX);

            // 3.2: Attempt Upload
            API_RESPONSE = HTTP_POST(PHASE3_API, sync_line, API_KEY_HEADER);

            IF (API_RESPONSE == SUCCESS_200_201) THEN
                // Success: Remove line from queue
                xSemaphoreTake(SD_MUTEX);
                SD_REMOVE_OLDEST_LINE("SYNC_QUEUE.csv");
                xSemaphoreGive(SD_MUTEX);
            END IF
        END IF

        vTaskDelay(pdMS_to_ticks(1000)); // Sleep for 1 second
    }
}
