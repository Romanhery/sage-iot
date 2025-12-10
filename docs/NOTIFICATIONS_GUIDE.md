# Notifications System Guide

The PlantAI system includes an intelligent notification system that automatically alerts you to critical plant care issues.

## How It Works

The system continuously monitors sensor data and triggers notifications when:

1. **Low Soil Moisture** - Soil moisture drops below 25%
2. **High Temperature** - Temperature exceeds 35°C
3. **Low Temperature** - Temperature drops below 10°C
4. **Insufficient Light** - Light levels fall below 150 lux

## Alert Frequency

- Alerts are checked every 15 minutes via Vercel Cron
- Duplicate notifications are prevented (1-hour cooldown per alert type per plant)
- Notifications remain in your inbox until marked as read

## Accessing Notifications

1. Click the notification bell icon in the header
2. Unread notifications show a red badge with count
3. Click any notification to view the affected plant
4. Use "Mark All Read" to clear all unread notifications

## Notification Details

Each notification includes:
- Alert title and detailed message
- Plant name and type
- Time since the alert was triggered
- Visual indicator for unread status

## Future Enhancements

Planned features:
- Email notifications
- SMS alerts for critical issues
- Custom alert thresholds per plant
- Notification preferences and muting
- Push notifications for mobile devices

## Technical Implementation

The notification system uses:
- **Database**: Supabase notifications table
- **Cron Jobs**: Vercel Cron for automated checking
- **Server Actions**: Real-time mark as read functionality
- **Smart Deduplication**: Prevents notification spam

## Customization

To modify alert thresholds, edit `lib/notifications/trigger-alerts.ts`:

\`\`\`typescript
// Example: Change low moisture threshold from 25% to 20%
if (latest.soil_moisture < 20) {
  // ... alert logic
}
\`\`\`

To change the cron schedule, edit `vercel.json`:

\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/check-alerts",
      "schedule": "*/30 * * * *"  // Check every 30 minutes
    }
  ]
}
\`\`\`
