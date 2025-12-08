This is the final, comprehensive architecture document. Create a file named PHASE1_HYBRID_ARCHITECTURE.md and paste this content into your project root. This document now contains all the instructions your Agent needs to set up the data persistence for your MESA project.🛠️ PHASE 1: HYBRID DATA PERSISTENCE ARCHITECTUREProject: Smart Garden System (NEDC MESA Competition)Architecture Goal: Implement a robust "Store and Forward" system for sensor data, guaranteeing data integrity via simultaneous local (SD Card) and cloud (Supabase) logging.Agent Persona: Full-Stack Architect / Embedded Systems Developer1. ☁️ CLOUD ARCHITECTURE SETUP (Supabase)The Agent must first generate the database structure and client connection files.Action 1.1: Generate SQL SchemaCreate a file named supabase_schema.sql.The SQL must contain the following tables with appropriate UUID Primary Keys, FOREIGN KEY constraints, and Row-Level Security (RLS) policies enabled to ensure users only see their own data.profiles: User data linked to Supabase Auth (auth.users).plants: User-defined plants, settings, and location.sensor_readings: The time-series data storage. Must include an index on plant_id and created_at for faster dashboard queries.plant_presets: Static data for the "popular plants" carousel.Action 1.2: Generate Code InterfacesCreate a file named types/database.ts.Export TypeScript interfaces that perfectly mirror the profiles, plants, sensor_readings, and plant_presets tables.Action 1.3: Generate Client HelperCreate a file named lib/supabaseClient.ts to manage the Supabase client initialization using environment variables (NEXT_PUBLIC_SUPABASE_URL, etc.).2. 💾 LOCAL ARCHITECTURE SETUP (ESP32 SD Card)The SD card requires a specific file structure and format for reliable synchronization.Action 2.1: Define Data FormatAll logged data must be written in CSV (Comma Separated Values) format to simplify parsing by both the ESP32 and the Next.js app (if needed).Action 2.2: Define Required FilesThe ESP32 firmware logic must manage two distinct files on the SD card:LIVE_LOG.csv: The permanent, complete backup. Every single reading is appended here immediately after collection. This file is never deleted, only appended.SYNC_QUEUE.csv: The temporary holding area for un-uploaded data. Used exclusively by the Sync Task (Section 3B).3. ⚙️ ESP32 FIRMWARE LOGIC (Pseudocode)The Agent must generate the C++ pseudocode for the ESP32 to demonstrate the core logic.A. The "Write-Both" Loop (Data Collection Task)This loop runs every $\approx 5$ minutes and prioritizes the local log.C++// FUNCTION: LogAndAttemptUpload()
READ_SENSORS();
FORMAT_TO_CSV(data, csv_line);

// 1. Permanent Backup (Always happens)
SD_APPEND("LIVE_LOG.csv", csv_line);

// 2. Cloud Attempt
IF (WiFi_IS_CONNECTED) THEN
    API_RESPONSE = SUPABASE_POST_DATA(data);

    IF (API_RESPONSE == SUCCESS) THEN
        // Success: Data is safe in the cloud.
        PRINT("Uploaded to Supabase.");
    ELSE // Failed due to API error or intermittent connection drop
        // Failure: Data is only on SD card, so queue it for later.
        SD_APPEND("SYNC_QUEUE.csv", csv_line);
    END IF
ELSE // WiFi is OFF
    // Always queue when completely offline
    SD_APPEND("SYNC_QUEUE.csv", csv_line);
END IF
B. The "Sync Task" (Background Task)This task runs only when Wi-Fi is connected and SYNC_QUEUE.csv is not empty.C++// FUNCTION: RunSyncQueue()
WHILE (WiFi_IS_CONNECTED AND SYNC_QUEUE_IS_NOT_EMPTY) DO
    READ_OLDEST_LINE(line_to_sync);
    
    // Attempt to push to Supabase
    API_RESPONSE = SUPABASE_POST_DATA(line_to_sync);
    
    IF (API_RESPONSE == SUCCESS) THEN
        // Data is now safe in the cloud. Remove the local copy.
        DELETE_OLDEST_LINE_FROM_QUEUE();
    ELSE
        // Cloud is reachable but refusing connection or busy. Break and retry later.
        BREAK_WHILE_LOOP();
    END IF
END WHILE
4. 🔑 AGENT TRIGGER COMMANDUse this final prompt to initiate the implementation:"Read the entire PHASE1_HYBRID_ARCHITECTURE.md file. Implement the architecture in three steps: Generate the supabase_schema.sql, generate the types/database.ts interfaces, and generate the C++ pseudocode for the ESP32 logic required for the 'Write-Both' Loop and the 'Sync Task'."