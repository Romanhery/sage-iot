🔗 PHASE 3: API BRIDGE (The Next.js Ingestion Endpoint)
Objective: Create a highly secure, dedicated endpoint for the ESP32 to POST sensor data and the Sync Task to utilize.

Agent Persona: Back-End Engineer / Next.js Route Handler Specialist

1. 🛡️ Security Setup (API Key)
The endpoint must reject any request that does not contain a valid, secret API key.

Action 1.1: Environment Variable

Define a secret environment variable named ESP32_API_KEY in your .env.local file. This is the key the ESP32 firmware will be hardcoding (or storing securely) and sending with every request.

Action 1.2: Key Validation Middleware

Create a simple utility function in lib/api-auth.ts to check the request headers.

This function must check for the presence and validity of the x-api-key header against process.env.ESP32_API_KEY. Requests without a valid key must be blocked immediately with an HTTP 401 Unauthorized response.

2. 🚀 The Route Handler (/api/sensor-data/route.ts)
This is the main endpoint for all data ingestion. It must accept only POST requests.

Action 2.1: Route Creation

Create the file at app/api/sensor-data/route.ts.

The file must export an async function POST(request: Request) using the Next.js App Router convention.

Action 2.2: Payload Validation

Define a TypeScript interface (e.g., SensorDataPayload) that strictly matches the expected JSON format sent by the ESP32 (e.g., plant_id, temperature, humidity, etc.).

Use a validation library (like Zod) to ensure the incoming JSON body conforms to the SensorDataPayload interface before interacting with the database.

3. 🎯 Data Ingestion Logic
The Agent must write the logic to safely insert the data into Supabase.

Action 3.1: Supabase Insertion

After the API key and payload are validated, use the Supabase client (from lib/supabaseClient.ts) to insert the validated data into the sensor_readings table.

Ensure the timestamp field (created_at) is handled correctly. If the ESP32 sends a timestamp, use it. Otherwise, let the Supabase database default to NOW().

Action 3.2: Error Handling

Success: Return a 201 Created or 200 OK response. The ESP32 relies on this for the Sync Task to know it can delete the line from SYNC_QUEUE.csv.

Failure: Log the error securely on the server and return a 500 Internal Server Error to the ESP32. This signal tells the ESP32 to keep the data in its queue.

4. 📝 ESP32 C++ Code Bridge Task
Finally, the Agent must draft a C++ pseudocode snippet showing how the ESP32 will use this secure API.

Action 4.1: C++ Pseudocode

Write a snippet that shows the ESP32 building an HTTP POST request, setting the x-api-key header with the secret key, and sending the JSON body to the new /api/sensor-data endpoint.