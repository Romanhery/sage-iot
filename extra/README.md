# 🌱 Smart Plant System

An autonomous IoT plant monitoring and care system with AI-powered predictions, real-time sensor data visualization, and automated control systems.

![Smart Plant System](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Powered-green?style=flat&logo=supabase)
![AI](https://img.shields.io/badge/AI-GPT--4o--mini-purple?style=flat&logo=openai)

## ✨ Features

### 📊 Real-Time Monitoring
- Live sensor data display (temperature, humidity, soil moisture, light levels)
- 24-hour historical charts with trend visualization
- Plant health status indicators with color-coded alerts

### 🤖 AI-Powered Care
- GPT-4o-mini analyzes sensor data and growth patterns
- Actionable care recommendations with confidence scores
- Fallback rule-based system for offline operation

### 🎛️ Device Control
- Remote control of water pump, fan, and grow lights
- Automatic control state synchronization with ESP32
- Manual override with instant state updates

### 🔔 Smart Notifications
- Automatic alerts for critical conditions (low moisture, extreme temps)
- Intelligent deduplication prevents notification spam
- Real-time notification center with read/unread tracking

### 🔧 Device Management
- Easy device pairing with unique device IDs
- Multiple plant monitoring from single dashboard
- Plant profiles with species, location, and planting date

### 🌐 Web Dashboard
- Responsive design works on desktop, tablet, and mobile
- Dark mode optimized for plant growing environments
- Real-time updates without page refresh

## 🚀 Quick Start

See [QUICK_START.md](docs/QUICK_START.md) for 5-minute setup guide.

## 📚 Documentation

- **[Setup Guide](docs/SETUP_GUIDE.md)** - Complete installation and deployment
- **[ESP32 API Guide](docs/ESP32_API_GUIDE.md)** - Hardware integration instructions
- **[Notifications Guide](docs/NOTIFICATIONS_GUIDE.md)** - Alert system configuration

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI**: Vercel AI SDK with GPT-4o-mini
- **Charts**: Recharts
- **Hardware**: ESP32 with DHT22, soil moisture, and BH1750 sensors

## 📋 Requirements

- Node.js 18+ 
- Supabase account (free tier works)
- (Optional) ESP32 and sensors for hardware integration

## 🔌 Hardware Support

Compatible with ESP32-based systems featuring:
- DHT22 temperature/humidity sensor
- Capacitive soil moisture sensor
- BH1750 light sensor
- Relay modules for pump, fan, and light control

See [ESP32_API_GUIDE.md](docs/ESP32_API_GUIDE.md) for wiring diagrams and code.

## 🗄️ Database Schema

- **plants** - Plant profiles and metadata
- **sensor_readings** - Time-series sensor data
- **control_states** - Device control states
- **ai_predictions** - AI-generated care recommendations
- **notifications** - Alert and notification history

All tables include Row Level Security policies.

## 📡 API Endpoints

### For Web App
- `POST /api/ai/analyze-plant` - Generate AI predictions
- `POST /api/cron/check-alerts` - Automated alert monitoring (Vercel Cron)

### For ESP32
- `POST /api/esp32/sensor-data` - Upload sensor readings
- `GET /api/esp32/controls?device_id={id}` - Fetch control states
- `POST /api/esp32/heartbeat` - Device health check

## 🌟 Key Features Explained

### Sensor Data Collection
ESP32 devices send data every 30 seconds via REST API. Historical data is stored for trend analysis and AI predictions.

### AI Predictions
Uses GPT-4o-mini to analyze current readings + 24-hour historical data. Generates specific recommendations like "Increase watering frequency" or "Add more light during daytime."

### Automated Alerts
Vercel Cron checks sensor data every 15 minutes. Triggers notifications for:
- Soil moisture < 30%
- Temperature < 10°C or > 35°C
- Light < 100 lux during daytime

### Device Control
Web dashboard updates control states in database. ESP32 polls every 10 seconds and actuates relays accordingly.

## 🔒 Security

- Row Level Security (RLS) on all Supabase tables
- Environment variables for sensitive credentials
- Service role key never exposed to client
- Device authentication via unique device IDs

## 🚢 Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Connect repository in Vercel
3. Add environment variables
4. Deploy

Or use the "Publish" button directly in v0.

### Environment Variables Needed
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
\`\`\`

See [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for complete list.

## 📈 Future Enhancements

- [ ] Mobile app with push notifications
- [ ] Multi-user support with authentication
- [ ] Advanced analytics and growth predictions
- [ ] Integration with weather APIs
- [ ] Camera module for visual plant monitoring
- [ ] Automated watering schedules
- [ ] Plant growth timelapse generation

## 🤝 Contributing

This is a v0-generated project. To modify:
1. Make changes locally
2. Test thoroughly
3. Deploy to your own Vercel project

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🆘 Support

- **Setup Help**: See [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
- **Hardware Issues**: See [ESP32_API_GUIDE.md](docs/ESP32_API_GUIDE.md)
- **v0 Support**: [vercel.com/help](https://vercel.com/help)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

Built with ❤️ using v0 by Vercel
