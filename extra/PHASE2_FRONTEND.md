💻 PHASE 2: NEXT.JS DASHBOARD & UI
Objective: Implement the frontend application using Next.js (App Router), leveraging Supabase for authentication and data retrieval.

Agent Persona: Next.js / TypeScript / UI Developer

1. 🔑 User Authentication & Route Protection
The entire application should be protected so only logged-in users can access the dashboard.

Action 1.1: Authentication Pages

Create a public route group at /auth containing the following pages:

/auth/login: Simple form for email/password login.

/auth/signup: Simple form for email/password registration.

/auth/callback: Route Handler to process the email confirmation link from Supabase.

Action 1.2: Server-Side Auth Helper

Implement the recommended Supabase server-side logic using the @supabase/ssr package (as indicated by the documentation).

Create a middleware.ts file in the project root to act as a Gatekeeper. If a user tries to access /dashboard without a valid session, redirect them to /auth/login.

Redirect logged-in users attempting to access /auth/* pages to /dashboard.

2. 🪴 Plant Registration & Presets (The "Carousel")
This is the user flow for adding a new device.

Action 2.1: Presets Fetching

Create a Server Component that fetches all rows from the plant_presets table defined in Phase 1. This data should be displayed in a horizontal carousel or card gallery.

Action 2.2: New Plant Form

Design a modal or separate page (/dashboard/add-plant) with a form.

The form must have fields for: Plant Name, Location, and a selector to choose a Preset from the carousel data.

Implement a Server Action to handle the form submission, writing the new plant entry to the plants table.

3. 🖥️ Dashboard Layout & Data Display
The main dashboard should provide an "at-a-glance" view, following IoT design best practices (bold numbers, clear hierarchy, see ).

Action 3.1: Main Dashboard Page (/dashboard)

The page must be a Server Component that fetches all plants belonging to the authenticated user from the plants table.

For each plant, display a Plant Overview Card.

Action 3.2: Plant Overview Card Component

For each plant, this card should display the most critical current data:

Plant Name and Species (Title).

Latest Sensor Reading (Fetched via a Server Component that gets the latest row from sensor_readings for that plant).

Key Health Status: Use color coding (Red/Yellow/Green) based on whether the current soil_moisture falls within the target_moisture set in the plants table.

4. 📊 Detailed Plant View & Charting
Users need to see trends over time to diagnose issues.

Action 4.1: Detailed Route

Create a dynamic route at /dashboard/[plant_id].

This page should fetch the last 48 hours of data from the sensor_readings table for the selected plant.

Action 4.2: Chart Component

Use a client-side chart library (e.g., Recharts or similar) to create Line Charts for the time-series data:

Chart 1: Soil Moisture over time.

Chart 2: Temperature & Humidity over time.

Chart 3: Light Lux over time.