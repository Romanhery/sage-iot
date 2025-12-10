# Competition Demo Day Checklist

## Equipment to Bring

### Must Have
- [ ] ESP32 with all sensors attached
- [ ] Laptop/tablet charged (bring charger)
- [ ] Power supply for ESP32
- [ ] Extension cord
- [ ] Physical plant (if allowed)
- [ ] Printed architecture diagram
- [ ] Backup phone with dashboard bookmarked

### Nice to Have
- [ ] Poster board with system overview
- [ ] Physical wiring diagram
- [ ] Printed code snippets (interesting sections)
- [ ] Business cards with project URL
- [ ] Backup battery for ESP32

## Pre-Demo Setup (30 minutes before)

### Hardware
1. [ ] Power on ESP32
2. [ ] Verify WiFi connection (check serial monitor)
3. [ ] Test all sensors reading correctly
4. [ ] Manually trigger each control (pump, fan, light)
5. [ ] Confirm data appearing in dashboard

### Software
1. [ ] Open dashboard in browser
2. [ ] Confirm real-time updates working
3. [ ] Navigate to plant detail page
4. [ ] Load AI predictions
5. [ ] Open notifications page
6. [ ] Test control toggles respond

### Backup Plan
1. [ ] Record 2-minute video of system working
2. [ ] Have screenshots of all key features
3. [ ] Printed sensor data showing 24h history

## 3-Minute Demo Script

### 0:00-0:30 - Introduction
"Hi, I'm [Name]. This is my autonomous plant monitoring system that uses IoT sensors, cloud computing, and AI to optimize plant health."

**[Point to ESP32]**

### 0:30-1:00 - Hardware Overview
"The ESP32 reads four sensors: temperature, humidity, soil moisture, and light. Every 30 seconds, it sends this data to my cloud server via WiFi."

**[Point to each sensor]**
"DHT22 here, soil moisture sensor here, light sensor here."

### 1:00-1:30 - Dashboard Demo
**[Open dashboard on device]**

"This dashboard displays all plants with real-time readings. Watch this temperature value - it updates live."

**[Wait for update, circle it with finger]**

### 1:30-2:00 - Detail View
**[Navigate to plant detail]**

"Here's 24 hours of data history. See this temperature pattern? The afternoon peak triggered AI analysis."

**[Scroll to AI section]**

"The AI predicted soil would dry faster and recommended increasing watering frequency."

### 2:00-2:30 - Control Demo
"I can manually control devices or use automation. Let me turn on the water pump..."

**[Toggle pump]**

"You see it activate immediately. The MOSFET switches the 12V pump from the ESP32's 3.3V signal."

### 2:30-3:00 - Wrap Up
"This system enables proactive plant care, reduces water waste, and scales from homes to commercial greenhouses. Thank you!"

**[Smile, wait for questions]**

## Quick Answers to Common Questions

**"How much did it cost?"**
"About $85 in hardware. Software is free tier on Vercel and Supabase."

**"How accurate are the sensors?"**
"DHT22 is ±0.5°C and ±2% humidity. Soil moisture is calibrated per sensor to within ±5%."

**"What if WiFi drops?"**
"The ESP32 buffers data and has auto-reconnect. Critical control functions work offline."

**"Why these sensors?"**
"These four parameters are most critical for plant health - they affect photosynthesis, water uptake, and growth."

**"Can it handle multiple plants?"**
"Yes, it's designed to scale. Each ESP32 has a unique ID. Database supports unlimited plants."

## Troubleshooting During Demo

**ESP32 not connecting:**
- Check power LED is on
- Serial monitor shows WiFi connection
- Use phone hotspot as backup WiFi

**Dashboard not updating:**
- Refresh page
- Check ESP32 is sending (serial monitor)
- Show backup video instead

**Control not responding:**
- Check ESP32 is polling controls endpoint
- Manually flip relay to show it works
- Explain: "Network delay, normally <2 seconds"

**AI not loading:**
- Say: "AI analysis cached, normally runs every hour"
- Show previous predictions
- Explain algorithm manually

## Judge Interaction Tips

### Do:
✅ Make eye contact
✅ Speak clearly and confidently
✅ Use simple language first, then technical if asked
✅ Admit when you don't know something
✅ Ask judges if they have questions
✅ Show enthusiasm for your project

### Don't:
❌ Apologize for your project
❌ Say "it's not done yet"
❌ Use jargon without explaining
❌ Talk too fast
❌ Look at the floor
❌ Say "this is just a simple project"

## If Demo Completely Fails

**Stay calm and do this:**

1. "Let me show you the backup video of it working"
2. Walk through the architecture diagram on paper
3. Show code on laptop and explain key sections
4. Discuss the engineering challenges you solved
5. Explain what you learned from building it

**Remember:** Judges care about your process, learning, and problem-solving more than a perfect demo.

## After Your Demo

### Debrief
- What questions were you asked?
- What went well?
- What would you change?
- Did demo work as planned?

### Network
- Get judge contact info if offered
- Talk to other competitors
- Take photos of your setup
- Post on social media (tag the competition)

---

**You've prepared well. Trust your knowledge. Be yourself. Good luck!** 🚀
